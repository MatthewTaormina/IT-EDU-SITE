#!/usr/bin/env node
/**
 * dump-base-vfs.mjs
 *
 * Replicates the in-memory buildRemoteVFS('sandbox') output as real files on
 * disk so that generate-vfs-manifests.mjs can crawl it to produce the base
 * layer static API under web/public/vfs/base/.
 *
 * Output: web/tmp/vfs-base/  (created or overwritten each run)
 *
 * Re-run this script whenever stateLoader.ts:buildRemoteVFS() changes, then
 * follow with:
 *   node scripts/generate-vfs-manifests.mjs \
 *     --layer base --src tmp/vfs-base --out public/vfs/base
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir  = dirname(fileURLToPath(import.meta.url));
const webDir = join(__dir, '..');
const OUT    = join(webDir, 'tmp', 'vfs-base');

// The base layer uses a fixed generic hostname; machine-specific entries are
// handled by the setup layer (vfs.json) overlaid on top.
const HOSTNAME = 'sandbox';

// ── Helpers ───────────────────────────────────────────────────────────────────

function ensureDir(p) {
  mkdirSync(join(OUT, p.slice(1)), { recursive: true });
}

function writeFile(p, content) {
  const abs = join(OUT, p.slice(1));
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content, 'utf8');
}

// ── Root ──────────────────────────────────────────────────────────────────────

mkdirSync(OUT, { recursive: true });

// ── FHS directory tree ────────────────────────────────────────────────────────

const sysDirs = [
  // FHS top-level
  '/bin', '/boot', '/dev', '/etc', '/home', '/lib', '/lib64',
  '/media', '/mnt', '/opt', '/proc', '/run', '/sbin', '/srv',
  '/tmp', '/usr', '/var',
  // /usr subtree
  '/usr/bin', '/usr/lib', '/usr/local', '/usr/local/bin', '/usr/local/lib',
  '/usr/sbin', '/usr/share', '/usr/share/doc',
  // /var subtree
  '/var/api', '/var/cache', '/var/lib', '/var/log',
  '/var/mail', '/var/mail/inbox', '/var/mail/sent',
  '/var/run', '/var/spool', '/var/tickets', '/var/tmp', '/var/www',
  // /proc stubs
  '/proc/sys', '/proc/net',
  // /dev stubs
  '/dev/pts',
  // /run stubs
  '/run/lock',
];
for (const d of sysDirs) ensureDir(d);

// ── /bin stubs ────────────────────────────────────────────────────────────────

for (const b of ['bash', 'cat', 'cp', 'echo', 'ls', 'mkdir', 'mv', 'rm', 'sh', 'touch']) {
  writeFile(`/bin/${b}`, '');
}

// ── /sbin stubs ───────────────────────────────────────────────────────────────

for (const b of ['init', 'shutdown', 'reboot']) {
  writeFile(`/sbin/${b}`, '');
}

// ── /dev stubs ────────────────────────────────────────────────────────────────

const devStubs = [
  ['null',   'character', '1', '3'],
  ['zero',   'character', '1', '5'],
  ['random', 'character', '1', '8'],
  ['tty',    'character', '5', '0'],
  ['sda',    'block',     '8', '0'],
];
for (const [name, type, major, minor] of devStubs) {
  writeFile(`/dev/${name}`, `${type} device ${major}:${minor}\n`);
}

// ── /proc stubs ───────────────────────────────────────────────────────────────

writeFile('/proc/version', 'Linux version 6.1.0-fictos (build@sandbox) (gcc 12.2.0) #1 SMP\n');
writeFile('/proc/uptime',  '3600.00 3599.00\n');
writeFile('/proc/meminfo', [
  'MemTotal:        1048576 kB',
  'MemFree:          524288 kB',
  'MemAvailable:     786432 kB',
  'Buffers:           32768 kB',
  'Cached:           196608 kB',
  '',
].join('\n'));
writeFile('/proc/cpuinfo', [
  'processor\t: 0',
  'model name\t: FictOS Virtual CPU @ 2.00GHz',
  'cpu MHz\t\t: 2000.000',
  'cache size\t: 4096 KB',
  '',
].join('\n'));

// ── /etc files ────────────────────────────────────────────────────────────────

writeFile('/etc/hostname',   `${HOSTNAME}\n`);
writeFile('/etc/os-release', [
  'NAME="FictOS"',
  'VERSION="1.0 (Sandbox Edition)"',
  'ID=fictos',
  'ID_LIKE=debian',
  'PRETTY_NAME="FictOS 1.0 (Sandbox Edition)"',
  '',
].join('\n'));
writeFile('/etc/motd',   `Welcome to ${HOSTNAME}.\nFictOS 1.0 — sandbox environment.\nType 'help' for available commands.\n`);
writeFile('/etc/fstab',  [
  '# <file system>  <mount point>  <type>   <options>       <dump>  <pass>',
  'proc             /proc          proc     defaults          0       0',
  'tmpfs            /tmp           tmpfs    defaults          0       0',
  '',
].join('\n'));
writeFile('/etc/shells', '/bin/sh\n/bin/bash\n');
writeFile('/etc/passwd', `root:x:0:0:root:/root:/bin/bash\n${HOSTNAME}:x:1000:1000::/home/${HOSTNAME}:/bin/bash\n`);

console.log(`✓ Base VFS dumped to ${OUT}`);
