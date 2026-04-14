---
type: lesson
title: "HTTP"
description: "HTTP (HyperText Transfer Protocol) is the language browsers and servers use to communicate. Every resource you have ever loaded on the web arrived via an HTTP exchange. Understanding how it works r..."
duration_minutes: 25
tags:
  - http
  - https
  - request
  - response
  - status-codes
  - headers
  - methods
  - stateless
---

# HTTP

> **Lesson Summary:** HTTP (HyperText Transfer Protocol) is the language browsers and servers use to communicate. Every resource you have ever loaded on the web arrived via an HTTP exchange. Understanding how it works removes the mystery from network requests, API calls, and browser errors.

## What Is HTTP?

**HTTP** is a text-based protocol that defines how a client (browser) asks for a resource and how a server responds. It is the foundation of all data exchange on the Web.

Key properties:
- **Text-based:** HTTP messages are human-readable text, making them easy to inspect and debug.
- **Stateless:** Each request is completely independent — the server does not remember previous requests by default.
- **Request-response:** Every interaction follows the same pattern: one request, one response.

> **💡 Tip:** You can read real HTTP messages right now. Open DevTools → Network tab → click any request → click the "Headers" tab. You are reading raw HTTP.

## The Request-Response Cycle (Deep Dive)

Every HTTP exchange consists of two messages: a **request** from the client and a **response** from the server.

![The structure of an HTTP request (left) and HTTP response (right), showing the start line, headers, and optional body of each.](../../../Assets/Images/webdev/web_foundations/http_message_structure.svg)

### The HTTP Request

A request has three parts:

**1. The Request Line**
The opening line of every request contains three things:
```
GET /users HTTP/1.1
```
- **Method** — the action being requested (`GET`)
- **Path** — the resource being requested (`/users`)
- **Protocol version** — the HTTP version in use (`HTTP/1.1`)

**2. Headers**
Headers are key-value pairs that carry metadata about the request. They tell the server things like who is making the request, what format the response should be in, and whether authentication credentials are present.

```
Host: api.example.com
Accept: application/json
Authorization: Bearer eyJhbGci...
```

The `Host` header is mandatory — it tells the server which domain is being requested (important when a single server hosts multiple domains).

**3. Body (optional)**
The body carries data being sent *to* the server. `GET` and `DELETE` requests rarely have a body. `POST` and `PUT` requests almost always do.

```json
{"name": "Alice", "email": "alice@example.com"}
```

### HTTP Methods

The **method** (also called the **verb**) describes the intended action on the resource.

| Method | Meaning | Has Body? | Typical Use |
| :--- | :--- | :---: | :--- |
| `GET` | Retrieve a resource | No | Loading a page, fetching data |
| `POST` | Submit data to create something | Yes | Form submission, creating a record |
| `PUT` | Replace a resource entirely | Yes | Updating all fields of a record |
| `PATCH` | Partially update a resource | Yes | Updating one field of a record |
| `DELETE` | Remove a resource | No | Deleting a record |

> **⚠️ Warning:** Methods are a *convention*, not a technical enforcement. A poorly designed server could DELETE something on a GET request. REST API design follows these conventions deliberately — but the protocol itself does not enforce them.

### The HTTP Response

A response mirrors the structure of a request:

**1. The Status Line**
```
HTTP/1.1 200 OK
```
- **Protocol version** (`HTTP/1.1`)
- **Status code** (`200`) — a three-digit number indicating the outcome
- **Reason phrase** (`OK`) — a human-readable label (informational only)

**2. Response Headers**
```
Content-Type: application/json
Content-Length: 512
Cache-Control: max-age=3600
```
Metadata about the response: what type of data it contains, how long it is, how it should be cached, and so on.

**3. Body**
The actual resource being returned — an HTML document, a JSON payload, an image, etc.

### Status Codes

Status codes communicate the outcome of a request in a standardised way. They are grouped into five families:

| Family | Range | Meaning | Common Examples |
| :--- | :--- | :--- | :--- |
| **1xx** | 100–199 | Informational | `100 Continue` |
| **2xx** | 200–299 | Success | `200 OK`, `201 Created`, `204 No Content` |
| **3xx** | 300–399 | Redirection | `301 Moved Permanently`, `304 Not Modified` |
| **4xx** | 400–499 | Client error | `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found` |
| **5xx** | 500–599 | Server error | `500 Internal Server Error`, `503 Service Unavailable` |

> **💡 Tip:** The distinction between **4xx** and **5xx** is critical for debugging. A 4xx means *you* sent something wrong. A 5xx means the *server* failed. When you get a 500, the problem is on the server side, not your request.

> **Example — Status Codes in Real Life:**
> - You typo a URL → `404 Not Found` (the resource doesn't exist)
> - You try to access a private API without a token → `401 Unauthorized`
> - The server has a bug → `500 Internal Server Error`
> - The content hasn't changed since you last fetched it → `304 Not Modified` (browser can use its cache)

## HTTP vs. HTTPS

**HTTPS** is HTTP with an additional layer of encryption provided by **TLS** (Transport Layer Security). The "S" stands for Secure.

| | HTTP | HTTPS |
| :--- | :--- | :--- |
| **Encryption** | None — data sent in plain text | Encrypted — unreadable in transit |
| **Port** | 80 | 443 |
| **Use case** | Never in production | Always in production |
| **URL indicator** | `http://` | `https://` + padlock in browser |

> **🚨 Alert:** Never send passwords, tokens, or personal data over HTTP. On an unencrypted connection, anyone on the same network can read every byte of your HTTP traffic. HTTPS is not a nice-to-have — it is a baseline requirement for any real application.

## Statelessness

HTTP is **stateless** — the server treats every request as completely independent, with no memory of previous requests.

This means logging in does not "persist" automatically. If you make 100 API requests after logging in, your server does not inherently know who you are on request 2 through 100.

State is maintained through application-layer mechanisms — primarily **cookies** and **tokens** — covered in later units once JavaScript and authentication are established.

> **Example — Statelessness in Practice:**
> You log in to a website. Under the hood, the server sends back a cookie: `Set-Cookie: session_id=abc123`. Your browser stores it and automatically includes it in every subsequent request: `Cookie: session_id=abc123`. The server looks up `abc123` in its session store to identify you. The protocol is stateless — but the application builds state on top of it.

## Key Takeaways

- HTTP is a **text-based, stateless, request-response** protocol.
- Every HTTP message has a **start line**, **headers**, and an optional **body**.
- The **method** describes the intended action: `GET` retrieves, `POST` creates, `PUT`/`PATCH` update, `DELETE` removes.
- **Status codes** signal the outcome: `2xx` = success, `3xx` = redirect, `4xx` = your fault, `5xx` = server's fault.
- **HTTPS** adds TLS encryption — always required in production.
- **Statelessness** means the server has no memory between requests; state is built on top using cookies or tokens.

## Research Questions

> **🔬 Research Question:** HTTP/1.1, HTTP/2, and HTTP/3 all exist. What are the key differences? What performance problems does HTTP/2 solve that HTTP/1.1 had?
>
> *Hint: Search for "HTTP/2 multiplexing" and "head-of-line blocking."*

> **🔬 Research Question:** What actually happens during the TLS handshake in HTTPS? At a high level, how do two parties agree on encryption keys without ever meeting?
>
> *Hint: Search for "TLS handshake explained" and look at the concept of public-key cryptography.*
