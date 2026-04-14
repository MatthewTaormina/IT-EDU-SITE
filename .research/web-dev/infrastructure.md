---
tags: [web-dev, infrastructure, devops, deployment, docker, ci-cd, cloud, hosting]
related_topics:
  - "[[frontend-stack]]"
  - "[[backend-stack]]"
  - "[[web-standards]]"
  - "[[core-competencies-fullstack]]"
last_updated: "2026-04-14"
---

## Summary for AI Agents

Web infrastructure covers the deployment, hosting, networking, and operational concerns that make web applications available to users. Key topics for IT education: static site hosting (Netlify, Vercel), application deployment platforms (Render, Railway, Fly.io), DNS and domain management, HTTPS/TLS, Docker fundamentals, and CI/CD with GitHub Actions. Environment management and secrets handling are security-critical and must be taught as foundational, not advanced. The key instructional principle: introduce deployment incrementally — static deployment at lesson 1, backend deployment after Express is understood, Docker after deployment basics.

---

# Web Infrastructure and Deployment

## Overview

**Web infrastructure** is the collection of systems, services, and processes that make web applications accessible to users over the internet. It includes hosting platforms, networking, security certificates, containerization, and automated deployment pipelines.

For full-stack web development, infrastructure literacy is a professional requirement — developers who cannot deploy their own applications are dependent on others to deliver work to users.

---

## 1. The Deployment Landscape

### Static vs. Dynamic Applications

| Application Type | Characteristics | Deployment Target |
| :--- | :--- | :--- |
| **Static site** | HTML, CSS, JS only; no server-side processing | CDN/static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages) |
| **SPA (Single-Page App)** | Built by Vite/CRA; static files + client-side routing | Same as static; requires fallback routing config |
| **Backend API** | Node.js/Express; server process must run continuously | Application platform (Render, Railway, Fly.io) or IaaS (AWS EC2, DigitalOcean) |
| **Full-stack (unified)** | Next.js, Remix, SvelteKit; SSR/SSG + API in one app | Vercel (Next.js native), Netlify, Fly.io |
| **Full-stack (separated)** | React frontend + Express API as separate projects | Frontend on Vercel/Netlify; Backend on Render/Railway |

---

## 2. Static Site Hosting

### Netlify

**Best for:** Hobbyist projects, learner portfolios, marketing sites, documentation sites.

**Features relevant to education:**
- Deploy by connecting a GitHub repository — automatic builds on push
- Free SSL certificate (Let's Encrypt) on all sites
- Custom domain support
- Netlify Functions (serverless functions for lightweight backend logic)
- Form handling without a backend
- Branch deploys (every PR gets a preview URL)

**Build command:** `npm run build`
**Publish directory:** `dist` (Vite) or `build` (CRA)

### Vercel

**Best for:** Next.js applications (Vercel created Next.js); React SPAs; TypeScript projects.

**Features:**
- Native Next.js support (SSR, SSG, ISR, API routes all work out of the box)
- Automatic branch previews
- Edge functions
- Analytics and performance monitoring
- Free tier is generous for educational use

### GitHub Pages

**Best for:** Simple static sites, documentation (via Docsify/MkDocs), learner portfolios with minimal build steps.

**Limitations:** No server-side code; no environment variable injection at build time without GitHub Actions; custom domains require DNS configuration.

---

## 3. Application Hosting (Backend / Full-Stack)

For applications that require a running server process (Express, databases, background jobs), a platform that maintains persistent processes is required.

### Render

**Best for teaching because:**
- Free tier available (spins down after 15 minutes of inactivity — acceptable for learning)
- PostgreSQL database hosting (also free tier)
- Simple GitHub integration with auto-deploy on push
- Web services, private services, cron jobs, and static sites in one platform
- Straightforward environment variable management via dashboard

### Railway

**Features:**
- Template-based deployments (Node.js, PostgreSQL, Redis in a few clicks)
- Generous free tier (500 hours/month)
- Database provisioning integrated with app
- Good DX (developer experience) for small to mid-size projects

### Fly.io

**Features:**
- Deploy Docker containers globally
- More infrastructure control than Render/Railway
- Good for teaching Docker-based deployment
- Free tier available

---

## 4. DNS and Domains

### How DNS Works

DNS (Domain Name System) translates human-readable domain names (`example.com`) to IP addresses (`93.184.216.34`).

Resolution process:

```
Browser → Recursive Resolver → Root Nameserver → TLD Nameserver → Authoritative Nameserver → IP Address
```

### DNS Record Types

| Record Type | Purpose | Example |
| :--- | :--- | :--- |
| **A** | Maps domain to IPv4 address | `example.com → 93.184.216.34` |
| **AAAA** | Maps domain to IPv6 address | `example.com → 2606:2800:220:1::` |
| **CNAME** | Alias — maps one domain to another | `www.example.com → example.com` |
| **MX** | Mail exchange server | `mail.example.com` |
| **TXT** | Arbitrary text; used for verification | SPF, DKIM, site verification |
| **NS** | Nameserver — points to authoritative DNS | Cloudflare, AWS Route 53 |

### Domain Registration and Hosting Providers

- **Namecheap**, **Porkbun**, **Google Domains** — registrars
- **Cloudflare** — DNS management + CDN + DDoS protection (free tier is excellent)

---

## 5. HTTPS and TLS

All production web applications must serve content over HTTPS. HTTP is deprecated for production use.

### TLS Certificates

| Provider | Cost | Notes |
| :--- | :--- | :--- |
| **Let's Encrypt** | Free | Automated; 90-day certificates; used by Netlify, Vercel, Render |
| **Cloudflare** | Free (managed) | Cloudflare terminates TLS; backend can be plain HTTP to Cloudflare |
| **DigiCert, Comodo** | Paid | Extended Validation (EV) certificates; used for financial institutions |

### Security Headers

Modern web applications should include HTTP security headers:

| Header | Purpose |
| :--- | :--- |
| `Strict-Transport-Security` | Forces HTTPS; prevents downgrade |
| `Content-Security-Policy` | Restricts resource origins; mitigates XSS |
| `X-Content-Type-Options: nosniff` | Prevents MIME type sniffing |
| `X-Frame-Options: DENY` | Prevents clickjacking via iframes |
| `Referrer-Policy` | Controls referrer information sent in requests |

---

## 6. Environment Management

### The Twelve-Factor App (Heroku, 2011)

The Twelve-Factor App methodology defines best practices for modern, portable web applications. Factors most relevant to education:

| Factor | Rule |
| :--- | :--- |
| **III. Config** | Store all configuration (API keys, DB URLs) in environment variables, not in code |
| **IV. Backing services** | Treat databases, caches, and external services as attached resources |
| **V. Build, release, run** | Strictly separate build, release, and run stages |
| **X. Dev/prod parity** | Keep development and production environments as similar as possible |

### `.env` File Management

```bash
# .env (local development only — NEVER commit this file)
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
JWT_SECRET=super-secret-development-key
PORT=3000
NODE_ENV=development
```

`.env` files must be in `.gitignore`. Use `.env.example` (with placeholder values, no real secrets) to document required environment variables for new contributors.

---

## 7. Docker

Docker is a platform for packaging applications and their dependencies into portable, isolated containers.

### Why Docker for Education

| Benefit | Description |
| :--- | :--- |
| **Reproducibility** | "Works on my machine" problems eliminated; same container everywhere |
| **Isolation** | Application dependencies don't conflict with the host system |
| **Portability** | Build once, run anywhere (local, CI, production) |
| **Industry standard** | Expected knowledge for mid-level and senior developers |

### Core Concepts

| Concept | Description |
| :--- | :--- |
| **Image** | Read-only template; the blueprint for a container |
| **Container** | A running instance of an image |
| **Dockerfile** | Instructions for building an image |
| **Docker Hub** | Public registry of pre-built images |
| **Volume** | Persistent storage that survives container restarts |
| **Network** | Communication channel between containers |

### Minimal Node.js Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "src/index.js"]
```

### Docker Compose

Docker Compose orchestrates multi-container applications (app + database + cache) with a single `docker-compose.yml`:

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/mydb
    depends_on:
      - db
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 8. CI/CD — Continuous Integration / Continuous Deployment

**CI/CD** automates the process of testing and deploying code changes.

| Stage | What Happens | Tool |
| :--- | :--- | :--- |
| **Continuous Integration** | Tests run on every push/PR; blocks merge if tests fail | GitHub Actions |
| **Continuous Delivery** | App is always in a deployable state; deploy manually | Render, Railway |
| **Continuous Deployment** | Automatically deploys to production when tests pass | Vercel, Netlify |

### GitHub Actions Example

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
```

---

## Key Takeaways

- Deploy early: connect a GitHub repo to Netlify on Day 1 so learners see their work live.
- Static hosting (Netlify, Vercel) is the entry point; backend hosting (Render) comes after Express is understood.
- Environment variables are security-critical: secrets must never be in code or committed to version control.
- DNS is a foundational networking concept that every full-stack developer must understand.
- Docker is a threshold skill for mid-level development; introduce it after basic deployment is comfortable.
- CI/CD with GitHub Actions teaches professional workflow and protects against regressions.
