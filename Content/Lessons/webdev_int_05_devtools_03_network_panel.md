---
type: lesson
title: "The Network Panel"
description: "Record and inspect HTTP requests — request and response headers, body, timing, status codes — and throttle network speed to test slow connections."
duration_minutes: 35
tags:
  - devtools
  - network-panel
  - http
  - headers
  - timing
  - debugging
  - cors
---

# The Network Panel

> **Lesson Summary:** The Network panel records every HTTP request the page makes — HTML, CSS, JavaScript, images, fonts, and API calls. You can inspect request and response headers, view response bodies, understand timing, and simulate slow connections. This panel is essential for debugging fetch calls, CORS errors, and performance problems.

---

## Opening the Network Panel

Open DevTools and click the **Network** tab. Then **reload the page** — the Network panel only records requests made after it opens.

> **💡 Tip:** Check "Preserve log" to keep requests visible when navigating to a new page. Without this, all requests clear on navigation.

---

## The Request Waterfall

The waterfall view shows all requests in chronological order:

| Column | Description |
| :--- | :--- |
| **Name** | The resource filename or URL |
| **Status** | HTTP status code (200, 404, 500, etc.) |
| **Type** | Resource type (document, script, fetch, img, font, etc.) |
| **Initiator** | What triggered the request (HTML parser, a script, fetch in app.js:42) |
| **Size** | Transfer size (gzipped) → actual size |
| **Time** | Total time from request start to last byte received |
| **Waterfall** | Timeline bar showing when the request happened relative to others |

---

## Filtering Requests

The filter bar at the top limits which requests are shown:

| Filter | Shows |
| :--- | :--- |
| All | Everything |
| Fetch/XHR | API calls made by `fetch()` or `XMLHttpRequest` |
| Doc | The HTML document itself |
| CSS | Stylesheet requests |
| JS | Script requests |
| Img | Image requests |
| Font | Font file requests |

Use the text filter to find requests by URL: type `api.github.com` to show only requests to the GitHub API.

---

## Inspecting a Request

Click any row to open the details pane:

### Headers Tab

Shows request and response headers:

```
Request Headers:
  Accept: application/json
  Authorization: Bearer eyJhbGci...
  Content-Type: application/json

Response Headers:
  Content-Type: application/json; charset=utf-8
  X-RateLimit-Remaining: 58
  Access-Control-Allow-Origin: *
```

Use this to:
- Verify the `Authorization` header is being sent correctly
- Check `Access-Control-Allow-Origin` to debug CORS errors
- See rate limit headers from APIs

### Preview / Response Tab

Shows the parsed response body:
- **Preview** — renders JSON as a collapsible tree
- **Response** — raw text of the response body

### Timing Tab

Breaks down the request time:

| Phase | Description |
| :--- | :--- |
| **Queueing** | Waiting before the browser starts processing the request |
| **Stalled** | Blocked (waiting for a connection, proxy, or other resource) |
| **DNS Lookup** | Resolving the hostname to an IP address |
| **Initial connection** | TCP handshake and SSL negotiation |
| **Waiting (TTFB)** | **Time to First Byte** — how long the server took to respond |
| **Content Download** | Downloading the response body |

**TTFB** is the most important metric for API performance — it reflects server response time. A high TTFB (> 500ms) points to server-side slowness.

---

## Debugging Failed Requests

### Status 0 — Network Failure

A status of `0` means the request never completed:
- The browser is offline
- A CORS preflight failed (the browser blocked the response)
- The server closed the connection without a response

### CORS Errors

```
Access to fetch at 'https://api.example.com/data' from origin 'http://localhost:3000' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present.
```

In the Network panel, find the failed request:
- If there is a **preflight OPTIONS request** in the list, the CORS error occurred during preflight
- Check the response headers of the preflight — it should have `Access-Control-Allow-Origin: *` or your specific origin
- If no OPTIONS request is present, check the request's own response headers

### 401 and 403

- **401 Unauthorized** — not authenticated. Your `Authorization` header is missing or the token is invalid.
- **403 Forbidden** — authenticated but not allowed. The token exists but lacks the required permission scope.

Click the failed request, go to **Headers**, verify your `Authorization` header is present and formatted correctly.

---

## Throttling Network Speed

Simulate slow connections to test how your app behaves for users on slow networks:

1. In the Network panel, click the throttling dropdown (default: "No throttling")
2. Choose a preset: **Fast 3G**, **Slow 3G**, or create a custom profile
3. Reload the page — resources now load at the simulated speed

This is essential for testing:
- Loading states and spinners
- Progressive image loading
- Error handling when requests time out

---

## Blocking a Request

You can block specific requests to test error handling:

1. Right-click any request in the Network panel
2. Select "Block request URL" (Chrome) or "Block request" (Firefox)
3. The next load of that URL will fail as a network error

Test your error handling by blocking your API endpoint.

---

## Key Takeaways

- The Network panel records all HTTP requests — reload after opening to see everything.
- Filtering by "Fetch/XHR" isolates API calls from resource requests.
- Click any request to see headers, response body, and timing breakdown.
- Status `0` = network failure or blocked request; 401 = unauthenticated; 403 = unauthorized.
- CORS errors are visible in the response headers — check `Access-Control-Allow-Origin`.
- Use throttling to test loading states on slow connections.

---

## Challenge: Audit an API Project

Open the GitHub search project from Unit 01 (Lesson 6) in your browser:

1. Open the Network panel and perform a search
2. Find the GitHub API request. Answer: What status code did it return? How long did the request take total? What was the TTFB?
3. Check the response headers. Is `X-RateLimit-Remaining` present? What is the value?
4. Switch to Slow 3G throttling and search again. Does your loading indicator appear? Does it persist long enough for the user to notice?
5. Block the GitHub API URL. Perform a search. Does your error state display correctly?

---

## Research Questions

> **🔬 Research Question:** What is a **CORS preflight request**? Under what conditions does the browser send an OPTIONS request before the actual request, and what headers must the server respond with to allow the real request to proceed?

> **🔬 Research Question:** What does the `Cache-Control` response header do? Find a request in the Network panel and inspect its `Cache-Control` value. What does `max-age=3600` mean?

## Optional Resources

- [Chrome DevTools — Network features reference](https://developer.chrome.com/docs/devtools/network/reference/)
- [web.dev — Understand Resource Timing](https://web.dev/articles/navigation-and-resource-timing) — Deep dive on TTFB and request timing
