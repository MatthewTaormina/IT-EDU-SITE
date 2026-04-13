---
title: "Unit Review — Web Foundations"
lesson_plan: "Web Foundations"
type: "review"
---

# Unit Review — Web Foundations

> Work through this review without looking back at the lessons. Every question is answerable from memory if you have genuinely absorbed the material. If you draw a blank on something, note it — then go back and re-read that lesson before continuing to HTML.

---

## What You Covered

| Lesson | Core Idea |
| :--- | :--- |
| **01 — The Internet** | The Internet is a global network; all communication follows the client-server model using IP addresses and ports |
| **02 — The Web** | The Web is an application layer built on the Internet; pages are hyperlinked documents forming a non-linear mesh |
| **03 — Web Browsers** | Browsers request, parse, and render pages; the rendering pipeline converts HTML and CSS into pixels |
| **04 — Web Servers** | Servers are hardware + software; static vs. dynamic, load balancers, and CDNs are core infrastructure patterns |
| **05 — URLs** | A URL has six components (protocol, host, port, path, query string, fragment), each with a specific role |
| **06 — HTTP** | HTTP is a stateless, text-based, request-response protocol; messages have a start line, headers, and optional body |
| **07 — DNS** | DNS translates domain names to IP addresses via a chain: resolver → root → TLD → authoritative |
| **08 — Core Technologies** | HTML defines structure, CSS defines presentation, JavaScript defines behavior — all operating on the DOM |
| **09 — How a Page Loads** | A full page load: DNS → HTTP → HTML parse → sub-resources → script execution → render |

---

## Key Terms

| Term | Definition |
| :--- | :--- |
| **Internet** | A global network of interconnected computers communicating via standard protocols |
| **World Wide Web** | A system of interlinked hypertext documents accessed over the Internet via HTTP |
| **Client** | The device or program that initiates a request (typically a browser) |
| **Server** | A program that listens for requests and sends responses |
| **IP Address** | A numerical label that uniquely identifies a device on a network |
| **Port** | A numbered channel routing traffic to a specific service on a machine |
| **localhost** | The loopback address (`127.0.0.1`) — points back to the same machine |
| **URL** | Uniform Resource Locator — a structured address specifying how and where to find a resource |
| **HTTP** | HyperText Transfer Protocol — the request-response protocol used by the Web |
| **HTTPS** | HTTP with TLS encryption — required for all production web traffic |
| **HTTP Method** | The action requested: `GET`, `POST`, `PUT`, `PATCH`, `DELETE` |
| **Status Code** | Three-digit outcome indicator: 2xx success, 3xx redirect, 4xx client error, 5xx server error |
| **Stateless** | HTTP has no memory between requests; state is built by the application layer |
| **DNS** | Domain Name System — translates domain names into IP addresses |
| **Recursive Resolver** | A DNS server that walks the resolution chain on your behalf |
| **Authoritative Name Server** | The final DNS authority for a domain; stores the actual records |
| **TTL** | Time to Live — how long a DNS record is cached before re-querying |
| **A Record** | A DNS record mapping a domain to an IPv4 address |
| **CNAME** | A DNS alias — points one domain name to another |
| **DOM** | Document Object Model — the browser's live in-memory tree of an HTML document |
| **CSSOM** | CSS Object Model — the browser's parsed representation of CSS rules |
| **Rendering Pipeline** | DOM + CSSOM → Render Tree → Layout → Paint |
| **SSR** | Server-Side Rendering — the server assembles HTML before sending it |
| **CSR** | Client-Side Rendering — JavaScript in the browser assembles HTML after load |
| **Separation of Concerns** | HTML (structure), CSS (presentation), and JavaScript (behavior) kept in separate files |
| **CDN** | Content Delivery Network — serves assets from the server geographically closest to the user |
| **Load Balancer** | Distributes incoming requests across multiple backend servers |

---

## Quick Check

Answer these without looking at the lessons. Write full answers.

1. A friend says "the Internet and the Web are the same thing." How do you correct them with a concrete analogy?

2. Break down `https://api.example.com:3000/products?category=shoes#sale` — identify every component and explain what it does.

3. Walk through the full DNS resolution chain for a brand-new uncached domain. Name every server type involved and what each contributes.

4. What is the structural difference between an HTTP request and an HTTP response? What parts do they share?

5. A server responds with `401`. Another request gets `500`. What does each tell you, and where would you start debugging each?

6. After a `200 OK` with an HTML document, what does the browser do before any pixels appear? Describe every step.

7. What is the difference between `<script>`, `<script defer>`, and `<script async>`? When would you choose each?

8. A colleague says "the server sent us the HTML, so that's what the browser displays." Why is this imprecise? What does the browser actually work with?

9. What does statelessness mean in HTTP? Give a real example of how statefulness is layered on top of it.

10. You visit `https://example.com/about#contact`. Does `#contact` reach the server? What does it do, and where is it processed?

---

## Common Misconceptions

> **❌ "The Internet and the Web are the same thing."**
> The Internet is the physical and logical infrastructure connecting computers globally. The Web is *one application* running on top of it — email, SSH, and gaming also use the Internet but are not the Web.

> **❌ "HTTP is only used by browsers."**
> HTTP is used by any client that needs to transfer data over the Web — mobile apps, server-to-server API calls, CLI tools (`curl`, `wget`), IoT devices. The browser is just the most visible HTTP client.

> **❌ "The HTML file is the page."**
> The browser receives the HTML file and immediately converts it into the DOM — a tree of live objects. HTML is the *input*; the DOM is what CSS and JavaScript actually interact with.

> **❌ "HTTPS means the website is safe."**
> HTTPS means the *connection* is encrypted — data cannot be intercepted in transit. It says nothing about whether the site itself is trustworthy or secure. Phishing sites routinely use HTTPS.

> **❌ "DNS is instant."**
> An uncached DNS lookup can take 20–120ms and involves multiple round-trips. This is why browser DNS caching, TTL tuning, and `<link rel="dns-prefetch">` exist as real performance tools.

---

## What Comes Next

The next unit is **HTML** — and you are now in exactly the right position to learn it properly. You already know that HTML is not the page itself; it is the input the browser uses to build the DOM. Every tag you write creates a *node* in a tree, and every structural decision you make shapes what CSS and JavaScript can interact with later. The HTML unit takes you from the document skeleton through text, links, images, lists, tables, forms, and semantic markup — with the DOM always visible as the underlying model.
