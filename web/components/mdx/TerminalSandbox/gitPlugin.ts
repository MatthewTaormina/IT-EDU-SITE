/**
 * Git Plugin — Part 3 of TerminalSandbox
 *
 * Pure TypeScript — no React, no side-effects.
 * Registers as the 'git' command handler on a Shell instance.
 *
 * Git repo state is serialised as JSON and stored in ShellState.env['__git__']
 * so the Shell interface stays clean (no extra fields).
 */

import {
  type VFSMap,
  resolvePath,
  listDir,
  ensureDirs,
  cloneVFS,
} from './vfs';
import type { ShellState, CommandResult, CommandPlugin } from './shell';

// ─── Internal types ────────────────────────────────────────────────────────────

interface GitCommit {
  hash: string;
  message: string;
  author: string;
  timestamp: string;        // ISO 8601
  parent: string | null;
  parent2?: string;          // second parent for merge commits
  tree: Record<string, string>;  // repoRelPath → file content at commit time
}

interface GitRepo {
  initialized: boolean;
  HEAD: string;                          // branch name (detached → commit hash)
  detached: boolean;
  branches: Record<string, string>;      // branch name → commit hash ('' = no commits)
  commits: Record<string, GitCommit>;
  index: Record<string, string>;         // staged: repoRelPath → content
  config: { name: string; email: string };
  conflicts: Record<string, { ours: string; theirs: string; base: string }>;
  mergeHead?: string;                    // incoming branch hash during a conflict state
  /** Monotonic counter used for deterministic fake hashes */
  _seq: number;
}

// ─── Serialisation helpers ────────────────────────────────────────────────────

function loadRepo(env: Record<string, string>): GitRepo | null {
  const raw = env['__git__'];
  if (!raw) return null;
  try { return JSON.parse(raw) as GitRepo; } catch { return null; }
}

function saveRepo(repo: GitRepo, state: ShellState): ShellState {
  return { ...state, env: { ...state.env, __git__: JSON.stringify(repo) } };
}

function emptyRepo(): GitRepo {
  return {
    initialized: true,
    HEAD: 'main',
    detached: false,
    branches: { main: '' },
    commits: {},
    index: {},
    config: { name: '', email: '' },
    conflicts: {},
    mergeHead: undefined,
    _seq: 0,
  };
}

// ─── Fake hash ────────────────────────────────────────────────────────────────

/** Produce a deterministic 7-char fake commit hash from seq + message. */
function makeHash(seq: number, message: string): string {
  // Simple djb2-style hash over seq + message characters
  let h = 5381 + seq * 31;
  for (let i = 0; i < message.length; i++) {
    h = ((h << 5) + h) ^ message.charCodeAt(i);
    h = h >>> 0; // keep 32-bit unsigned
  }
  return h.toString(16).padStart(7, '0').slice(0, 7);
}

// ─── Working-tree helpers ─────────────────────────────────────────────────────

/**
 * The "repo root" is the cwd when `git init` was run.
 * We store it as env['__git_root__'].
 */
function getRoot(env: Record<string, string>): string {
  return env['__git_root__'] ?? '/home/user';
}

/**
 * Collect all tracked + untracked files under the repo root.
 * Returns repo-relative paths (no leading slash).
 */
function workingTreeFiles(vfs: VFSMap, root: string): string[] {
  const prefix = root === '/' ? '/' : root + '/';
  const results: string[] = [];
  for (const [k, v] of vfs) {
    if (v.kind !== 'file') continue;
    if (!k.startsWith(prefix)) continue;
    const rel = k.slice(prefix.length);
    // Exclude .git internals from user-visible output
    if (rel.startsWith('.git/') || rel === '.git') continue;
    results.push(rel);
  }
  return results.sort();
}

/** Read a file from the VFS relative to repo root. Returns null if missing. */
function readRepoFile(vfs: VFSMap, root: string, relPath: string): string | null {
  const abs = root === '/' ? `/${relPath}` : `${root}/${relPath}`;
  const entry = vfs.get(abs);
  return entry?.kind === 'file' ? entry.content : null;
}

/** Write a file to the VFS relative to repo root. */
function writeRepoFile(vfs: VFSMap, root: string, relPath: string, content: string): void {
  const abs = root === '/' ? `/${relPath}` : `${root}/${relPath}`;
  ensureDirs(vfs, abs);
  vfs.set(abs, { kind: 'file', content });
}

/** HEAD commit object, or null if no commits yet. */
function headCommit(repo: GitRepo): GitCommit | null {
  const hash = repo.detached ? repo.HEAD : repo.branches[repo.HEAD];
  if (!hash) return null;
  return repo.commits[hash] ?? null;
}

// ─── Diff utility ─────────────────────────────────────────────────────────────

function simpleDiff(oldContent: string | null, newContent: string | null, label: string): string[] {
  const oldLines = (oldContent ?? '').split('\n');
  const newLines = (newContent ?? '').split('\n');

  if (oldContent === newContent) return [];

  const lines: string[] = [`--- a/${label}`, `+++ b/${label}`];

  // Naive line diff — good enough for teaching
  const maxLen = Math.max(oldLines.length, newLines.length);
  let i = 0, j = 0;
  while (i < oldLines.length || j < newLines.length) {
    const o = oldLines[i];
    const n = newLines[j];
    if (i >= oldLines.length) {
      lines.push(`+${n}`); j++;
    } else if (j >= newLines.length) {
      lines.push(`-${o}`); i++;
    } else if (o === n) {
      lines.push(` ${o}`); i++; j++;
    } else {
      lines.push(`-${o}`); i++;
      lines.push(`+${n}`); j++;
    }
    void maxLen; // suppress unused warning
  }
  return lines;
}

// ─── Subcommand implementations ───────────────────────────────────────────────

function gitInit(args: string[], state: ShellState): CommandResult {
  const existing = loadRepo(state.env);
  const root = state.cwd;

  if (existing?.initialized) {
    return {
      output: [{ kind: 'info', text: `Reinitialized existing Git repository in ${root}/.git/` }],
      state,
    };
  }

  const repo = emptyRepo();
  const vfs = state.vfs;

  // Create .git skeleton in VFS (visible with ls -a)
  const gitRoot = `${root}/.git`;
  vfs.set(gitRoot, { kind: 'dir' });
  vfs.set(`${gitRoot}/objects`, { kind: 'dir' });
  vfs.set(`${gitRoot}/refs`, { kind: 'dir' });
  vfs.set(`${gitRoot}/refs/heads`, { kind: 'dir' });
  vfs.set(`${gitRoot}/HEAD`, { kind: 'file', content: 'ref: refs/heads/main\n' });

  let newState = saveRepo(repo, state);
  newState = { ...newState, env: { ...newState.env, __git_root__: root } };

  return {
    output: [{ kind: 'stdout', text: `Initialized empty Git repository in ${root}/.git/` }],
    state: newState,
  };
}

function gitConfig(args: string[], state: ShellState): CommandResult {
  const repo = loadRepo(state.env);
  if (!repo) return notInRepo(state);

  // git config user.name "Alice"
  // git config user.email alice@example.com
  if (args[0] === 'user.name' && args[1]) {
    repo.config.name = args[1];
    return { output: [], state: saveRepo(repo, state) };
  }
  if (args[0] === 'user.email' && args[1]) {
    repo.config.email = args[1];
    return { output: [], state: saveRepo(repo, state) };
  }
  // Read-only query: git config user.name
  if (args[0] === 'user.name') {
    return { output: [{ kind: 'stdout', text: repo.config.name }], state };
  }
  if (args[0] === 'user.email') {
    return { output: [{ kind: 'stdout', text: repo.config.email }], state };
  }

  return { output: [{ kind: 'stderr', text: `git config: unknown key '${args[0] ?? ''}'` }], state };
}

function gitStatus(args: string[], state: ShellState): CommandResult {
  const repo = loadRepo(state.env);
  if (!repo) return notInRepo(state);

  const root = getRoot(state.env);
  const head = headCommit(repo);
  const headTree = head?.tree ?? {};

  const lines: string[] = [];

  const branchLabel = repo.detached
    ? `HEAD detached at ${repo.HEAD.slice(0, 7)}`
    : `On branch ${repo.HEAD}`;
  lines.push(branchLabel);

  if (!head) lines.push('No commits yet\n');

  // Unmerged paths (merge conflict state)
  const conflictEntries = Object.keys(repo.conflicts ?? {});
  if (conflictEntries.length > 0) {
    lines.push('\nUnmerged paths:');
    lines.push('  (use "git add <file>" to mark resolution)');
    for (const f of conflictEntries.sort()) lines.push(`\tboth modified:   ${f}`);
  }

  // Staged changes (index vs HEAD tree)
  const staged: string[] = [];
  for (const [rel, content] of Object.entries(repo.index)) {
    const headContent = headTree[rel] ?? null;
    if (headContent === null) staged.push(`new file:   ${rel}`);
    else if (headContent !== content) staged.push(`modified:   ${rel}`);
  }
  // Staged deletions
  for (const rel of Object.keys(headTree)) {
    if (!(rel in repo.index) && repo.index[rel] === undefined) {
      // only if it's also gone from working tree
      const wt = readRepoFile(state.vfs, root, rel);
      if (wt === null) staged.push(`deleted:    ${rel}`);
    }
  }

  // Unstaged changes (working tree vs index, or vs HEAD if not staged)
  const unstaged: string[] = [];
  const untracked: string[] = [];
  const wtFiles = workingTreeFiles(state.vfs, root);

  for (const rel of wtFiles) {
    const wtContent = readRepoFile(state.vfs, root, rel) ?? '';
    if (rel in repo.index) {
      if (repo.index[rel] !== wtContent) unstaged.push(`modified:   ${rel}`);
    } else if (rel in headTree) {
      if (headTree[rel] !== wtContent) unstaged.push(`modified:   ${rel}`);
    } else {
      untracked.push(rel);
    }
  }

  // Files deleted from working tree but still in index
  for (const rel of Object.keys(repo.index)) {
    if (!wtFiles.includes(rel)) unstaged.push(`deleted:    ${rel}`);
  }

  if (staged.length > 0) {
    lines.push('\nChanges to be committed:');
    lines.push('  (use "git restore --staged <file>" to unstage)');
    for (const s of staged) lines.push(`\t${s}`);
  }
  if (unstaged.length > 0) {
    lines.push('\nChanges not staged for commit:');
    lines.push('  (use "git add <file>" to update what will be committed)');
    for (const u of unstaged) lines.push(`\t${u}`);
  }
  if (untracked.length > 0) {
    lines.push('\nUntracked files:');
    lines.push('  (use "git add <file>" to include in what will be committed)');
    for (const u of untracked) lines.push(`\t${u}`);
  }
  if (staged.length === 0 && unstaged.length === 0 && untracked.length === 0) {
    lines.push('\nnothing to commit, working tree clean');
  }

  return { output: lines.map(t => ({ kind: 'stdout' as const, text: t })), state };
}

function gitAdd(args: string[], state: ShellState): CommandResult {
  const repo = loadRepo(state.env);
  if (!repo) return notInRepo(state);

  const root = getRoot(state.env);

  if (args.length === 0) {
    return { output: [{ kind: 'stderr', text: 'Nothing specified, nothing added.' }], state };
  }

  const toStage: string[] = [];

  for (const arg of args) {
    if (arg === '.') {
      toStage.push(...workingTreeFiles(state.vfs, root));
    } else {
      // Resolve relative to cwd, then make repo-relative
      const abs = resolvePath(state.cwd, arg);
      const absRoot = root === '/' ? '' : root;
      if (!abs.startsWith(absRoot + '/') && abs !== root) {
        return { output: [{ kind: 'stderr', text: `fatal: '${arg}' is outside repository` }], state };
      }
      const rel = abs.slice(absRoot.length + 1);
      const entry = state.vfs.get(abs);
      if (!entry) {
        return { output: [{ kind: 'stderr', text: `fatal: pathspec '${arg}' did not match any files` }], state };
      }
      if (entry.kind === 'dir') {
        // Stage all files under this dir
        toStage.push(...workingTreeFiles(state.vfs, root).filter(r => r.startsWith(rel + '/')));
      } else {
        toStage.push(rel);
      }
    }
  }

  for (const rel of toStage) {
    const content = readRepoFile(state.vfs, root, rel);
    if (content !== null) {
      repo.index[rel] = content;
      // Mark conflict resolved when learner stages the file
      if (repo.conflicts && rel in repo.conflicts) {
        delete repo.conflicts[rel];
      }
    }
  }

  return { output: [], state: saveRepo(repo, state) };
}

function gitDiff(args: string[], state: ShellState): CommandResult {
  const repo = loadRepo(state.env);
  if (!repo) return notInRepo(state);

  const root = getRoot(state.env);
  const staged = args.includes('--staged') || args.includes('--cached');
  const head = headCommit(repo);
  const headTree = head?.tree ?? {};

  const lines: string[] = [];

  if (staged) {
    // Index vs HEAD
    const allKeys = new Set([...Object.keys(repo.index), ...Object.keys(headTree)]);
    for (const rel of [...allKeys].sort()) {
      const oldContent = headTree[rel] ?? null;
      const newContent = repo.index[rel] ?? null;
      lines.push(...simpleDiff(oldContent, newContent, rel));
    }
  } else {
    // Working tree vs index (or HEAD if not staged)
    const wtFiles = workingTreeFiles(state.vfs, root);
    const allKeys = new Set([...wtFiles, ...Object.keys(repo.index), ...Object.keys(headTree)]);
    for (const rel of [...allKeys].sort()) {
      const baseline = rel in repo.index ? repo.index[rel] : (headTree[rel] ?? null);
      const wtContent = readRepoFile(state.vfs, root, rel);
      lines.push(...simpleDiff(baseline, wtContent, rel));
    }
  }

  if (lines.length === 0) return { output: [], state };
  return { output: lines.map(t => ({ kind: 'stdout' as const, text: t })), state };
}

function gitCommit(args: string[], state: ShellState): CommandResult {
  const repo = loadRepo(state.env);
  if (!repo) return notInRepo(state);

  // Check for unresolved merge conflicts (cleared by gitAdd when learner resolves each file)
  if (Object.keys(repo.conflicts ?? {}).length > 0) {
    return {
      output: [{ kind: 'stderr', text: 'error: Committing is not possible because you have unmerged files.' }],
      state,
    };
  }

  const mIdx = args.indexOf('-m');
  if (mIdx === -1 || !args[mIdx + 1]) {
    return { output: [{ kind: 'stderr', text: 'error: switch `m\' requires a value' }], state };
  }
  const message = args[mIdx + 1];

  if (Object.keys(repo.index).length === 0) {
    return { output: [{ kind: 'stderr', text: 'On branch ' + repo.HEAD + '\nnothing to commit, working tree clean' }], state };
  }

  const author = repo.config.name
    ? `${repo.config.name} <${repo.config.email}>`
    : 'Unknown <>';

  const timestamp = new Date().toISOString();
  repo._seq += 1;
  const hash = makeHash(repo._seq, message + timestamp);

  const parent = repo.branches[repo.HEAD] || null;
  const parent2 = repo.mergeHead;

  // Merge current HEAD tree with index to form new tree
  const parentTree = parent ? (repo.commits[parent]?.tree ?? {}) : {};
  const newTree: Record<string, string> = { ...parentTree, ...repo.index };

  const commit: GitCommit = {
    hash, message, author, timestamp, parent,
    ...(parent2 ? { parent2 } : {}),
    tree: newTree,
  };
  repo.commits[hash] = commit;
  repo.branches[repo.HEAD] = hash;
  repo.index = {};
  repo.mergeHead = undefined;

  // Update .git/HEAD and refs in VFS (cosmetic)
  const root = getRoot(state.env);
  writeRepoFile(
    state.vfs, root + '/.git', `refs/heads/${repo.HEAD}`, hash + '\n',
  );

  return {
    output: [
      { kind: 'stdout', text: `[${repo.HEAD} ${hash}] ${message}` },
      { kind: 'stdout', text: `  ${Object.keys(newTree).length} file(s) in tree` },
    ],
    state: saveRepo(repo, state),
  };
}

function gitLog(args: string[], state: ShellState): CommandResult {
  const repo = loadRepo(state.env);
  if (!repo) return notInRepo(state);

  const oneline = args.includes('--oneline');

  const startHash = repo.detached ? repo.HEAD : repo.branches[repo.HEAD];
  if (!startHash) {
    return { output: [{ kind: 'stderr', text: 'fatal: your current branch \'main\' does not have any commits yet' }], state };
  }

  const lines: string[] = [];
  let cur: string | null = startHash;
  while (cur && repo.commits[cur]) {
    const c = repo.commits[cur] as GitCommit;
    if (oneline) {
      lines.push(`${c.hash}  ${c.message}`);
    } else {
      lines.push(`commit ${c.hash}`);
      lines.push(`Author: ${c.author}`);
      lines.push(`Date:   ${new Date(c.timestamp).toUTCString()}`);
      lines.push('');
      lines.push(`    ${c.message}`);
      lines.push('');
    }
    cur = c.parent;
  }

  return { output: lines.map(t => ({ kind: 'stdout' as const, text: t })), state };
}

function gitBranch(args: string[], state: ShellState): CommandResult {
  const repo = loadRepo(state.env);
  if (!repo) return notInRepo(state);

  const nonFlags = args.filter(a => !a.startsWith('-'));

  if (nonFlags.length === 0) {
    // List branches
    const lines = Object.keys(repo.branches).sort().map(b =>
      b === repo.HEAD && !repo.detached ? `* ${b}` : `  ${b}`,
    );
    return { output: lines.map(t => ({ kind: 'stdout' as const, text: t })), state };
  }

  // Create branch
  const newName = nonFlags[0];
  if (repo.branches[newName] !== undefined) {
    return { output: [{ kind: 'stderr', text: `fatal: A branch named '${newName}' already exists.` }], state };
  }
  const currentHash = repo.branches[repo.HEAD] ?? '';
  repo.branches[newName] = currentHash;

  return { output: [], state: saveRepo(repo, state) };
}

/**
 * Shared branch-switching logic for `git checkout` and `git switch`.
 * Returns a CommandResult when the operation completed (success or branch-exists error),
 * or null when the target branch was not found (so callers can handle their own fallbacks).
 */
function switchToBranch(
  target: string,
  createNew: boolean,
  state: ShellState,
  repo: GitRepo,
): CommandResult | null {
  const root = getRoot(state.env);

  if (createNew) {
    if (repo.branches[target] !== undefined) {
      return { output: [{ kind: 'stderr', text: `fatal: A branch named '${target}' already exists.` }], state };
    }
    const currentHash = repo.branches[repo.HEAD] ?? '';
    repo.branches[target] = currentHash;
    repo.HEAD = target;
    repo.detached = false;
    return {
      output: [{ kind: 'stdout', text: `Switched to a new branch '${target}'` }],
      state: saveRepo(repo, state),
    };
  }

  if (repo.branches[target] !== undefined) {
    repo.HEAD = target;
    repo.detached = false;
    repo.index = {};
    const hash = repo.branches[target];
    if (hash && repo.commits[hash]) {
      restoreTree(state.vfs, root, repo.commits[hash].tree);
    }
    return {
      output: [{ kind: 'stdout', text: `Switched to branch '${target}'` }],
      state: saveRepo(repo, state),
    };
  }

  return null; // branch not found — caller handles
}

function gitCheckout(args: string[], state: ShellState): CommandResult {
  const repo = loadRepo(state.env);
  if (!repo) return notInRepo(state);

  const createNew = args.includes('-b');
  const target = args.find(a => !a.startsWith('-'));

  if (!target) {
    return { output: [{ kind: 'stderr', text: 'error: you must specify a branch or commit' }], state };
  }

  const result = switchToBranch(target, createNew, state, repo);
  if (result) return result;

  // Fallback: try detached HEAD at commit hash
  const root = getRoot(state.env);
  if (repo.commits[target]) {
    repo.HEAD = target;
    repo.detached = true;
    repo.index = {};
    restoreTree(state.vfs, root, repo.commits[target].tree);
    return {
      output: [
        { kind: 'info', text: `HEAD is now at ${target.slice(0, 7)}` },
        { kind: 'info', text: `You are in 'detached HEAD' state.` },
      ],
      state: saveRepo(repo, state),
    };
  }

  return { output: [{ kind: 'stderr', text: `error: pathspec '${target}' did not match any file(s) known to git` }], state };
}

/** Restore VFS tracked files to match a commit tree. Untracked files are untouched. */
function restoreTree(vfs: VFSMap, root: string, tree: Record<string, string>): void {
  for (const [rel, content] of Object.entries(tree)) {
    writeRepoFile(vfs, root, rel, content);
  }
}

function gitSwitch(args: string[], state: ShellState): CommandResult {
  const repo = loadRepo(state.env);
  if (!repo) return notInRepo(state);

  const createNew = args.includes('-c') || args.includes('--create');
  const target = args.find(a => !a.startsWith('-'));

  if (!target) {
    return { output: [{ kind: 'stderr', text: 'error: you must specify a branch name' }], state };
  }

  const result = switchToBranch(target, createNew, state, repo);
  if (result) return result;

  return { output: [{ kind: 'stderr', text: `fatal: invalid reference: '${target}'` }], state };
}

/** Walk both commit chains and return the first common ancestor hash, or null. */
function findMergeBase(repo: GitRepo, hashA: string, hashB: string): string | null {
  const ancestorsA = new Set<string>();
  let walk: string | null = hashA;
  while (walk && repo.commits[walk]) {
    ancestorsA.add(walk);
    walk = repo.commits[walk].parent;
  }
  walk = hashB;
  while (walk && repo.commits[walk]) {
    if (ancestorsA.has(walk)) return walk;
    walk = repo.commits[walk].parent;
  }
  return null;
}

function gitMerge(args: string[], state: ShellState): CommandResult {
  const repo = loadRepo(state.env);
  if (!repo) return notInRepo(state);

  const target = args.find(a => !a.startsWith('-'));
  if (!target) return { output: [{ kind: 'stderr', text: 'error: no branch name given' }], state };

  if (!(target in repo.branches)) {
    return { output: [{ kind: 'stderr', text: `merge: ${target} - not something we can merge` }], state };
  }

  const currentHash = repo.branches[repo.HEAD] ?? '';
  const targetHash = repo.branches[target] ?? '';

  if (!targetHash) {
    return { output: [{ kind: 'info', text: 'Already up to date.' }], state };
  }
  if (currentHash === targetHash) {
    return { output: [{ kind: 'info', text: 'Already up to date.' }], state };
  }

  // Check if target is a descendant of current (fast-forward possible)
  let isFastForward = false;
  let walk: string | null = targetHash;
  while (walk && repo.commits[walk]) {
    if (walk === currentHash) { isFastForward = true; break; }
    walk = repo.commits[walk].parent;
  }

  if (isFastForward) {
    repo.branches[repo.HEAD] = targetHash;
    const root = getRoot(state.env);
    restoreTree(state.vfs, root, repo.commits[targetHash].tree);
    return {
      output: [
        { kind: 'stdout', text: `Updating ${currentHash.slice(0, 7)}..${targetHash.slice(0, 7)}` },
        { kind: 'stdout', text: 'Fast-forward' },
      ],
      state: saveRepo(repo, state),
    };
  }

  // Three-way merge
  const root = getRoot(state.env);
  const mergeBase = findMergeBase(repo, currentHash, targetHash);
  const baseTree: Record<string, string> = mergeBase && repo.commits[mergeBase]
    ? repo.commits[mergeBase].tree
    : {};
  const currentTree: Record<string, string> = currentHash && repo.commits[currentHash]
    ? repo.commits[currentHash].tree
    : {};
  const targetTree: Record<string, string> = repo.commits[targetHash].tree;

  const allFiles = new Set([
    ...Object.keys(baseTree),
    ...Object.keys(currentTree),
    ...Object.keys(targetTree),
  ]);

  const mergedTree: Record<string, string> = { ...currentTree };
  const conflicts: Record<string, { ours: string; theirs: string; base: string }> = {};

  for (const file of allFiles) {
    const base = baseTree[file] ?? null;
    const ours = currentTree[file] ?? null;
    const theirs = targetTree[file] ?? null;

    const oursChanged = ours !== base;
    const theirsChanged = theirs !== base;

    if (!oursChanged && !theirsChanged) {
      // Unchanged on both sides — keep as-is
    } else if (oursChanged && !theirsChanged) {
      // Only ours changed — already in mergedTree via currentTree copy
    } else if (!oursChanged && theirsChanged) {
      // Only theirs changed — take theirs
      if (theirs === null) {
        delete mergedTree[file];
      } else {
        mergedTree[file] = theirs;
      }
    } else if (ours === theirs) {
      // Both changed identically — no conflict
      mergedTree[file] = ours!;
    } else {
      // True conflict — write conflict markers to working tree
      conflicts[file] = { ours: ours ?? '', theirs: theirs ?? '', base: base ?? '' };
      const conflictContent = [
        '<<<<<<< HEAD',
        ours ?? '',
        '=======',
        theirs ?? '',
        `>>>>>>> ${target}`,
      ].join('\n');
      writeRepoFile(state.vfs, root, file, conflictContent);
      delete mergedTree[file];
    }
  }

  if (Object.keys(conflicts).length === 0) {
    // Auto-merge succeeded — restore working tree and create merge commit
    for (const [file, content] of Object.entries(mergedTree)) {
      writeRepoFile(state.vfs, root, file, content);
    }

    repo._seq += 1;
    const mergeMessage = `Merge branch '${target}' into ${repo.HEAD}`;
    const mergeHash = makeHash(repo._seq, mergeMessage + new Date().toISOString());
    const mergeAuthor = repo.config.name
      ? `${repo.config.name} <${repo.config.email}>`
      : 'Unknown <>';
    const mergeCommit: GitCommit = {
      hash: mergeHash,
      message: mergeMessage,
      author: mergeAuthor,
      timestamp: new Date().toISOString(),
      parent: currentHash || null,
      parent2: targetHash,
      tree: mergedTree,
    };
    repo.commits[mergeHash] = mergeCommit;
    repo.branches[repo.HEAD] = mergeHash;
    repo.index = {};

    const changedFiles = [...allFiles].filter(
      f => (mergedTree[f] ?? null) !== (currentTree[f] ?? null),
    );
    return {
      output: [
        { kind: 'stdout', text: `Merge made by the 'ort' strategy.` },
        ...changedFiles.map(f => ({ kind: 'stdout' as const, text: `  ${f}` })),
      ],
      state: saveRepo(repo, state),
    };
  }

  // Conflicts detected — stage auto-merged files and record conflicts
  repo.index = { ...mergedTree };
  repo.conflicts = conflicts;
  repo.mergeHead = targetHash;

  const mergeOutput: Array<{ kind: 'stdout' | 'stderr' | 'info'; text: string }> = [];
  for (const f of Object.keys(conflicts)) {
    mergeOutput.push({ kind: 'stderr', text: `CONFLICT (content): Merge conflict in ${f}` });
  }
  mergeOutput.push({ kind: 'stderr', text: 'Automatic merge failed; fix conflicts and then commit the result.' });

  return { output: mergeOutput, state: saveRepo(repo, state) };
}

function gitReset(args: string[], state: ShellState): CommandResult {
  const repo = loadRepo(state.env);
  if (!repo) return notInRepo(state);

  // git reset HEAD <file>  →  unstage file
  if (args[0] === 'HEAD' && args[1]) {
    const rel = args[1];
    if (rel in repo.index) {
      delete repo.index[rel];
      return { output: [{ kind: 'stdout', text: `Unstaged changes after reset:\nM\t${rel}` }], state: saveRepo(repo, state) };
    }
    return { output: [], state };
  }

  return { output: [{ kind: 'stderr', text: `error: unknown reset mode '${args.join(' ')}'` }], state };
}

function gitRestore(args: string[], state: ShellState): CommandResult {
  const repo = loadRepo(state.env);
  if (!repo) return notInRepo(state);

  const staged = args.includes('--staged');
  const files = args.filter(a => !a.startsWith('-'));

  if (files.length === 0) {
    return { output: [{ kind: 'stderr', text: 'error: no pathspec specified' }], state };
  }

  const root = getRoot(state.env);
  const head = headCommit(repo);
  const headTree = head?.tree ?? {};

  for (const rel of files) {
    if (staged) {
      // Unstage
      delete repo.index[rel];
    } else {
      // Restore working tree file from HEAD (or index)
      const content = repo.index[rel] ?? headTree[rel] ?? null;
      if (content === null) {
        return { output: [{ kind: 'stderr', text: `error: pathspec '${rel}' did not match any file(s) known to git` }], state };
      }
      writeRepoFile(state.vfs, root, rel, content);
    }
  }

  return { output: [], state: saveRepo(repo, state) };
}

// ─── Error helper ──────────────────────────────────────────────────────────────

function notInRepo(state: ShellState): CommandResult {
  return {
    output: [{ kind: 'stderr', text: 'fatal: not a git repository (or any of the parent directories): .git' }],
    state,
  };
}

// ─── Help ──────────────────────────────────────────────────────────────────────

function gitHelp(state: ShellState): CommandResult {
  const cmds = [
    'init                         Initialize a new repository',
    'config user.name <name>      Set commit author name',
    'config user.email <email>    Set commit author email',
    'status                       Show working tree status',
    'add <file|.>                 Stage file(s)',
    'diff [--staged]              Show unstaged or staged changes',
    'commit -m <message>          Create a commit',
    'log [--oneline]              Show commit history',
    'branch [name]                List or create branches',
    'checkout <branch>            Switch branch',
    'checkout -b <name>           Create and switch to new branch',
    'switch <branch>              Switch branch (modern syntax)',
    'switch -c|--create <name>    Create and switch to new branch (modern syntax)',
    'merge <branch>               Merge branch (fast-forward or three-way)',
    'reset HEAD <file>            Unstage a file',
    'restore <file>               Discard working-tree changes',
    '',
    'Conflict resolution workflow:',
    '  1. On CONFLICT: edit conflicted files and remove the marker lines',
    '  2. git add <file>           Mark each conflict resolved',
    '  3. git commit -m "msg"      Complete the merge',
  ];
  return {
    output: [
      { kind: 'info', text: 'usage: git <command> [<args>]' },
      { kind: 'info', text: '' },
      { kind: 'info', text: 'Available commands:' },
      ...cmds.map(t => ({ kind: 'stdout' as const, text: `  ${t}` })),
    ],
    state,
  };
}

// ─── Plugin entry point ────────────────────────────────────────────────────────

export const gitPlugin: CommandPlugin = {
  name: 'git',
  run(args: string[], state: ShellState): CommandResult {
    const sub = args[0];
    const rest = args.slice(1);

    switch (sub) {
      case 'init':     return gitInit(rest, state);
      case 'config':   return gitConfig(rest, state);
      case 'status':   return gitStatus(rest, state);
      case 'add':      return gitAdd(rest, state);
      case 'diff':     return gitDiff(rest, state);
      case 'commit':   return gitCommit(rest, state);
      case 'log':      return gitLog(rest, state);
      case 'branch':   return gitBranch(rest, state);
      case 'checkout': return gitCheckout(rest, state);
      case 'switch':   return gitSwitch(rest, state);
      case 'merge':    return gitMerge(rest, state);
      case 'reset':    return gitReset(rest, state);
      case 'restore':  return gitRestore(rest, state);
      case undefined:
      case '--help':
      case 'help':     return gitHelp(state);
      default:
        return {
          output: [{ kind: 'stderr', text: `git: '${sub}' is not a git command. See 'git help'.` }],
          state,
        };
    }
  },
};
