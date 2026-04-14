---
title: "Technical Requirements & Acceptance Criteria"
sidebar_position: 2
sidebar_label: "Requirements"
---

# Technical Requirements & Acceptance Criteria

---

## Technical Constraints

| Constraint | Requirement |
| :-- | :-- |
| **Frameworks** | None — vanilla HTML, CSS, and JavaScript only |
| **Libraries** | None — no jQuery, no Lodash, no UI libraries |
| **Module system** | ES Modules (`import`/`export`) — no `<script>` soup |
| **JavaScript version** | ES2020+ — use `async/await`, optional chaining, nullish coalescing |
| **HTTP requests** | Fetch API only — no Axios |
| **Storage** | `localStorage` only — no cookies, no IndexedDB |
| **Deployment** | GitHub Pages — the project must be live before submission |
| **Build tool** | Vite (optional but recommended — simplifies ES module imports) |

---

## Module Architecture

Your project must follow this module structure:

### `api.js` — Data Fetching

- Exports named function `searchRepositories(query, page)` → returns `Promise<{ items, totalCount }>`
- Exports named function `getRepository(fullName)` → returns `Promise<Repo>`
- No DOM access (`document`, `window`, etc.)
- Handles `response.ok` check and throws `Error` on non-OK status
- All functions are `async`

### `storage.js` — Persistence

- Exports named functions: `getSavedIds()`, `saveRepo(id)`, `unsaveRepo(id)`, `isRepoSaved(id)`
- Stores saved repo IDs in `localStorage` under the key `'saved_repos'`
- Data persists as a JSON array of repo ID numbers: `[12345, 67890]`
- No DOM access, no fetch calls

### `ui.js` — Rendering

- Exports named functions: `renderRepoCards(repos, savedIds)`, `showLoading()`, `hideLoading()`, `showError(message)`, `showEmpty(message)`, `renderSkeletonCards(count)`
- No fetch calls
- Accesses the DOM

### `app.js` — Orchestration

- Imports from `api.js`, `storage.js`, and `ui.js`
- Wires up event listeners (form submit, tab clicks, popstate)
- Handles `pushState`/`replaceState` for URL navigation
- Reads initial state from `URLSearchParams` on page load
- No business logic — delegates to api/ui/storage modules

---

## Acceptance Criteria

### Search (US-01, US-02)

- [ ] **AC-01:** Submitting the search form with a non-empty query calls the GitHub Search API: `https://api.github.com/search/repositories?q=<query>&sort=stars&per_page=10&page=1`
- [ ] **AC-02:** Each result card displays: repo full name (linked to GitHub), description (or "No description" if absent), star count (formatted with `toLocaleString()`), language (or "—" if absent), and last-updated date (formatted as relative: "2 days ago" or absolute: "Apr 12, 2026")
- [ ] **AC-03:** The URL updates to `?q=<query>` when a search is performed (using `pushState`)
- [ ] **AC-04:** Refreshing the page with `?q=react` re-runs the search and shows the same results
- [ ] **AC-05:** A skeleton loading state (3+ skeleton cards) is shown while the API request is in flight
- [ ] **AC-06:** A readable error message is shown when the API returns a non-OK response or network failure
- [ ] **AC-07:** A "No results found" message is shown for a search that returns zero items

### Bookmarks (US-03, US-04, US-05)

- [ ] **AC-08:** Each result card has a "Save" button. Clicking it saves the repo's ID to `localStorage` and visually updates the button to "Saved ✓" (green)
- [ ] **AC-09:** Clicking "Saved ✓" unsaves the repo — removes it from `localStorage` and reverts the button
- [ ] **AC-10:** Saved state persists on page refresh — a previously saved repo's button shows "Saved ✓" when the same search is run again
- [ ] **AC-11:** The "Saved" tab displays all saved repos. The count badge on the tab reflects the current number of saved repos
- [ ] **AC-12:** The Saved view shows an "Unsave" button for each saved repo. Clicking it removes the repo from the view and from `localStorage`
- [ ] **AC-13:** If no repos are saved, the Saved view shows "No saved repositories yet."

### Navigation (US-06, US-07)

- [ ] **AC-14:** Clicking the "Saved" tab updates the URL to `?view=saved` using `pushState`
- [ ] **AC-15:** Clicking the "All Results" tab returns to `?q=<query>` using `pushState`
- [ ] **AC-16:** The browser Back button moves correctly between the Search Results and Saved views
- [ ] **AC-17:** Sharing the URL `?q=react&view=saved` with another user opens the Saved view (not the search results)

### Pagination (US-08)

- [ ] **AC-18:** A "Load More" button appears if `totalCount` > current number of displayed results
- [ ] **AC-19:** Clicking "Load More" fetches page 2 (then 3, etc.) and **appends** new cards below existing ones — does not replace them
- [ ] **AC-20:** The "Load More" button disappears after all pages are loaded

### Animations

- [ ] **AC-21:** Cards fade and slide up (`opacity: 0, translateY(20px)` → `opacity: 1, translateY(0)`) when they first appear in the DOM
- [ ] **AC-22:** Cards have a hover lift effect (`translateY(-4px)`) using a CSS `transition`
- [ ] **AC-23:** All animations are suppressed when `prefers-reduced-motion: reduce` is detected

### Code Quality

- [ ] **AC-24:** `node_modules/` is in `.gitignore` and not committed
- [ ] **AC-25:** `package-lock.json` is committed
- [ ] **AC-26:** No `console.log`, `debugger`, or commented-out code in the final submission
- [ ] **AC-27:** `response.ok` is checked in every fetch call before `.json()` is called
- [ ] **AC-28:** The project builds successfully with `npm run build` (if using Vite)

### Deployment

- [ ] **AC-29:** The application is deployed to GitHub Pages and loads at `https://<username>.github.io/<repo-name>/`
- [ ] **AC-30:** The deployed site loads without console errors
- [ ] **AC-31:** The GitHub repository has at least 5 meaningful commits with conventional commit messages

---

## Extension Criteria (Optional)

Complete these if you finish the required acceptance criteria:

| ID | Extension |
| :-- | :-- |
| EXT-01 | Add a sort control (stars, forks, updated) that re-fetches results when changed |
| EXT-02 | Add a language filter (a dropdown populated from the current result set) |
| EXT-03 | Implement debounced search-as-you-type (300ms delay after keystroke stops) |
| EXT-04 | Add an `AbortController` to cancel the in-flight request when a new search starts |
| EXT-05 | Lazy-load a "contributor avatars" section inside each card using Intersection Observer |
| EXT-06 | Add a dark mode toggle that persists in `localStorage` |

---

## Grading Rubric

| Category | Points |
| :-- | :-- |
| All required ACs passing (AC-01 to AC-31) | 70 |
| Code architecture (correct module separation) | 10 |
| CSS quality (custom properties, no magic numbers, responsive) | 10 |
| Git history (5+ meaningful commits, conventional messages) | 5 |
| Deployed and accessible at GitHub Pages URL | 5 |
| **Total** | **100** |

Extension criteria may earn up to 20 bonus points.

---

## Submission Checklist

Before submitting, verify:

- [ ] All 31 required acceptance criteria are met
- [ ] The GitHub Pages URL is live and working
- [ ] `npm run build` completes without errors
- [ ] No `console.log` or `debugger` statements remain
- [ ] Git history shows at least 5 commits with conventional messages
- [ ] `node_modules/` is not in the repository
- [ ] The README.md contains: project description, live URL, and how to run locally (`npm install && npm run dev`)
