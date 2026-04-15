# README — Signal Board

Signal Board is a command-line tool that polls a list of configured HTTP endpoints and reports their status to stdout. It is designed for small operations teams who need a fast, dependency-free way to check service health without opening a browser.

---

## Status

Signal Board is under active development. The core polling engine is stable.
Breaking changes to the CLI interface may occur before v1.0.

---

## Getting Started

Requires Node.js 18 or later.

```bash
git clone https://github.com/meridian-software/signal-board.git
cd signal-board
npm install
node src/signal.js
```

Configure your endpoints in `signal.config.json` before running. A sample config is included at `signal.config.example.json`.
