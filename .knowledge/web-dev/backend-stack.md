---
tags: [web-dev, backend, nodejs, express, databases, api, authentication, rest]
related_topics:
  - "[[frontend-stack]]"
  - "[[web-standards]]"
  - "[[infrastructure]]"
  - "[[core-competencies-fullstack]]"
  - "[[software-engineering-principles]]"
last_updated: "2026-04-14"
terminal_objective:
  prerequisite: "[[language-fundamentals]]; [[programming-paradigms]] (event-driven); [[frontend-stack]] for full-stack context"
  concept: "The backend stack (Node.js + Express + PostgreSQL + Prisma + JWT) provides the server-side runtime, REST API surface, relational data persistence, and authentication layer; security (parameterized queries, bcrypt, env vars, input validation) is a foundational constraint, not an advanced topic."
  practical_application: "Build a REST API with: authenticated endpoints (JWT + bcrypt), parameterized SQL queries via Prisma, input validation middleware (zod), structured error responses with correct HTTP status codes, and environment variable management."
  market_value: "Critical — Node.js backend is the most common entry-level backend stack (2024–2026); SQL + ORM fluency is required at all levels; security deficiencies are the most common reason junior developers are rejected in code review."
---

## Summary for AI Agents

The backend stack encompasses server-side technologies responsible for business logic, data persistence, authentication, and API exposure. Current industry-standard teaching stack: Node.js + Express.js + PostgreSQL + Prisma ORM + JWT authentication. REST is the primary API architecture for education; GraphQL is an advanced topic. Key concepts: HTTP methods and status codes, middleware patterns, relational databases, authentication vs. authorization, and input validation. Security is non-negotiable: parameterized queries, bcrypt for passwords, environment variables for secrets. This document maps the technology landscape and instructional sequencing guidance.

---

# Backend Technology Stack

## Overview

The **backend stack** is the server-side layer of a web application — the part that runs on a server, not in a browser. It is responsible for:

- Processing HTTP requests from clients
- Executing business logic
- Reading and writing data from databases
- Authenticating and authorizing users
- Returning structured responses (typically JSON for APIs)

---

## 1. Node.js — JavaScript Runtime

### What Is Node.js?

**Node.js** is a JavaScript runtime built on Chrome's V8 engine. It allows JavaScript to run outside the browser — on a server, in a CLI tool, or as a build-time script.

### Why Node.js for Teaching

| Reason | Description |
| :--- | :--- |
| **Single language** | Learners already know JavaScript from frontend work; no context switch |
| **Non-blocking I/O** | Built for high-concurrency network applications |
| **npm ecosystem** | Largest package registry in the world |
| **Industry relevance** | Widely used in production; strong hiring demand |
| **REPL + scripts** | Low friction for experimentation |

### Core Node.js Concepts

| Concept | Description |
| :--- | :--- |
| **Event Loop** | Same model as the browser; non-blocking callbacks, Promises, async/await |
| **Modules (CommonJS)** | `require()` / `module.exports` — the traditional Node.js module system |
| **Modules (ESM)** | `import` / `export` — the modern standard; enabled with `"type": "module"` in `package.json` |
| **Built-in modules** | `fs`, `path`, `http`, `os`, `crypto` — no installation required |
| **npm** | Node Package Manager; `package.json`, `node_modules`, `package-lock.json`, scripts |
| **Environment variables** | Stored in `.env` files; loaded via `dotenv`; accessed via `process.env` |

> **⚠️ Warning:** Never commit `.env` files to version control. Store secrets in environment variables, not in code. This must be taught before the first deployment exercise.

---

## 2. Express.js — Web Application Framework

Express is a minimal, unopinionated Node.js web framework. It provides routing, middleware support, and HTTP utility methods.

### Core Concepts

#### Routing

```js
app.get('/users', (req, res) => {
    res.json(users);
});

app.post('/users', (req, res) => {
    // create a user
    res.status(201).json(newUser);
});
```

HTTP methods map to CRUD operations:

| HTTP Method | CRUD | Typical Use |
| :--- | :--- | :--- |
| GET | Read | Retrieve data |
| POST | Create | Submit new data |
| PUT | Update (replace) | Replace entire resource |
| PATCH | Update (partial) | Modify specific fields |
| DELETE | Delete | Remove resource |

#### Middleware

**Middleware** is a function with access to the request object (`req`), response object (`res`), and the `next` middleware function. Middleware functions are chained in order.

```js
app.use(express.json());          // parse JSON request body
app.use(cors());                  // handle CORS headers
app.use(requestLogger);           // custom logging middleware
app.use('/api', authMiddleware);  // auth check for protected routes
```

Middleware pattern enables: logging, authentication, input validation, error handling, rate limiting — all without modifying route handlers.

#### Error Handling

Express catches errors via a special 4-argument middleware:

```js
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});
```

---

## 3. REST API Design

**REST** (Representational State Transfer) is an architectural style for web APIs that uses HTTP as the communication protocol and treats application data as resources with URLs.

### REST Constraints

| Constraint | Description |
| :--- | :--- |
| **Stateless** | Each request contains all information needed to process it; server holds no session state |
| **Uniform Interface** | Resources are identified by URIs; operations via HTTP methods |
| **Client-Server** | Separation of concerns between UI (client) and data (server) |
| **Layered System** | Client doesn't need to know if it's talking to the origin server or a proxy |

### Resource Naming Conventions

```
GET    /users           → List all users
POST   /users           → Create a user
GET    /users/:id       → Get user by ID
PUT    /users/:id       → Replace user by ID
PATCH  /users/:id       → Update user fields
DELETE /users/:id       → Delete user

GET    /users/:id/posts → List posts for a specific user
```

**Rules:**
- Use nouns, not verbs (`/users`, not `/getUsers`)
- Use plural nouns for collections
- Use IDs in path parameters for specific resources
- Use query parameters for filtering/sorting (`/users?role=admin&sort=name`)

### HTTP Status Codes (Essential Set)

| Code | Meaning | When to Use |
| :--- | :--- | :--- |
| 200 OK | Success | Successful GET, PUT, PATCH |
| 201 Created | Resource created | Successful POST |
| 204 No Content | Success, no body | Successful DELETE |
| 400 Bad Request | Invalid input | Validation failure; malformed request |
| 401 Unauthorized | Not authenticated | Missing or invalid credentials |
| 403 Forbidden | Not authorized | Authenticated but lacks permission |
| 404 Not Found | Resource does not exist | Invalid ID |
| 409 Conflict | Resource conflict | Duplicate unique field |
| 422 Unprocessable | Semantic validation error | Valid JSON but invalid business logic |
| 500 Internal Server Error | Unhandled exception | Catch-all; never expose stack traces |

---

## 4. Databases

### Relational Databases (SQL)

**PostgreSQL** is the industry-recommended relational database for new web projects.

| Concept | Description |
| :--- | :--- |
| **Tables** | Structured collections of rows and columns |
| **Primary Key** | Uniquely identifies each row; typically `id SERIAL PRIMARY KEY` |
| **Foreign Key** | References the primary key of another table; enforces referential integrity |
| **Joins** | Combine rows from multiple tables based on a related column |
| **Indexes** | Data structures that speed up queries on specific columns |
| **Transactions** | Atomic operations; all succeed or all roll back |
| **Normalization** | Organizing data to reduce redundancy (1NF → 2NF → 3NF) |

**Essential SQL:**

```sql
-- Create
INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com');

-- Read
SELECT id, name, email FROM users WHERE active = true ORDER BY name;

-- Update
UPDATE users SET email = 'new@example.com' WHERE id = 42;

-- Delete
DELETE FROM users WHERE id = 42;

-- Join
SELECT posts.title, users.name
FROM posts
INNER JOIN users ON posts.author_id = users.id;
```

> **🚨 Alert:** Always use parameterized queries. Never interpolate user input directly into SQL strings — this enables SQL injection, one of the most common and damaging attack vectors.

### ORM: Prisma

**Prisma** is the current standard ORM for Node.js applications. It provides a type-safe query API, schema-driven migrations, and excellent TypeScript integration.

```js
// Prisma query (type-safe, no raw SQL needed)
const user = await prisma.user.findUnique({
    where: { id: 42 },
    include: { posts: true }
});
```

**When to introduce ORM:** After learners understand raw SQL. ORMs are abstractions over SQL — learners who don't understand what the ORM is doing cannot debug it or optimize it.

---

## 5. Authentication and Authorization

### Authentication vs. Authorization

| Term | Question | Example |
| :--- | :--- | :--- |
| **Authentication** | "Who are you?" | Login with username and password |
| **Authorization** | "What are you allowed to do?" | Only admins can delete users |

### Password Handling: bcrypt

**Never store plain-text passwords.** Use bcrypt to hash passwords with a salt:

```js
const bcrypt = require('bcrypt');

// On registration:
const hashedPassword = await bcrypt.hash(plainTextPassword, 12); // salt rounds = 12

// On login:
const isMatch = await bcrypt.compare(submittedPassword, storedHash);
```

### JWT (JSON Web Tokens)

JWT is a compact, URL-safe format for representing claims between two parties. Commonly used for stateless authentication in REST APIs.

```
Header.Payload.Signature
```

**Flow:**
1. User logs in → server verifies credentials → server creates and signs a JWT
2. Client stores JWT (localStorage or httpOnly cookie)
3. Client sends JWT in `Authorization: Bearer <token>` header
4. Server verifies signature on each request

> **⚠️ Warning:** JWTs stored in `localStorage` are vulnerable to XSS attacks. Use `httpOnly` cookies for sensitive applications. This security tradeoff must be taught explicitly.

### OAuth 2.0 / Social Login

OAuth allows users to authenticate with a third-party provider (Google, GitHub). Libraries like Passport.js or Auth.js simplify implementation.

---

## 6. Input Validation and Security

### Server-Side Validation

Never trust client-side validation alone. Servers must independently validate all input.

**Validation checklist:**
- [ ] Required fields are present
- [ ] Data types match expected types
- [ ] String lengths are within bounds
- [ ] Email addresses match format
- [ ] Numbers are within expected ranges
- [ ] Enums only contain valid values

**Libraries:** `zod` (TypeScript-first), `joi`, `express-validator`

### Security Essentials

| Vulnerability | Mitigation |
| :--- | :--- |
| SQL Injection | Parameterized queries / ORM — never string concatenation |
| XSS (Cross-Site Scripting) | Sanitize output; Content Security Policy headers |
| CSRF | SameSite cookies; CSRF tokens for state-changing requests |
| Broken Authentication | bcrypt passwords; short JWT expiry; httpOnly cookies |
| Sensitive Data Exposure | HTTPS everywhere; never log passwords or tokens; env vars for secrets |
| Mass Assignment | Whitelist allowed fields in update operations |

---

## Key Takeaways

- Node.js + Express is the dominant teaching stack for JavaScript backend development (2025).
- Middleware is the primary Express abstraction; understanding it unlocks authentication, validation, and error handling.
- REST API design has conventions, not rules — but following them consistently matters.
- SQL must precede ORM instruction; learners must understand what the abstraction hides.
- Security is not an advanced topic — parameterized queries, bcrypt, and environment variables must be taught at the foundational level.
- Authentication (who are you?) and authorization (what can you do?) are distinct concerns that must not be conflated.
