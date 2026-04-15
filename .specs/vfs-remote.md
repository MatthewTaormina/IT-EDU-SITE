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
15. [File & Directory Locking](#15-file--directory-locking)
16. [Presigned Links](#16-presigned-links)
17. [Multi-Client Synchronisation](#17-multi-client-synchronisation)
18. [Appendix A — JSON Schemas](#appendix-a--json-schemas)

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
| G11 | File and directory locks scoped to a session provide cooperative concurrency control for shared filesystems. |
| G12 | Presigned links grant time-limited, cryptographically signed access to a resource or filesystem without requiring a live session token. |

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
| **Lock** | A cooperative concurrency token scoped to a session that signals exclusive or shared intent over a file or directory. |
| **Presigned link** | A self-contained, time-limited signed URL that grants scoped access to a resource without a live session token. |
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

### 9.7 Change Stream (Server-Sent Events)

To keep clients in sync in online mode the server exposes a persistent event stream per filesystem. Clients subscribe when they mount a filesystem and receive push notifications whenever any node in that filesystem is mutated by *any* session (including other users and other browser tabs sharing the same `fsid`).

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/fs/{fsid}/watch` | Open an SSE stream for filesystem change events |

#### Request

```
GET /fs/{fsid}/watch
Authorization: Bearer <session_id>
Accept: text/event-stream
```

Optional query parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `since` | ISO-8601 | — | Replay events that occurred after this timestamp (catch-up on reconnect) |
| `types` | comma-separated | all | Filter to specific event types, e.g. `node:write,node:delete` |
| `paths` | comma-separated glob | `/**` | Watch only paths matching one or more glob patterns |

#### Response

```
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
X-Accel-Buffering: no
```

The server MUST send a comment line (`: keep-alive`) at least every 30 seconds to detect dropped connections. Each SSE message has an `event` field (the event type) and a `data` field (JSON payload).

#### Change Event Types

| Event | Trigger |
|-------|---------|
| `node:create` | A new file, directory, or symlink was created |
| `node:write` | File content (blob) was replaced |
| `node:meta` | Only metadata (permissions, timestamps, owner) changed |
| `node:delete` | A node was deleted |
| `node:move` | A node was renamed or moved |
| `fs:fork` | This filesystem was forked (a new child FS was created) |
| `fs:delete` | The filesystem itself was deleted |
| `session:expire` | The owning session is about to expire (sent 60 s before expiry) |

#### Change Event Payload

All change events share a common envelope:

```jsonc
{
  "event_id":   "string — unique ID for deduplication (UUID v4)",
  "event":      "node:write",          // event type string
  "fsid":       "string",
  "nid":        "string | null",       // affected node; null for fs-level events
  "path":       "string | null",       // resolved VFS path at time of change
  "old_path":   "string | null",       // previous path for node:move only
  "session_id": "string",              // session that made the change
  "at":         "ISO-8601",            // server-side timestamp of the mutation
  "meta_delta": { /* partial LinuxMeta — only changed fields */ } // for node:meta
}
```

Example SSE stream:

```
id: evt-001
event: node:write
data: {"event_id":"evt-001","event":"node:write","fsid":"fs-abc","nid":"nid-xyz","path":"/home/learner/notes.txt","session_id":"sess-123","at":"2026-04-15T18:00:00Z","meta_delta":null}

id: evt-002
event: node:delete
data: {"event_id":"evt-002","event":"node:delete","fsid":"fs-abc","nid":"nid-old","path":"/tmp/scratch","session_id":"sess-456","at":"2026-04-15T18:00:05Z","meta_delta":null}

: keep-alive
```

#### Reconnection & Event Replay

- The client MUST set the SSE `lastEventId` header (or `since` query parameter on reconnect) so the server can replay missed events.
- The server SHOULD retain a rolling event log for at least 5 minutes per filesystem to support reconnect replay.
- If the gap is too large to replay (log pruned), the server sends a special `stream:reset` event, signalling the client to re-fetch `fs.meta` and rebuild its local cache from scratch.

```jsonc
// stream:reset event data
{ "event": "stream:reset", "fsid": "string", "reason": "log_pruned | fs_replaced" }
```

---

### 9.8 Response Headers

| Header | Meaning |
|--------|---------|
| `X-Node-TTL` | Remaining TTL in seconds for the returned node |
| `X-FS-TTL` | Remaining TTL in seconds for the filesystem |
| `X-Expired: true` | Node/FS is in soft-expiry phase |
| `ETag` | SHA-256 of node content for conditional requests |
| `Cache-Control` | Standard HTTP cache directive; server sets based on TTL |

### 9.9 Storage Backend Interface (Server-Side)

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

The RVFS client library is split into three packages that share a common abstract core:

| Package | Environment | Persistent cache | SSE transport | WAL store |
|---------|-------------|-----------------|---------------|-----------|
| `@itedu/rvfs-client-core` | Any (shared logic) | — (abstract) | — (abstract) | — (abstract) |
| `@itedu/rvfs-client-browser` | Browser (ESM) | IndexedDB | `EventSource` | IndexedDB |
| `@itedu/rvfs-client-system` | Node.js ≥ 18 / Deno / Edge | In-process Map or filesystem | `eventsource` / `undici` | SQLite or filesystem JSON |

Host applications import the environment-specific package. Both expose the **identical** `IRvfsClient` interface, so application code is portable between environments with no changes.

### 10.0 Shared Interface (`IRvfsClient`)

```typescript
interface IRvfsClient {
  // ── Lifecycle ─────────────────────────────────────────────────────────────
  mount(): Promise<void>;
  unmount(): Promise<void>;

  // ── Read ──────────────────────────────────────────────────────────────────
  stat(path: string): Promise<FileMeta | DirMeta>;
  readText(path: string): Promise<string>;
  readBinary(path: string): Promise<Uint8Array>;
  readdir(path: string): Promise<string[]>;
  readdirWithTypes(path: string): Promise<Array<{ name: string; stat: FileMeta | DirMeta }>>;
  realpath(path: string): Promise<string>;
  exists(path: string): Promise<boolean>;
  isFile(path: string): Promise<boolean>;
  isDir(path: string): Promise<boolean>;

  // ── Write ─────────────────────────────────────────────────────────────────
  writeText(path: string, content: string, options?: WriteOptions): Promise<void>;
  writeBinary(path: string, content: Uint8Array, options?: WriteOptions): Promise<void>;
  appendText(path: string, content: string): Promise<void>;

  // ── Directory ─────────────────────────────────────────────────────────────
  mkdir(path: string, options?: { parents?: boolean; mode?: number }): Promise<void>;
  rmdir(path: string, options?: { recursive?: boolean }): Promise<void>;

  // ── File management ───────────────────────────────────────────────────────
  rm(path: string, options?: { recursive?: boolean; force?: boolean }): Promise<void>;
  mv(src: string, dst: string): Promise<void>;
  cp(src: string, dst: string, options?: { recursive?: boolean }): Promise<void>;
  symlink(target: string, path: string): Promise<void>;

  // ── Metadata ──────────────────────────────────────────────────────────────
  chmod(path: string, mode: number): Promise<void>;
  chown(path: string, uid: number, gid: number): Promise<void>;
  utimes(path: string, atime: Date, mtime: Date): Promise<void>;

  // ── Forking ───────────────────────────────────────────────────────────────
  fork(options?: { label?: string; ttl?: number }): Promise<IRvfsClient>;
  isOwned(path: string): Promise<boolean>;

  // ── Cache control ─────────────────────────────────────────────────────────
  invalidate(...paths: string[]): void;
  prefetch(dir: string, depth?: number): Promise<void>;
  cacheStats(): CacheStats;

  // ── Session ───────────────────────────────────────────────────────────────
  renewSession(ttlSeconds: number): Promise<void>;
  endSession(): Promise<void>;

  // ── Change stream ─────────────────────────────────────────────────────────
  watch(handler: (event: RvfsChangeEvent) => void): () => void;
  watchPath(pathOrGlob: string, handler: (event: RvfsChangeEvent) => void): () => void;

  // ── Offline & WAL ─────────────────────────────────────────────────────────
  readonly online: boolean;
  on(event: RvfsClientEvent, handler: (e: RvfsEvent) => void): void;
  sync(): Promise<SyncResult>;
  getPendingWrites(): Promise<PendingWrite[]>;
  discardPendingWrite(id: string): Promise<void>;
}

type RvfsClientEvent =
  | 'online' | 'offline'
  | 'sync:start' | 'sync:complete' | 'sync:error'
  | 'change';          // fired for every RvfsChangeEvent from the watch stream

interface CacheStats {
  hits: number; misses: number; evictions: number;
  sizeNodes: number; sizeBlobBytes: number;
}
```

All methods throw `RvfsError` on failure (see §13).

---

### 10.1 Shared Configuration (`RvfsClientConfig`)

Both concrete clients accept the same base config, with environment-specific extensions.

```typescript
interface RvfsClientConfig {
  // ── Remote ────────────────────────────────────────────────────────────────
  baseUrl:         string;                   // e.g. 'https://api.example.com/rvfs/v1'
  sessionId?:      string;                   // omit for guest (server assigns one)
  fsid:            string;

  // ── Cache ─────────────────────────────────────────────────────────────────
  cacheMaxNodes?:  number;                   // default: 256
  cacheMaxBlobMb?: number;                   // default: 32 MB in-memory

  // ── Offline & sync ────────────────────────────────────────────────────────
  offlineFallback?: boolean;                 // default: true
  syncOnReconnect?: boolean;                 // default: true
  conflictPolicy?:  'overwrite' | 'fail';    // default: 'fail'

  // ── Change stream ─────────────────────────────────────────────────────────
  watchOnMount?:    boolean;                 // auto-subscribe to SSE on mount (default: true)
  watchPaths?:      string[];                // glob filters passed to /watch (default: ['/**'])
}
```

---

### 10.2 Browser Client (`@itedu/rvfs-client-browser`)

**Environment:** Browser (Chrome 90+, Firefox 90+, Safari 15+). Requires `window.indexedDB` and `window.EventSource`.

```typescript
import { BrowserRvfsClient } from '@itedu/rvfs-client-browser';

const client = new BrowserRvfsClient({
  baseUrl:   'https://api.example.com/rvfs/v1',
  sessionId: 'uuid-from-auth',    // omit for guest session
  fsid:      'uuid-of-filesystem',
  // Browser-specific options:
  idbName?:  string,              // IndexedDB database name (default: 'rvfs-{fsid}')
  idbVersion?: number,            // default: 1; bump to trigger schema migration
  persistBlobsInIdb?: boolean,    // default: true; set false if blobs are large/static
});

await client.mount();
```

#### Browser-Specific Behaviour

| Concern | Detail |
|---------|--------|
| **Persistent cache** | IndexedDB stores `nodes`, `blobs`, and `wal`. Shared across tabs for the same origin. |
| **Connectivity detection** | `navigator.onLine` + a lightweight `GET /ping` poll every 15 s. |
| **SSE** | Native `EventSource`. Reconnects with `lastEventId` automatically. |
| **WAL store** | IndexedDB `wal` object store. |
| **Session storage** | Session ID stored in `sessionStorage` for guests; `localStorage` for authenticated users (with explicit opt-in). |
| **Blob size limit** | Total IndexedDB blob quota defaults to 128 MB; evicts LRU blobs when exceeded. |
| **Tab coordination** | Uses `BroadcastChannel` (`rvfs:{fsid}`) to forward incoming SSE change events to other tabs so all tabs stay in sync without duplicating SSE connections. The first tab to mount becomes the **SSE leader**; others receive events via `BroadcastChannel`. On leader tab close, leadership is re-elected within 2 s. |

---

### 10.3 System Client (`@itedu/rvfs-client-system`)

**Environment:** Node.js ≥ 18, Deno, Cloudflare Workers, or any runtime with the standard `fetch` API and an SSE-compatible HTTP client.

```typescript
import { SystemRvfsClient } from '@itedu/rvfs-client-system';

const client = new SystemRvfsClient({
  baseUrl:   'https://api.example.com/rvfs/v1',
  sessionId: process.env.RVFS_SESSION_ID,
  fsid:      process.env.RVFS_FSID,
  // System-specific options:
  cacheBackend?:  'memory' | 'sqlite' | 'fs',  // default: 'memory'
  cachePath?:     string,    // required for 'sqlite' and 'fs' backends
  walBackend?:    'memory' | 'sqlite' | 'fs',  // default: 'memory'
  walPath?:       string,
  sseLibrary?:    EventSourceLike,             // inject custom SSE client (e.g. undici)
  fetchImpl?:     typeof fetch,               // inject custom fetch (e.g. node-fetch)
  tlsOptions?:    TlsOptions,                 // CA cert, mutual TLS, etc.
});

await client.mount();
```

#### System-Specific Behaviour

| Concern | Detail |
|---------|--------|
| **Persistent cache (memory)** | In-process LRU Map. Lost on process restart. |
| **Persistent cache (sqlite)** | SQLite file via `better-sqlite3` (optional peer dep). Survives restarts; suitable for long-running services. |
| **Persistent cache (fs)** | Each node serialised as a JSON/binary file under `cachePath/{fsid}/`. Suitable for edge or serverless with ephemeral local disk. |
| **Connectivity detection** | Periodic `GET /ping`. No `navigator.onLine` equivalent; connection errors trigger offline mode. |
| **SSE** | Requires an `EventSource`-compatible client. Node.js ≥ 18 does not ship one natively; the package re-exports a thin wrapper around `undici` streams. Pass a custom `sseLibrary` to override. |
| **WAL store** | Defaults to in-memory queue. Use `walBackend: 'sqlite'` for durability across restarts. |
| **Session storage** | Session ID passed via config or environment variable; no browser storage APIs used. |
| **Concurrency** | The system client is safe for concurrent async calls within a single process. For multi-process deployments, use an external WAL backend (`sqlite` or `fs`) with advisory locking. |
| **Graceful shutdown** | Call `client.unmount()` before process exit to flush pending WAL entries and close the SSE connection cleanly. |

#### System Client Usage Example (Node.js build script)

```typescript
import { SystemRvfsClient } from '@itedu/rvfs-client-system';

const vfs = new SystemRvfsClient({
  baseUrl:   'https://api.example.com/rvfs/v1',
  sessionId: process.env.RVFS_SESSION_ID!,
  fsid:      process.env.RVFS_FSID!,
  cacheBackend: 'sqlite',
  cachePath:    '/tmp/rvfs-cache.db',
});

await vfs.mount();

// Write a generated file into the shared filesystem
await vfs.writeText('/dist/output.js', bundledCode, { createParents: true });

// Read a config file placed by another client (browser or another server process)
const config = await vfs.readText('/config/app.json');

await vfs.unmount();
```

---

### 10.4 WriteOptions

```typescript
interface WriteOptions {
  mode?:          number;   // default 0o644
  createParents?: boolean;  // default false
  noClobber?:     boolean;  // fail if file exists (default false)
  ttl?:           number;   // node TTL in seconds (inherits FS TTL if unset)
}
```

### 10.5 Forking

```typescript
// Fork the current filesystem; returns a new client of the same concrete type
// bound to the new fork's fsid
fork(options?: { label?: string; ttl?: number }): Promise<IRvfsClient>

// Check if a path exists in the current FS (not inherited from parent fork)
isOwned(path: string): Promise<boolean>
```

### 10.6 Cache Control

```typescript
// Manually invalidate one or more paths in the read cache
invalidate(...paths: string[]): void

// Prefetch and warm the cache for a directory subtree
prefetch(dir: string, depth?: number): Promise<void>

// Return current cache statistics
cacheStats(): CacheStats
```

### 10.7 Session Management

```typescript
renewSession(ttlSeconds: number): Promise<void>
endSession(): Promise<void>
```

### 10.8 Watching & Remote Change Events

In online mode both client types subscribe to the SSE change stream (§9.7) automatically on `mount()` (when `watchOnMount: true`). Incoming events invalidate affected cache entries and emit typed events to the host application.

```typescript
// Subscribe to all remote change events for the mounted filesystem
// Returns an unsubscribe function
watch(handler: (event: RvfsChangeEvent) => void): () => void

// Subscribe to a single path or glob pattern only
watchPath(pathOrGlob: string, handler: (event: RvfsChangeEvent) => void): () => void
```

#### RvfsChangeEvent

```typescript
interface RvfsChangeEvent {
  type:     'create' | 'write' | 'meta' | 'delete' | 'move' | 'reset';
  path:     string;
  oldPath?: string;   // only for 'move'
  nid?:     string;
  /** True when the change originated from this client's own session */
  local:    boolean;
  at:       Date;
}
```

Remote changes with `local: false` always invalidate the in-memory cache (and IDB / disk cache where applicable) for the affected `nid` and its parent directory before the event is dispatched to the handler.

### 10.9 Offline & Sync

```typescript
readonly online: boolean

on(event: RvfsClientEvent, handler: (e: RvfsEvent) => void): void

sync(): Promise<SyncResult>
getPendingWrites(): Promise<PendingWrite[]>
discardPendingWrite(id: string): Promise<void>
```

---

## 11. Caching Architecture

### 11.1 Read Cache (In-Memory LRU)

Shared by both client types. Held in a single in-process LRU structure per `IRvfsClient` instance.

- **Key:** Node ID (`nid`).
- **Value:** Deserialized meta node or blob `Uint8Array`.
- **Eviction:** LRU with configurable `cacheMaxNodes` and `cacheMaxBlobMb` limits.
- **TTL awareness:** Each cache entry stores `cached_at + node_ttl`; entries are treated as stale on access if `Date.now() > expires_at`. Stale entries trigger a background revalidation (stale-while-revalidate) and serve the cached value immediately.
- **Directory listings:** Directory children arrays are cached at the directory meta node level. Any mutation to a directory's contents invalidates its cache entry.
- **Path → nid index:** A secondary `Map<path, nid>` allows O(1) path lookups without walking the tree. Invalidated on any `mv`, `rm`, `mkdir`, or `create` that affects the path.

### 11.2 Persistent Cache

The persistent cache layer is **platform-specific**. Both clients read through it after an in-memory miss and before a network fetch.

| | Browser client | System client |
|---|---|---|
| **Backend** | IndexedDB | `memory` (default) / `sqlite` / `fs` |
| **Node store** | `nodes` object store (JSON) | Table or JSON files keyed by `nid` |
| **Blob store** | `blobs` object store (ArrayBuffer) | Table or binary files keyed by `nid` |
| **WAL store** | `wal` object store | Table, file, or in-memory queue |
| **Shared across tabs** | Yes (same IDB origin) | No (per-process unless external backend) |
| **Survives restart** | Yes | Only with `sqlite` or `fs` backend |
| **Max blob quota** | 128 MB default (evicts LRU) | Configurable; no hard default |

#### IndexedDB Schema (Browser)

```
Database: rvfs-{fsid}  (version 1)
├── nodes   — keyPath: nid        — stores serialized MetaNode JSON
├── blobs   — keyPath: nid        — stores ArrayBuffer
└── wal     — keyPath: id; index: [status, queued_at]
```

Schema version upgrades are handled via `onupgradeneeded`; the version number is bumped in the package when breaking changes are made.

### 11.3 HTTP Layer Caching

- The server sets `Cache-Control: max-age=<ttl_seconds>, stale-while-revalidate=60` on meta node responses.
- Blob responses are immutable if the `nid` is content-addressed: `Cache-Control: public, max-age=31536000, immutable`.
- Both client types use a `fetch` wrapper that checks `ETag` / `If-None-Match` for conditional GET to avoid re-downloading unchanged nodes.

### 11.4 Batch Prefetch Strategy

When traversing a directory tree (e.g., `cp -r`, `rm -rf`, `prefetch()`), both client types:

1. Fetch the directory meta node to get `children`.
2. Fan out a single batch request (`POST /batch`) for all child `nid`s.
3. Populate the cache before any child is individually accessed.

This reduces a tree of depth D with branching factor B from O(D × B) serial requests to O(D) batch requests.

---

## 12. Offline Mode & Sync

### 12.1 Write-Ahead Log (WAL)

When the client library detects the remote is unavailable (network error or explicit `offline` mode), all mutating operations are appended to the WAL instead of being sent to the server.

The WAL backend is **platform-specific**:

| Client | Default backend | Durable across restart? |
|--------|----------------|------------------------|
| Browser | IndexedDB `wal` object store | Yes |
| System (`memory`) | In-process array | No |
| System (`sqlite`) | SQLite table | Yes |
| System (`fs`) | JSON files under `walPath/` | Yes |

For system clients that must guarantee WAL durability (e.g., a background sync service), set `walBackend: 'sqlite'` or `walBackend: 'fs'`.

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

Reads during offline mode are served entirely from the in-memory LRU and the platform-specific persistent cache. If a requested node is not in any cache and the remote is unavailable, the operation rejects with `RvfsError { code: 'OFFLINE', message: '...' }`.

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
| `ELOCKED` | — | Path is locked by another session |
| `EDEADLOCK` | — | Lock acquisition would create a deadlock cycle |
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

### 14.7 Lock Expiry as a Safety Net

Mandatory locks (§15.3) that are never released (e.g., due to a crashed client) could block all writes to a path indefinitely. To prevent this, the server MUST enforce lock TTLs strictly — a lock past its `expires_at` MUST be treated as released even if no explicit `DELETE /lock/{lock_id}` was received. The maximum allowed lock TTL is 300 seconds; requests for longer TTLs MUST be rejected with `400 Bad Request`.

### 14.8 Presigned Link Integrity

Presigned link tokens MUST be verified server-side on every redemption:

1. HMAC signature must match using the `kid`-identified key.
2. `expires_at` must be in the future.
3. `max_uses` counter must not be exhausted.
4. Constraint checks (origin, IP) must pass.

The server MUST NOT skip any of these checks even for `read`-only links. A compromised or leaked link must be revocable via `DELETE /presign/{presign_id}` at any time.

---

## 15. File & Directory Locking

Locks provide cooperative concurrency control for shared filesystems. They are scoped to a **session** — when the session expires or is explicitly ended, all of its locks are automatically released.

### 15.1 Lock Types

| Type | Symbol | Description |
|------|--------|-------------|
| `shared` | S | Read lock. Multiple sessions may hold shared locks on the same path simultaneously. Blocks exclusive acquisition. |
| `exclusive` | X | Write lock. Only one session may hold an exclusive lock. Blocks all other lock acquisitions on the same path. |
| `intent-shared` | IS | Advisory intent to acquire shared locks on children of a directory. Does not block other IS/IX locks. |
| `intent-exclusive` | IX | Advisory intent to acquire exclusive locks on children of a directory. Blocks exclusive locks on the directory itself. |

The compatibility matrix (✓ = compatible, ✗ = conflict):

| Held ↓ \ Requested → | IS | S | IX | X |
|-----------------------|----|---|----|---|
| IS | ✓ | ✓ | ✓ | ✗ |
| S | ✓ | ✓ | ✗ | ✗ |
| IX | ✓ | ✗ | ✓ | ✗ |
| X | ✗ | ✗ | ✗ | ✗ |

### 15.2 Lock Scope

- **File lock:** applies to the file meta node at the given path.
- **Directory lock:** applies to the directory meta node. By default non-recursive (does not lock children). Pass `recursive: true` to also acquire `intent-exclusive` locks on all descendant directories and `exclusive` locks on all descendant files (full subtree lock).

### 15.3 Advisory vs. Mandatory Enforcement

| Mode | Behaviour |
|------|-----------|
| `advisory` (default) | The server records the lock. Other sessions CAN bypass it — but `IRvfsClient` checks locks before every mutating operation and raises `ELOCKED` if a conflicting lock is held. Use this mode when all writers use the client library. |
| `mandatory` | The server refuses conflicting operations with `423 Locked`, regardless of whether the caller uses the client library. Use for high-trust multi-process or server-to-server scenarios. |

The mode is set per-lock at acquisition time.

### 15.4 Lock Object

```jsonc
{
  "lock_id":    "string — UUID v4",
  "fsid":       "string",
  "path":       "string — absolute VFS path",
  "type":       "shared | exclusive | intent-shared | intent-exclusive",
  "mode":       "advisory | mandatory",
  "session_id": "string — owning session",
  "acquired_at": "ISO-8601",
  "expires_at":  "ISO-8601",
  "ttl":        "number — seconds; auto-released after this duration",
  "recursive":  "boolean",
  "metadata":   { /* arbitrary key/value for host app use */ }
}
```

### 15.5 Server API — Lock Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/lock` | Acquire a lock |
| `DELETE` | `/lock/{lock_id}` | Release a lock |
| `GET` | `/lock/{lock_id}` | Fetch lock details |
| `POST` | `/lock/{lock_id}/heartbeat` | Extend lock TTL |
| `GET` | `/fs/{fsid}/locks` | List all active locks on a filesystem |
| `GET` | `/fs/{fsid}/locks?path=<path>` | List locks on a specific path |

#### `POST /lock` — Acquire

Request:
```jsonc
{
  "fsid":      "string",
  "path":      "string",
  "type":      "shared | exclusive | intent-shared | intent-exclusive",
  "mode":      "advisory | mandatory",
  "ttl":       "number — seconds (default: 30)",
  "recursive": "boolean (default: false)",
  "wait":      "number | null — max ms to wait for conflicting locks to clear (null = fail immediately)"
}
```

Response `201 Created`: full lock object.

Response `409 Conflict` (when `wait` is null and a conflicting lock exists):
```jsonc
{
  "error": "ELOCKED",
  "blocking_locks": [ { "lock_id": "...", "type": "exclusive", "session_id": "..." } ]
}
```

Response `408 Request Timeout` (when `wait` elapsed before the lock could be granted).

#### `POST /lock/{lock_id}/heartbeat` — Renew

Request:
```jsonc
{ "ttl": "number — new TTL in seconds from now" }
```

Response `200 OK`: updated lock object with new `expires_at`.

### 15.6 Deadlock Prevention

- The server enforces a **maximum wait time** per lock request (cap: 60 s; default from config). Requests that exceed this time receive `408`.
- Clients MUST NOT hold a lock while waiting for another lock that is in turn blocked by a session waiting for the first lock. The client library detects this by checking the `blocking_locks` list in a `409` response and raising `EDEADLOCK` if the current session appears in that list.
- Servers SHOULD run a background cycle-detection pass every 5 s and break deadlocks by forcibly releasing the youngest lock in the cycle, returning `423 Locked` with `X-Lock-Broken: true` to the affected session.

### 15.7 Lock Heartbeat & Auto-Release

Because network connections can drop silently:

- Every lock has a server-side TTL (default 30 s, max 300 s).
- The client library sends a heartbeat (`POST /lock/{lock_id}/heartbeat`) automatically at half the TTL interval while the lock is held.
- When a session ends (explicit `endSession()` or server-side expiry), the server atomically releases all locks owned by that session.
- A lock whose TTL expires without a heartbeat is **silently released**; the next operation by the lock holder receives `ELOCKED` or discovers the lock is gone via `GET /lock/{lock_id}` → `404`.

### 15.8 Change Stream Events for Locks

The SSE change stream (§9.7) emits two additional event types when `mandatory` mode locks are involved:

| Event | Meaning |
|-------|---------|
| `lock:acquired` | A lock was granted on a path visible to this session |
| `lock:released` | A lock was released (normally or by expiry) |

Both events carry the standard change event envelope plus a `lock` field with the full lock object.

### 15.9 Client Library — Lock API

Both `BrowserRvfsClient` and `SystemRvfsClient` implement the following additions to `IRvfsClient`:

```typescript
// ── Acquire ───────────────────────────────────────────────────────────────────

// Acquire a lock; rejects with RvfsError if acquisition fails within waitMs
lock(
  path: string,
  type: 'shared' | 'exclusive' | 'intent-shared' | 'intent-exclusive',
  options?: LockOptions,
): Promise<LockHandle>

// Non-blocking attempt; returns null if a conflicting lock is held
tryLock(
  path: string,
  type: 'shared' | 'exclusive' | 'intent-shared' | 'intent-exclusive',
  options?: Omit<LockOptions, 'waitMs'>,
): Promise<LockHandle | null>

// Acquire a lock, run fn, then release — even if fn throws
withLock<T>(
  path: string,
  type: 'shared' | 'exclusive',
  fn: (handle: LockHandle) => Promise<T>,
  options?: LockOptions,
): Promise<T>

// ── Inspect ───────────────────────────────────────────────────────────────────

// List all locks currently held by this client (this session)
listOwnedLocks(): LockHandle[]

// Query locks held by any session on a given path
queryLocks(path: string): Promise<LockInfo[]>
```

#### LockOptions

```typescript
interface LockOptions {
  mode?:      'advisory' | 'mandatory';  // default: 'advisory'
  ttl?:       number;                    // seconds; default: 30
  recursive?: boolean;                   // default: false
  waitMs?:    number | null;             // null = fail immediately; default: 5000
  metadata?:  Record<string, unknown>;
}
```

#### LockHandle

```typescript
interface LockHandle {
  lockId:     string;
  path:       string;
  type:       string;
  expiresAt:  Date;
  // Release the lock and stop the heartbeat
  release(): Promise<void>;
}
```

The client library keeps an internal registry of live `LockHandle` instances. `endSession()` calls `release()` on all of them before closing the session.

---

## 16. Presigned Links

Presigned links are **self-contained, time-limited, cryptographically signed URLs** that grant scoped access to a specific RVFS resource. They require no `Authorization` header — the signature embedded in the URL is the credential.

Primary use cases:
- Embed a direct file download link in an email or UI without exposing a session token.
- Allow an unauthenticated browser to upload a single file to a known path (like S3 presigned PUT).
- Share a read-only view of a filesystem with a third party.
- Distribute a watch stream URL to a client that has no session of its own.

### 16.1 Link Types

| Type | HTTP method | Resource |
|------|-------------|----------|
| `blob:read` | `GET` | Download a specific blob nid |
| `blob:write` | `PUT` | Upload content to a specific blob nid slot in a given fsid |
| `path:read` | `GET` | Resolve and download a VFS path |
| `path:write` | `PUT` | Write content to a VFS path |
| `fs:mount` | `POST` | Bootstrap a temporary session scoped to one filesystem |
| `watch:stream` | `GET` | Subscribe to the SSE change stream for a filesystem |

### 16.2 Presigned Token Structure

A presigned link is a standard HTTPS URL of the form:

```
https://api.example.com/rvfs/v1/presigned/{token}
```

`{token}` is a URL-safe base64 encoding of a small JSON envelope plus an HMAC-SHA256 signature:

```jsonc
// Decoded token payload (before base64)
{
  "v":          1,                        // token version
  "type":       "path:read",              // link type
  "fsid":       "string | null",          // target filesystem (null for blob:* links by nid)
  "resource":   "string",                 // path, nid, or fsid depending on type
  "operation":  "read | write | mount | stream",
  "issued_at":  "unix timestamp (s)",
  "expires_at": "unix timestamp (s)",
  "max_uses":   "number | null",          // null = unlimited within TTL
  "constraints": {
    "allowed_origins":    ["string"],     // HTTP Origin header allowlist (optional)
    "allowed_ip_prefix":  "string | null",// CIDR block (optional)
    "max_bytes":          "number | null" // cap for write links (optional)
  },
  "sig":        "hex HMAC-SHA256"         // covers all fields above
}
```

The HMAC is computed over the **canonical string**:

```
{v}\n{type}\n{fsid}\n{resource}\n{operation}\n{issued_at}\n{expires_at}\n{max_uses}\n{constraints_json_sorted_keys}
```

The signing key is a server-side secret rotated on a schedule (see §16.6).

### 16.3 Server API — Presign Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/presign` | Generate a presigned link |
| `GET` | `/presigned/{token}` | Redeem a presigned link (all link types) |
| `PUT` | `/presigned/{token}` | Redeem a write presigned link |
| `POST` | `/presigned/{token}` | Redeem a `fs:mount` link to receive a session |
| `DELETE` | `/presign/{presign_id}` | Revoke a presigned link before expiry |

#### `POST /presign` — Generate

Requires a valid session with at least `read` access for read links, `write` access for write links, and `admin` access for `fs:mount` and `watch:stream` links.

Request:
```jsonc
{
  "type":      "blob:read | blob:write | path:read | path:write | fs:mount | watch:stream",
  "fsid":      "string | null",
  "resource":  "string",           // path, nid, or fsid
  "ttl":       "number",           // seconds until expiry
  "max_uses":  "number | null",    // null = unlimited
  "constraints": {
    "allowed_origins":   ["string"],
    "allowed_ip_prefix": "string | null",
    "max_bytes":         "number | null"
  }
}
```

Response `201 Created`:
```jsonc
{
  "presign_id": "string — server-side ID for revocation",
  "url":        "https://api.example.com/rvfs/v1/presigned/{token}",
  "type":       "path:read",
  "expires_at": "ISO-8601",
  "max_uses":   "number | null"
}
```

#### `GET /presigned/{token}` — Redeem (read)

The server:
1. Base64-decodes and parses the token.
2. Verifies the HMAC signature.
3. Checks `expires_at` against the current time.
4. Checks `max_uses` (if set, atomically decrements the server-side use counter; rejects with `410 Gone` when exhausted).
5. Checks `constraints` (origin, IP).
6. For `path:read` / `blob:read`: returns the resource directly (`Content-Disposition: attachment` for blobs).
7. For `watch:stream`: upgrades to SSE.
8. For `fs:mount`: creates a temporary session (TTL ≤ link TTL, `read` or `write` access) and returns session JSON.

Response headers on all redeemed links:
```
X-Presign-Uses-Remaining: 4
X-Presign-Expires: <ISO-8601>
```

#### `DELETE /presign/{presign_id}` — Revoke

Immediately invalidates all future redemptions of the link. Any in-flight requests using the token that have already passed signature verification are not interrupted.

### 16.4 Single-Use Links

Set `max_uses: 1` to create a one-time link. The server atomically decrements the counter on first use and returns `410 Gone` on all subsequent requests.

Single-use links are recommended for any write operation to prevent replay attacks.

### 16.5 `fs:mount` Links — Temporary Sessions

When a `fs:mount` presigned link is redeemed (`POST /presigned/{token}`), the server:

1. Creates a new session with:
   - `identity: "presigned-guest"` (or the `sub` from a JWT if the link was issued by an authenticated user)
   - `ttl_seconds` = min(link TTL remaining, deployment max guest TTL)
   - `filesystems`: one entry for the target `fsid`, access level derived from the link's `operation` (`read` → `read`, `write` → `write`)
2. Returns the full session object (including `session_id`).
3. The caller uses this `session_id` as a normal bearer token for all subsequent requests until it expires.

This pattern enables **one-click filesystem sharing**: generate a `fs:mount` link, send it to a collaborator, they POST to it once, and from that point forward interact with the filesystem normally.

### 16.6 Key Rotation

Signing keys are identified by a `kid` (key ID) included in the token envelope. The server maintains a small key set (current key + up to 2 retired keys still valid for verification). This allows key rotation without invalidating all outstanding links:

1. New key becomes active; all new tokens are signed with it.
2. Old key is retained for verification until all tokens signed with it have expired.
3. Once no valid tokens reference the old `kid`, it is removed from the key set.

### 16.7 Security Rules for Presigned Links

- Presigned links MUST only be generated over HTTPS.
- Links MUST NOT be generated for resources the requesting session cannot itself access.
- `path:write` and `blob:write` presigned links MUST be single-use (`max_uses: 1`) by default unless the caller explicitly sets a higher limit.
- The server MUST NOT log the full token URL; log only the `presign_id` and `type`.
- Links inheriting write access MUST still respect mandatory locks (§15.3) — a presigned write to a locked path returns `423 Locked` like any other request.
- `allowed_origins` SHOULD always be set for browser-facing links.

### 16.8 Client Library — Presign API

Available on both `BrowserRvfsClient` and `SystemRvfsClient` (only sessions with sufficient access can generate links):

```typescript
// Generate a presigned link for any supported type
presign(options: PresignOptions): Promise<PresignedLink>

// Revoke a previously issued presigned link
revokePresignedLink(presignId: string): Promise<void>
```

#### PresignOptions

```typescript
interface PresignOptions {
  type:        'blob:read' | 'blob:write' | 'path:read' | 'path:write' | 'fs:mount' | 'watch:stream';
  resource:    string;                    // path, nid, or fsid
  ttl:         number;                    // seconds
  maxUses?:    number | null;             // default: 1 for write types, null for read types
  constraints?: {
    allowedOrigins?:   string[];
    allowedIpPrefix?:  string;
    maxBytes?:         number;
  };
}

interface PresignedLink {
  presignId:  string;
  url:        string;
  type:       string;
  expiresAt:  Date;
  maxUses:    number | null;
}
```

#### `fs:mount` Helper

```typescript
// Generate a fs:mount presigned link and return just the URL (most common use case)
shareFilesystem(options: {
  access:  'read' | 'write';
  ttl:     number;
  maxUses?: number;
  allowedOrigins?: string[];
}): Promise<string>   // returns the presigned URL
```

---

## 17. Multi-Client Synchronisation

Multi-client sync in online mode is achieved through three complementary mechanisms specified in earlier sections:

| Mechanism | Where specified | Role |
|-----------|----------------|------|
| **SSE change stream** | §9.7 | Server pushes node-level change events to all subscribed clients in real time |
| **Cache invalidation on remote change** | §10.8, §11 | Incoming SSE events automatically evict stale cache entries before notifying the application |
| **Tab coordination (browser)** | §10.2 | A single SSE leader tab forwards events to peer tabs via `BroadcastChannel`, avoiding duplicate connections |
| **WAL sync on reconnect** | §12.3 | Pending offline writes are replayed in FIFO order when the connection is restored |
| **Presigned watch links** | §16 | Watch streams can be shared with clients that have no session of their own |

### 17.1 Online Sync Guarantees

| Guarantee | Level |
|-----------|-------|
| **Eventual consistency** | Always — all clients converge to the same state if no further writes occur |
| **Read-your-writes** | Within a session — a write is reflected in the local cache before the remote confirms it (optimistic) |
| **Monotonic reads** | Within a session — a client never observes an older version of a node after observing a newer one |
| **Cross-session ordering** | Not guaranteed — concurrent writes from different sessions may be applied in any order; last-write-wins on the server |

### 17.2 Consistency Upgrade with Locks

To strengthen ordering guarantees, the lock protocol (§15) can be layered on top:

- **Exclusive lock** before a read-modify-write cycle gives **serialisable** behaviour for that path.
- **Shared lock** during a long read prevents any writer from mutating the path under observation.

Applications that require strict consistency MUST acquire appropriate locks; the base sync layer is intentionally kept as eventual-consistency only to maximise throughput.

### 17.3 `stream:reset` Recovery

If the server's event log is pruned before a client reconnects, it sends a `stream:reset` event (§9.7). Both client types handle this automatically:

1. Clear the in-memory LRU and IDB / disk caches for the affected `fsid`.
2. Re-fetch `fs.meta` from the server.
3. Re-populate the cache by walking the tree from the root (lazy, on next access) or by calling `prefetch('/')` (eager).
4. Emit a `change` event of type `reset` to all `watch()` handlers so the host application can refresh its view.

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

### A.7 Lock

```jsonc
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Lock",
  "type": "object",
  "required": ["lock_id", "fsid", "path", "type", "mode", "session_id", "acquired_at", "expires_at", "ttl", "recursive"],
  "properties": {
    "lock_id":     { "type": "string" },
    "fsid":        { "type": "string" },
    "path":        { "type": "string" },
    "type":        { "type": "string", "enum": ["shared", "exclusive", "intent-shared", "intent-exclusive"] },
    "mode":        { "type": "string", "enum": ["advisory", "mandatory"] },
    "session_id":  { "type": "string" },
    "acquired_at": { "type": "string", "format": "date-time" },
    "expires_at":  { "type": "string", "format": "date-time" },
    "ttl":         { "type": "integer", "minimum": 1, "maximum": 300 },
    "recursive":   { "type": "boolean" },
    "metadata":    { "type": "object" }
  }
}
```

### A.8 Presigned Link

```jsonc
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PresignedLink",
  "type": "object",
  "required": ["presign_id", "url", "type", "expires_at"],
  "properties": {
    "presign_id": { "type": "string" },
    "url":        { "type": "string", "format": "uri" },
    "type":       { "type": "string", "enum": ["blob:read","blob:write","path:read","path:write","fs:mount","watch:stream"] },
    "expires_at": { "type": "string", "format": "date-time" },
    "max_uses":   { "type": ["integer", "null"], "minimum": 1 }
  }
}
```

### A.9 Presigned Token Payload (decoded)

```jsonc
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PresignedTokenPayload",
  "type": "object",
  "required": ["v", "type", "resource", "operation", "issued_at", "expires_at", "sig"],
  "properties": {
    "v":           { "type": "integer", "const": 1 },
    "type":        { "type": "string", "enum": ["blob:read","blob:write","path:read","path:write","fs:mount","watch:stream"] },
    "fsid":        { "type": ["string", "null"] },
    "resource":    { "type": "string" },
    "operation":   { "type": "string", "enum": ["read","write","mount","stream"] },
    "issued_at":   { "type": "integer" },
    "expires_at":  { "type": "integer" },
    "max_uses":    { "type": ["integer", "null"] },
    "constraints": {
      "type": "object",
      "properties": {
        "allowed_origins":   { "type": "array", "items": { "type": "string" } },
        "allowed_ip_prefix": { "type": ["string", "null"] },
        "max_bytes":         { "type": ["integer", "null"] }
      }
    },
    "sig": { "type": "string", "description": "Hex-encoded HMAC-SHA256 over canonical string" }
  }
}
```
