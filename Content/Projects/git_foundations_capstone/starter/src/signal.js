'use strict';

const https = require('https');
const http = require('http');

const DEFAULT_ENDPOINTS = [
  { name: 'API Gateway', url: 'http://localhost:3000/health' },
  { name: 'Auth Service', url: 'http://localhost:3001/health' },
];

function checkEndpoint(endpoint) {
  return new Promise((resolve) => {
    const client = endpoint.url.startsWith('https') ? https : http;
    const req = client.get(endpoint.url, (res) => {
      const ok = res.statusCode >= 200 && res.statusCode < 300;
      resolve({ name: endpoint.name, status: ok ? 'UP' : 'DOWN', code: res.statusCode });
    });

    req.on('error', () => {
      resolve({ name: endpoint.name, status: 'UNREACHABLE', code: null });
    });

    req.setTimeout(3000, () => {
      req.destroy();
      resolve({ name: endpoint.name, status: 'TIMEOUT', code: null });
    });
  });
}

async function main() {
  const endpoints = DEFAULT_ENDPOINTS;
  const results = await Promise.all(endpoints.map(checkEndpoint));

  results.forEach(({ name, status, code }) => {
    const codeStr = code !== null ? ` [${code}]` : '';
    console.log(`${status.padEnd(12)} ${name}${codeStr}`);
  });
}

main();
