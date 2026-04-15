# Remote Virtual Filesystem (RVFS) — Design Specification

> **Status:** Draft — not yet implemented.
> **Scope:** Complete redesign of the browser-side VFS to support remote-backed storage,
> session-aware access, Linux semantics, forking, TTL-based expiry, and offline
> write-ahead caching.  The existing static-overlay VFS (base/setup/active layers) is
> unaffected until this spec reaches the implementation phase.

---

## Table of Contents

1. [Goals & Non-Goals](#1-goals--non-goals)
2. [Concepts & Terminology](#2-concepts--terminology)
3. [Node Model](#3-node-model)
4. [Filesystem Graph](#4-filesystem-graph)
5. [Linux Metadata & Permissions](#5-linux-metadata--permissions)
6. [Sessions](#6-sessions)
7. [TTL & Expiry](#7-ttl--expiry)
8. [Forking](#8-forking)
9. [Storage-Agnostic Server API](#9-storage-agnostic-server-api)
10. [Client Library API](#10-client-library-api)
11. [Caching Architecture](#11-caching-architecture)
12. [Offline Mode & Sync](#12-offline-mode--sync)
13. [Error Model](#13-error-model)
14. [Security Considerations](#14-security-considerations)
15. [Appendix A — JSON Schemas](#appendix-a--json-schemas)

---

## 1. Goals & Non-Goals

### Goals

| # | Goal |
|---|------|
| G1 | Every filesystem lives remotely; the browser holds only a read/write cache. |
| G2 | Meta information (directory trees, permissions, symlinks) and binary content (file blobs) are stored as independent retrieval units so they can be fetched and cached separately. |
| G3 | Full POSIX-style path resolution, permissions, and metadata (owner, group, mode, atime/mtime/ctime). |
| G4 | First-class support for: `create`, `read`, `write`, `rm`, `mv`, `cp`, `mkdir`, `rmdir`. |
| G5 | Filesystems can be *forked* — a cheap copy-on-write snapshot that diverges from its parent on first mutation. |
| G6 | Both guest (anonymous) and authenticated sessions are supported with appropriate privilege limits. |
| G7 | Every node and every filesystem carries an optional TTL after which the server may purge it. |
| G8 | The server API is storage-agnostic; backends (R2, S3, Postgres, KV, in-memory) swap behind the same interface. |
| G9 | The client library hides remote calls behind a synchronous-style Promise API and maintains an in-browser LRU cache to minimise round trips. |
| G10 | A full offline mode allows continued local writes when the remote is unavailable; changes are queued and replayed on reconnect. |

### Non-Goals

- Replacing or modifying the current `base/setup/active` static-overlay VFS before the implementation phase.
- Real kernel-level FUSE mounting or OS-level filesystem access.
- Binary diff/patch merge (conflicts resolve to last-write-wins unless the host app opts into three-way merge).
- Real-time collaborative editing within a single file (a separate concern).

---

## 2. Concepts & Terminology

| Term | Definition |
|------|------------|
| **Filesystem (FS)** | A named, isolated tree with its own root node, permissions namespace, and TTL. |
| **Node** | The atomic storage unit. Nodes are either *meta nodes* or *blob nodes*. |
| **Meta node** | A JSON document describing a root, directory, or file (including its metadata and child/blob references). |
| **Blob node** | Raw binary content (Uint8Array / ArrayBuffer) referenced by exactly one file meta node. |
| **Node ID (nid)** | An opaque, globally unique string (recommended: UUID v4 or a content-addressed hash). |
| **FS ID (fsid)** | An opaque, globally unique string identifying a filesystem. |
| **Fork** | A copy-on-write clone of a filesystem that shares blob nodes with its parent until mutation. |
| **Session** | A time-bounded context that maps an identity (guest or user) to a set of filesystems and their access rights. |
| **TTL** | A duration after which a node or filesystem is eligible for server-side garbage collection. |
| **Write cache** | In-browser IndexedDB store of pending writes that have not yet been confirmed by the server. |
| **Read cache** | In-memory LRU map of recently fetched nodes, keyed by nid. |

---

## 3. Node Model

### 3.1 Meta Nodes

Meta nodes are pure JSON. Three sub-types exist.

#### 3.1.1 Root Meta Node (`fs.meta`)

The entry point of a filesystem. Fetched first on mount.

```jsonc
{
  "nid":        "string — unique node ID for this root",
  "type":       "root",
  "fsid":       "string — ID of the filesystem this root belongs to",
  "label":      "string — human-readable FS label, e.g. 'learner-sandbox'",
  "created_at": "ISO-8601",
  "updated_at": "ISO-8601",
  "ttl":        "number | null — seconds until eligible for server expiry (null = forever)",
  "owner":      "string — user ID or 'guest'",
  "fork_of":    "string | null — fsid of parent FS if this is a fork",
  "fork_depth": "number — 0 for original, increments per fork level",
  "children":   ["string"] // nids of top-level directory and file meta nodes
}
```

#### 3.1.2 Directory Meta Node

```jsonc
{
  "nid":        "string",
  "type":       "dir",
  "name":       "string — entry name in its parent (e.g. 'home')",
  "parent_nid": "string | null — null only for items directly under root",
  "fsid":       "string",
  "created_at": "ISO-8601",
  "updated_at": "ISO-8601",
  "ttl":        "number | null",
  "meta":       { /* LinuxMeta — see §5 */ },
  "children":   ["string"] // nids of contained directory and file meta nodes
}
```

#### 3.1.3 File Meta Node

```jsonc
{
  "nid":        "string",
  "type":       "file",
  "name":       "string",
  "parent_nid": "string | null",
  "fsid":       "string",
  "created_at": "ISO-8601",
  "updated_at": "ISO-8601",
  "ttl":        "number | null",
  "meta":       { /* LinuxMeta — see §5 */ },
  "blob_nid":   "string | null — null for empty files or symlinks",
  "size":       "number — byte count of blob content",
  "symlink_target": "string | null — absolute VFS path; mutually exclusive with blob_nid"
}
```

### 3.2 Blob Nodes

Blob nodes carry raw binary content with minimal envelope metadata. They are stored and transferred as binary (e.g., `application/octet-stream`), with a small header stored separately for cheap `HEAD` queries.

#### Blob Header (JSON, side-channel)

```jsonc
{
  "nid":         "string",
  "type":        "blob",
  "fsid":        "string",
  "size":        "number",
  "mime_type":   "string — IANA media type, e.g. 'text/plain; charset=utf-8'",
  "sha256":      "string — hex-encoded SHA-256 of content, for integrity checks",
  "created_at":  "ISO-8601",
  "ttl":         "number | null",
  "ref_count":   "number — number of file meta nodes pointing to this blob (for CoW and GC)"
}
```

> **Content addressing (optional optimisation):** An implementation MAY derive `nid` from the SHA-256 of the blob content. This enables automatic deduplication — two files with identical content share a single blob node. The client library always treats `nid` as opaque.

### 3.3 Node ID Namespacing

All node IDs share a single namespace on the server regardless of type. Clients MUST NOT assume structure in a node ID. Implementations SHOULD use 128-bit random UUIDs (v4) or SHA-256 prefixes of sufficient length to avoid collision.

---

## 4. Filesystem Graph

### 4.1 Graph Shape

```
fs.meta (root meta node)
 └── nid → dir meta node          (/home)
      └── nid → dir meta node     (/home/learner)
           ├── nid → file meta    (/home/learner/.bashrc)
           │         └── blob_nid → blob node
           └── nid → file meta    (/home/learner/notes.txt)
                     └── blob_nid → blob node
```

### 4.2 Path Resolution

Paths are resolved from the root by:

1. Splitting the path on `/`.
2. Starting at `fs.meta.children`.
3. For each segment, fetching the child meta node whose `name` matches the segment.
4. Returning the final node (file or directory).

The client library resolves the full path depth-first with cache hits, issuing one parallel batch request per directory level for any cache misses.

### 4.3 Hardlinks and Symlinks

- **Symlink:** A file meta node with `symlink_target` set and `blob_nid` null. The client resolves symlinks up to a depth of 40 (POSIX limit) before returning `ELOOP`.
- **Hardlink:** Not a separate node type. Two file meta nodes in the same filesystem MAY share the same `blob_nid`; `ref_count` on the blob header tracks this. When `ref_count` reaches zero the blob is eligible for GC.

---

## 5. Linux Metadata & Permissions

Every meta node includes a `meta` object with full POSIX-style attributes.

```jsonc
{
  "mode":   "number — Unix permission bits (octal 0o755 stored as decimal 493)",
  "uid":    "number — numeric user ID (0 = root, 1000 = default learner)",
  "gid":    "number — numeric group ID",
  "atime":  "ISO-8601 — last access time",
  "mtime":  "ISO-8601 — last content modification time",
  "ctime":  "ISO-8601 — last metadata change time",
  "nlink":  "number — number of hard links (always ≥ 1)",
  "inode":  "number — virtual inode number (stable within a session; derived from nid)"
}
```

### 5.1 Permission Checks

The client library enforces permissions client-side as a convenience layer. The server MUST also enforce permissions for all mutating operations.

| Check | Rule |
|-------|------|
| Read file | `(mode >> 6) & 1` if uid matches, `(mode >> 3) & 1` if gid matches, else `mode & 1`. |
| Write file | Same shift but bit `1` (write). |
| Execute / traverse dir | Same shift but bit `0` (execute). |
| Setuid / setgid | Bits 11–10 of mode; respected for path resolution only. |

### 5.2 Default Modes

| Node type | Default mode |
|-----------|--------------|
| Regular file | `0o644` |
| Executable file | `0o755` |
| Directory | `0o755` |
| Symlink | `0o777` (POSIX: permissions on the link are irrelevant) |

### 5.3 Special File Types

The `meta.mode` high bits encode special file types following POSIX `st_mode` conventions:

| Constant | Octal mask | Meaning |
|----------|-----------|---------|
| `S_IFREG` | `0o100000` | Regular file |
| `S_IFDIR` | `0o040000` | Directory |
| `S_IFLNK` | `0o120000` | Symbolic link |
| `S_IFIFO` | `0o010000` | Named pipe (simulated) |

---

## 6. Sessions

### 6.1 Session Object

```jsonc
{
  "session_id":  "string — opaque token (UUID v4 recommended)",
  "identity":    "guest | string (user ID)",
  "created_at":  "ISO-8601",
  "expires_at":  "ISO-8601",
  "ttl_seconds": "number",
  "filesystems": [
    {
      "fsid":   "string",
      "access": "read | write | admin"
    }
  ],
  "metadata":    { /* arbitrary key/value for host app use */ }
}
```

### 6.2 Guest Sessions

- Identity is `"guest"`.
- The server assigns a TTL of at most 24 hours by default (configurable per deployment).
- Guest sessions may be limited to a single filesystem or a preconfigured fork of a baseline FS.
- No PII is collected; `metadata` may store a transient learner context (e.g., current lesson slug).

### 6.3 Authenticated Sessions

- Identity is a user ID from the host app's auth provider.
- Sessions may be long-lived (30 days) or tied to an OAuth token expiry.
- A user may own multiple filesystems and may grant other users `read` or `write` access.

### 6.4 Session Lifecycle

```
CREATE → ACTIVE ──(TTL expires or explicit logout)──→ EXPIRED
                └──(manual revoke)──────────────────→ REVOKED
```

Expired and revoked sessions return `401 Unauthorized` on all subsequent requests.

---

## 7. TTL & Expiry

TTL is specified in **seconds** and is advisory. The server SHOULD honour it during garbage collection runs but MAY defer eviction under storage pressure.

### 7.1 Inheritance

A node's effective TTL is the minimum of:
1. Its own `ttl` field.
2. Its filesystem's root `ttl` field.
3. The owning session's `expires_at` (converted to seconds from now).

### 7.2 Renewal

Clients MAY extend TTL by calling the `PATCH /fs/{fsid}/ttl` or `PATCH /node/{nid}/ttl` endpoints with a new `ttl` value. Authenticated users may extend indefinitely; guest users are capped at the deployment maximum.

### 7.3 Soft vs. Hard Expiry

| Phase | Description |
|-------|-------------|
| **Soft expiry** | Node/FS is marked `expired`; reads still succeed but return a `X-Expired: true` header. The server may serve stale data. |
| **Hard expiry** | Node/FS is deleted; reads return `404`. Soft-to-hard gap defaults to 1 hour (configurable). |

---

## 8. Forking

### 8.1 Model

A fork is a **copy-on-write (CoW)** snapshot of a filesystem at a point in time.

- Immediately after forking, the child FS has no nodes of its own — all reads fall through to the parent.
- On first write to any node in the child, the client library checks if the target node is owned by the child; if not, it creates a new node in the child (copying the parent's node data), then applies the mutation.
- Blob nodes are shared until written: a write to a file creates a new blob node in the child, decrements `ref_count` on the parent blob, and sets `blob_nid` on the new file meta node to point to the new blob.

### 8.2 Fork Resolution Order

```
child FS nodes (own writes)  →  parent FS nodes  →  grandparent FS nodes  …
```

The client library resolves this chain by following `fork_of` pointers in `fs.meta` until a node is found or the chain is exhausted. `fork_depth` limits the chain to 16 levels by default (configurable) to bound latency.

### 8.3 Fork API

```
POST /fs/{fsid}/fork
Body: { label, ttl, owner }
Response: { fsid, root_nid, fork_of, fork_depth }
```

### 8.4 Merge (Future Extension)

Full merge of a fork back into its parent is outside the scope of this specification and will be addressed separately. The fork chain structure is designed to support three-way merge tooling.

---

## 9. Storage-Agnostic Server API

All responses are `application/json` unless noted. Binary responses use `application/octet-stream`. Authentication is via `Authorization: Bearer <session_id>` header.

### 9.1 Filesystem Management

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/fs` | Create a new filesystem |
| `GET` | `/fs/{fsid}` | Fetch `fs.meta` (root node) |
| `PATCH` | `/fs/{fsid}` | Update FS label or TTL |
| `DELETE` | `/fs/{fsid}` | Delete filesystem and all owned nodes |
| `POST` | `/fs/{fsid}/fork` | Fork this filesystem |
| `GET` | `/fs/{fsid}/nodes` | List all node IDs (paginated) |
| `PATCH` | `/fs/{fsid}/ttl` | Renew filesystem TTL |

#### `POST /fs` — Create Filesystem

Request:
```jsonc
{
  "label":    "string",
  "ttl":      "number | null",
  "template": "string | null — fsid of a filesystem to fork as the initial state"
}
```

Response `201 Created`:
```jsonc
{
  "fsid":     "string",
  "root_nid": "string",
  "label":    "string",
  "created_at": "ISO-8601"
}
```

### 9.2 Node Operations

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/node/{nid}` | Fetch meta or blob header |
| `PUT` | `/node/{nid}` | Create or replace a meta node |
| `PATCH` | `/node/{nid}` | Partial update of a meta node (metadata fields only) |
| `DELETE` | `/node/{nid}` | Delete a node (server enforces ref_count for blobs) |
| `PATCH` | `/node/{nid}/ttl` | Renew node TTL |

### 9.3 Blob Operations

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/blob` | Upload new blob; returns `{ nid, sha256, size }` |
| `GET` | `/blob/{nid}` | Download blob content (`application/octet-stream`) |
| `HEAD` | `/blob/{nid}` | Fetch blob header only (size, mime, sha256) |
| `DELETE` | `/blob/{nid}` | Delete blob (only when `ref_count === 0`) |

#### `POST /blob` — Upload

- Body: raw binary (`Content-Type: application/octet-stream`)
- Query parameters: `fsid` (required), `mime_type`, `ttl`
- Response `201 Created`:
```jsonc
{ "nid": "string", "sha256": "string", "size": 12345, "mime_type": "text/plain" }
```

### 9.4 Filesystem Operations (High-Level)

These are convenience endpoints that the server executes atomically, avoiding the client having to orchestrate multiple node mutations.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/fs/{fsid}/op/create` | Create a file or directory at a path |
| `POST` | `/fs/{fsid}/op/read` | Resolve a path and return meta + optional blob |
| `POST` | `/fs/{fsid}/op/write` | Write content to a file path (creates/replaces blob) |
| `POST` | `/fs/{fsid}/op/rm` | Remove a file or directory (recursive optional) |
| `POST` | `/fs/{fsid}/op/mv` | Move / rename a node |
| `POST` | `/fs/{fsid}/op/cp` | Copy a file or directory tree |

#### `POST /fs/{fsid}/op/create`

```jsonc
{
  "path":    "/home/learner/hello.txt",
  "type":    "file | dir | symlink",
  "meta":    { /* partial LinuxMeta override */ },
  "content": "string | null — UTF-8 text for file type",
  "symlink_target": "string | null",
  "ttl":     "number | null"
}
```

Response `201 Created`:
```jsonc
{ "nid": "string", "path": "/home/learner/hello.txt" }
```

#### `POST /fs/{fsid}/op/write`

```jsonc
{
  "path":    "/home/learner/hello.txt",
  "content": "string — UTF-8 text",
  "binary":  false,
  "append":  false,
  "create_if_missing": true
}
```

For binary writes, use `Content-Type: multipart/form-data` with fields `path` and `file`.

#### `POST /fs/{fsid}/op/mv`

```jsonc
{ "src": "/home/learner/old.txt", "dst": "/home/learner/new.txt" }
```

#### `POST /fs/{fsid}/op/cp`

```jsonc
{
  "src":       "/home/learner/notes",
  "dst":       "/home/learner/notes-backup",
  "recursive": true,
  "no_clobber": false
}
```

#### `POST /fs/{fsid}/op/rm`

```jsonc
{ "path": "/home/learner/trash", "recursive": true }
```

### 9.5 Session Management

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/session` | Create a new session |
| `GET` | `/session/{session_id}` | Fetch session info |
| `DELETE` | `/session/{session_id}` | Expire/revoke session |
| `PATCH` | `/session/{session_id}/ttl` | Renew session TTL |

#### `POST /session`

Request:
```jsonc
{
  "identity":    "guest | string",
  "ttl_seconds": 86400,
  "filesystems": [{ "fsid": "string", "access": "write" }]
}
```

Response `201 Created`: full session object (see §6.1).

### 9.6 Batch Request

To reduce round trips the server MUST support a batch endpoint:

```
POST /batch
Body: { "requests": [ { "id": "1", "method": "GET", "path": "/node/{nid}" }, … ] }
Response: { "responses": [ { "id": "1", "status": 200, "body": { … } }, … ] }
```

Maximum batch size: 100 operations per request.

### 9.7 Response Headers

| Header | Meaning |
|--------|---------|
| `X-Node-TTL` | Remaining TTL in seconds for the returned node |
| `X-FS-TTL` | Remaining TTL in seconds for the filesystem |
| `X-Expired: true` | Node/FS is in soft-expiry phase |
| `ETag` | SHA-256 of node content for conditional requests |
| `Cache-Control` | Standard HTTP cache directive; server sets based on TTL |

### 9.8 Storage Backend Interface (Server-Side)

Implementations MUST satisfy the following abstract interface. The HTTP layer is coupled only to this interface, not to any concrete storage system.

```typescript
interface StorageBackend {
  // Meta nodes
  getMeta(nid: string): Promise<MetaNode | null>;
  putMeta(node: MetaNode): Promise<void>;
  patchMeta(nid: string, patch: Partial<MetaNode>): Promise<MetaNode>;
  deleteMeta(nid: string): Promise<void>;

  // Blob nodes
  getBlobHeader(nid: string): Promise<BlobHeader | null>;
  getBlob(nid: string): Promise<ArrayBuffer | null>;
  putBlob(header: BlobHeader, content: ArrayBuffer): Promise<string>; // returns nid
  deleteBlob(nid: string): Promise<void>;

  // Filesystem root
  getFS(fsid: string): Promise<RootMetaNode | null>;
  putFS(root: RootMetaNode): Promise<void>;
  deleteFS(fsid: string): Promise<void>;
  listFSNodes(fsid: string, cursor?: string, limit?: number): Promise<{ nids: string[]; cursor: string | null }>;

  // Sessions
  getSession(sessionId: string): Promise<Session | null>;
  putSession(session: Session): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;

  // GC helpers
  listExpiredNodes(before: Date): Promise<string[]>;
  listExpiredFS(before: Date): Promise<string[]>;
}
```

---

## 10. Client Library API

The client library (`RvfsClient`) runs in the browser and exposes a POSIX-inspired interface backed by remote calls with local caching.

### 10.1 Initialisation

```typescript
import { RvfsClient } from '@itedu/rvfs-client';

const client = new RvfsClient({
  baseUrl:          'https://api.example.com/rvfs/v1',
  sessionId:        'uuid-from-auth',        // or omit for guest
  fsid:             'uuid-of-filesystem',
  cacheMaxNodes:    256,                      // LRU node cache size
  cacheMaxBlobMb:   32,                       // max MB for in-memory blob cache
  offlineFallback:  true,                     // enable offline write-ahead queue
  syncOnReconnect:  true,
});

await client.mount();   // fetches fs.meta, populates root cache entry
```

### 10.2 Core Operations

All methods return Promises and throw `RvfsError` on failure (see §13).

```typescript
// ── Read ──────────────────────────────────────────────────────────────────────

// Resolve a path and return its meta node
stat(path: string): Promise<FileMeta | DirMeta>

// Read text content of a file
readText(path: string): Promise<string>

// Read binary content of a file
readBinary(path: string): Promise<Uint8Array>

// List directory entries (returns names only)
readdir(path: string): Promise<string[]>

// List directory with full stat info for each entry
readdirWithTypes(path: string): Promise<Array<{ name: string; stat: FileMeta | DirMeta }>>

// Resolve a symlink chain to its final target
realpath(path: string): Promise<string>

// ── Write ─────────────────────────────────────────────────────────────────────

// Create a file (text)
writeText(path: string, content: string, options?: WriteOptions): Promise<void>

// Create a file (binary)
writeBinary(path: string, content: Uint8Array, options?: WriteOptions): Promise<void>

// Append text to a file
appendText(path: string, content: string): Promise<void>

// ── Directory ─────────────────────────────────────────────────────────────────

mkdir(path: string, options?: { parents?: boolean; mode?: number }): Promise<void>
rmdir(path: string, options?: { recursive?: boolean }): Promise<void>

// ── File management ───────────────────────────────────────────────────────────

rm(path: string, options?: { recursive?: boolean; force?: boolean }): Promise<void>
mv(src: string, dst: string): Promise<void>
cp(src: string, dst: string, options?: { recursive?: boolean }): Promise<void>
symlink(target: string, path: string): Promise<void>

// ── Metadata ──────────────────────────────────────────────────────────────────

chmod(path: string, mode: number): Promise<void>
chown(path: string, uid: number, gid: number): Promise<void>
utimes(path: string, atime: Date, mtime: Date): Promise<void>

// ── Existence helpers ─────────────────────────────────────────────────────────

exists(path: string): Promise<boolean>
isFile(path: string): Promise<boolean>
isDir(path: string): Promise<boolean>
```

### 10.3 WriteOptions

```typescript
interface WriteOptions {
  mode?:            number;   // default 0o644
  createParents?:   boolean;  // default false
  noClobber?:       boolean;  // fail if file exists (default false)
  ttl?:             number;   // node TTL in seconds (inherits FS TTL if unset)
}
```

### 10.4 Forking

```typescript
// Fork the current filesystem; returns a new RvfsClient bound to the fork
fork(options?: { label?: string; ttl?: number }): Promise<RvfsClient>

// Check if a path exists in the current FS (not inherited from parent fork)
isOwned(path: string): Promise<boolean>
```

### 10.5 Cache Control

```typescript
// Manually invalidate one or more paths in the read cache
invalidate(...paths: string[]): void

// Prefetch and warm the cache for a directory subtree
prefetch(dir: string, depth?: number): Promise<void>

// Return current cache statistics
cacheStats(): { hits: number; misses: number; evictions: number; sizeNodes: number; sizeBlobBytes: number }
```

### 10.6 Session Management

```typescript
// Renew the session TTL
renewSession(ttlSeconds: number): Promise<void>

// Gracefully terminate the session (logs out guest, ends auth session)
endSession(): Promise<void>
```

### 10.7 Offline & Sync

```typescript
// Current connectivity state
readonly online: boolean

// Subscribe to connectivity and sync events
on(event: 'online' | 'offline' | 'sync:start' | 'sync:complete' | 'sync:error', handler: (e: RvfsEvent) => void): void

// Manually trigger sync of the write-ahead queue
sync(): Promise<SyncResult>

// Inspect pending writes in the WAL
getPendingWrites(): Promise<PendingWrite[]>

// Discard a specific pending write (use with care)
discardPendingWrite(id: string): Promise<void>
```

---

## 11. Caching Architecture

### 11.1 Read Cache (In-Memory LRU)

- **Scope:** Per `RvfsClient` instance.
- **Key:** Node ID (`nid`).
- **Value:** Deserialized meta node or blob `Uint8Array`.
- **Eviction:** LRU with configurable `cacheMaxNodes` and `cacheMaxBlobMb` limits.
- **TTL awareness:** Each cache entry stores `cached_at + node_ttl`; entries are treated as stale on access if `Date.now() > expires_at`. Stale entries trigger a background revalidation (stale-while-revalidate) and serve the cached value immediately.
- **Directory listings:** Directory children arrays are cached at the directory meta node level. Any mutation to a directory's contents invalidates its cache entry.
- **Path → nid index:** A secondary `Map<path, nid>` allows O(1) path lookups without walking the tree. Invalidated on any `mv`, `rm`, `mkdir`, or `create` that affects the path.

### 11.2 Persistent Cache (IndexedDB)

- **Scope:** Per origin (shared across tabs for the same user).
- **Store `nodes`:** Serialized meta nodes keyed by `nid`.
- **Store `blobs`:** Blob content keyed by `nid` (limit configurable; default 128 MB total).
- **Store `wal`:** Write-ahead log entries (see §12).
- **Versioning:** Schema version is stored; upgrades run automatically via `onupgradeneeded`.
- **Reads:** The in-memory LRU is populated from IndexedDB on first access (cache miss in memory → check IDB → fallback to network).
- **Writes (confirmed):** After a successful remote write, the updated node is written back to both IDB and the in-memory LRU.

### 11.3 HTTP Layer Caching

- The server sets `Cache-Control: max-age=<ttl_seconds>, stale-while-revalidate=60` on meta node responses.
- Blob responses are immutable if the `nid` is content-addressed: `Cache-Control: public, max-age=31536000, immutable`.
- The client library uses a `fetch` wrapper that checks `ETag` / `If-None-Match` for conditional GET to avoid re-downloading unchanged nodes.

### 11.4 Batch Prefetch Strategy

When traversing a directory tree (e.g., `cp -r`, `rm -rf`, `prefetch()`), the client library:

1. Fetches the directory meta node to get `children`.
2. Fans out a single batch request (`POST /batch`) for all child `nid`s.
3. Populates the cache before any child is individually accessed.

This reduces a tree of depth D with branching factor B from O(D × B) serial requests to O(D) batch requests.

---

## 12. Offline Mode & Sync

### 12.1 Write-Ahead Log (WAL)

When the client library detects the remote is unavailable (network error or explicit `offline` mode), all mutating operations are appended to the WAL in IndexedDB instead of being sent to the server.

#### WAL Entry Schema

```jsonc
{
  "id":         "string — UUID v4",
  "fsid":       "string",
  "op":         "create | write | rm | mv | cp | mkdir | rmdir | chmod | chown",
  "path":       "string",
  "args":       { /* operation-specific payload */ },
  "queued_at":  "ISO-8601",
  "status":     "pending | syncing | done | conflict | error",
  "retry":      "number — retry count",
  "error":      "string | null"
}
```

Reads during offline mode are served entirely from the in-memory LRU and IDB caches. If a requested node is not in any cache and the remote is unavailable, the operation rejects with `RvfsError { code: 'OFFLINE', message: '...' }`.

### 12.2 Optimistic Local Application

The client library applies WAL operations to the in-memory and IDB caches immediately (optimistically), so the local view reflects pending writes. The WAL entry remains `pending` until the remote confirms.

### 12.3 Sync Protocol

When the client reconnects (detected via `navigator.onLine` event + a health-check ping to `GET /ping`):

1. The client fetches all `pending` WAL entries in FIFO order.
2. For each entry, it replays the operation against the remote API.
3. On success: marks WAL entry `done`, updates the remote nid if it changed (e.g., a blob nid was assigned server-side).
4. On conflict (`409 Conflict` from server): marks WAL entry `conflict`, emits `sync:error` event with details. The host app MUST handle conflict resolution (default: last-write-wins can be opted into by setting `conflictPolicy: 'overwrite'` in client config).
5. On non-retryable error: marks `error`, emits event.
6. On retryable error (network glitch, `503`): increments `retry`, re-queues at the back of the FIFO.

### 12.4 Offline-Only Mode

Setting `offlineFallback: true, remoteUrl: null` in the client config creates a fully local-only RVFS backed only by IndexedDB with no remote sync. This is the deployment mode for `<TerminalSandbox>` scenarios where network persistence is undesired.

---

## 13. Error Model

All errors thrown by the client library are instances of `RvfsError`.

```typescript
class RvfsError extends Error {
  code:    string;    // POSIX-style or RVFS-specific code
  path?:   string;    // affected path, if applicable
  nid?:    string;    // affected node ID, if applicable
  status?: number;    // HTTP status from server, if applicable
}
```

### Error Codes

| Code | POSIX equivalent | Description |
|------|-----------------|-------------|
| `ENOENT` | `ENOENT` | Path does not exist |
| `EEXIST` | `EEXIST` | Path already exists (e.g., `noClobber`) |
| `ENOTDIR` | `ENOTDIR` | Expected a directory, found a file |
| `EISDIR` | `EISDIR` | Expected a file, found a directory |
| `EACCES` | `EACCES` | Permission denied |
| `ELOOP` | `ELOOP` | Too many levels of symbolic links |
| `ENOTEMPTY` | `ENOTEMPTY` | Directory not empty (rm without recursive) |
| `ENAMETOOLONG` | `ENAMETOOLONG` | Path segment exceeds 255 characters |
| `ENOSPC` | `ENOSPC` | Storage quota exceeded |
| `OFFLINE` | — | Remote unavailable and no cache entry |
| `EXPIRED` | — | Node or filesystem has hard-expired |
| `FORBIDDEN` | — | Session lacks access to this filesystem |
| `CONFLICT` | — | WAL replay conflict during sync |
| `TIMEOUT` | — | Remote request timed out |

---

## 14. Security Considerations

### 14.1 Session Token Isolation

Session IDs are used as bearer tokens. Implementations MUST:

- Generate session IDs with at least 128 bits of entropy (UUID v4 meets this).
- Transmit session IDs over HTTPS only.
- Store session IDs in `sessionStorage` (not `localStorage`) to limit cross-tab exposure for guest sessions. Authenticated sessions MAY use `localStorage` with the consent of the host app.

### 14.2 Server-Side Authorisation

The client library enforces permissions as a UX convenience. The **server MUST** re-validate all access control rules independently:

1. Verify the `Authorization: Bearer` token maps to a valid, non-expired session.
2. Verify the session has the required access level (`read` / `write` / `admin`) for the target `fsid`.
3. Verify POSIX permission bits for the requesting `uid`/`gid`.

### 14.3 Blob Integrity

All blob uploads include a `sha256` hash. The server MUST verify the hash before storing and return `400 Bad Request` on mismatch. The client library verifies the hash on download before serving content to the caller.

### 14.4 Path Traversal

The server MUST canonicalise all paths by resolving `.` and `..` segments before lookup. Paths that escape the filesystem root (`/..`) MUST be rejected with `400 Bad Request`.

### 14.5 Quota Enforcement

Each filesystem has an optional `quota_bytes` field in `fs.meta`. The server MUST track cumulative blob sizes per `fsid` and return `507 Insufficient Storage` when a write would exceed the quota.

### 14.6 Fork Chain Depth

To prevent unbounded fork chains (which could enable DoS through resolution cost), servers SHOULD enforce a maximum `fork_depth` (default: 16). Fork operations that would exceed this limit MUST return `400 Bad Request`.

---

## Appendix A — JSON Schemas

### A.1 LinuxMeta

```jsonc
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "LinuxMeta",
  "type": "object",
  "required": ["mode", "uid", "gid", "atime", "mtime", "ctime", "nlink"],
  "properties": {
    "mode":  { "type": "integer", "minimum": 0, "maximum": 65535 },
    "uid":   { "type": "integer", "minimum": 0 },
    "gid":   { "type": "integer", "minimum": 0 },
    "atime": { "type": "string", "format": "date-time" },
    "mtime": { "type": "string", "format": "date-time" },
    "ctime": { "type": "string", "format": "date-time" },
    "nlink": { "type": "integer", "minimum": 1 },
    "inode": { "type": "integer" }
  }
}
```

### A.2 FileMetaNode

```jsonc
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "FileMetaNode",
  "type": "object",
  "required": ["nid", "type", "name", "fsid", "created_at", "updated_at", "meta", "size"],
  "properties": {
    "nid":            { "type": "string" },
    "type":           { "type": "string", "const": "file" },
    "name":           { "type": "string", "maxLength": 255 },
    "parent_nid":     { "type": ["string", "null"] },
    "fsid":           { "type": "string" },
    "created_at":     { "type": "string", "format": "date-time" },
    "updated_at":     { "type": "string", "format": "date-time" },
    "ttl":            { "type": ["integer", "null"], "minimum": 0 },
    "meta":           { "$ref": "#/definitions/LinuxMeta" },
    "blob_nid":       { "type": ["string", "null"] },
    "size":           { "type": "integer", "minimum": 0 },
    "symlink_target": { "type": ["string", "null"] }
  }
}
```

### A.3 DirMetaNode

```jsonc
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "DirMetaNode",
  "type": "object",
  "required": ["nid", "type", "name", "fsid", "created_at", "updated_at", "meta", "children"],
  "properties": {
    "nid":        { "type": "string" },
    "type":       { "type": "string", "const": "dir" },
    "name":       { "type": "string", "maxLength": 255 },
    "parent_nid": { "type": ["string", "null"] },
    "fsid":       { "type": "string" },
    "created_at": { "type": "string", "format": "date-time" },
    "updated_at": { "type": "string", "format": "date-time" },
    "ttl":        { "type": ["integer", "null"], "minimum": 0 },
    "meta":       { "$ref": "#/definitions/LinuxMeta" },
    "children":   { "type": "array", "items": { "type": "string" } }
  }
}
```

### A.4 RootMetaNode (fs.meta)

```jsonc
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "RootMetaNode",
  "type": "object",
  "required": ["nid", "type", "fsid", "label", "created_at", "updated_at", "owner", "children"],
  "properties": {
    "nid":        { "type": "string" },
    "type":       { "type": "string", "const": "root" },
    "fsid":       { "type": "string" },
    "label":      { "type": "string" },
    "created_at": { "type": "string", "format": "date-time" },
    "updated_at": { "type": "string", "format": "date-time" },
    "ttl":        { "type": ["integer", "null"], "minimum": 0 },
    "owner":      { "type": "string" },
    "fork_of":    { "type": ["string", "null"] },
    "fork_depth": { "type": "integer", "minimum": 0 },
    "children":   { "type": "array", "items": { "type": "string" } },
    "quota_bytes":{ "type": ["integer", "null"], "minimum": 0 }
  }
}
```

### A.5 Session

```jsonc
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Session",
  "type": "object",
  "required": ["session_id", "identity", "created_at", "expires_at", "ttl_seconds", "filesystems"],
  "properties": {
    "session_id":  { "type": "string" },
    "identity":    { "type": "string" },
    "created_at":  { "type": "string", "format": "date-time" },
    "expires_at":  { "type": "string", "format": "date-time" },
    "ttl_seconds": { "type": "integer", "minimum": 1 },
    "filesystems": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["fsid", "access"],
        "properties": {
          "fsid":   { "type": "string" },
          "access": { "type": "string", "enum": ["read", "write", "admin"] }
        }
      }
    },
    "metadata": { "type": "object" }
  }
}
```

### A.6 WAL Entry

```jsonc
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "WalEntry",
  "type": "object",
  "required": ["id", "fsid", "op", "path", "args", "queued_at", "status", "retry"],
  "properties": {
    "id":        { "type": "string" },
    "fsid":      { "type": "string" },
    "op":        { "type": "string", "enum": ["create","write","rm","mv","cp","mkdir","rmdir","chmod","chown"] },
    "path":      { "type": "string" },
    "args":      { "type": "object" },
    "queued_at": { "type": "string", "format": "date-time" },
    "status":    { "type": "string", "enum": ["pending","syncing","done","conflict","error"] },
    "retry":     { "type": "integer", "minimum": 0 },
    "error":     { "type": ["string", "null"] }
  }
}
```
