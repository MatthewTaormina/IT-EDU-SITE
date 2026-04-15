# Acceptance Checklist — First Day at Stackworks Labs

Complete all three tickets and verify every item below before considering the project done.

---

## SWL-001 — Local Environment Setup

- [ ] A local `launchpad/` repository exists and was initialised with `git init`
- [ ] `git config user.name` returns your actual full name (not a placeholder)
- [ ] `git config user.email` returns a valid email address
- [ ] All starter files are present and committed
- [ ] The initial commit message is exactly: `chore: initialise repository from team starter`
- [ ] `git log` shows exactly one commit on `main` at this point (before any feature branches)
- [ ] No untracked files remain (`git status` shows "nothing to commit, working tree clean")

---

## SWL-002 — Newsletter Signup Validation

- [ ] Branch `feature/newsletter-validation` exists in the repository
- [ ] The branch was created from `main` (not from another feature branch)
- [ ] `src/signup.js` has been modified — the `validateSignup` function no longer always returns `true`
- [ ] `validateSignup("")` → `false`
- [ ] `validateSignup(null)` → `false`
- [ ] `validateSignup("notanemail")` → `false`
- [ ] `validateSignup("user@stackworks.io")` → `true`
- [ ] `validateSignup("user@stackworks")` → `false`
- [ ] `node src/signup.js` runs without errors or uncaught exceptions
- [ ] Commit message uses `feat:` prefix and describes the change
- [ ] No other files were modified on this branch (change is isolated to `signup.js`)

---

## SWL-003 — Auth Module Merge Conflict

- [ ] Branch `fix/auth-logging` exists and was created from `main`
- [ ] `src/auth.js` on the branch contains a `logAuthAttempt(token)` function
- [ ] `logAuthAttempt` logs or records the token in some way (not a no-op)
- [ ] `src/auth.js` contains Alex's `validateToken(token)` function
- [ ] `src/auth.js` contains Alex's `VALID_TOKENS` set
- [ ] `checkAuth(token)` calls `logAuthAttempt`
- [ ] `checkAuth(token)` calls `validateToken` (Alex's logic is not removed)
- [ ] No conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) exist anywhere in `src/auth.js`
- [ ] `git log` on `fix/auth-logging` shows a merge commit
- [ ] Merge commit message is more descriptive than the default `Merge branch 'main' into fix/auth-logging`
- [ ] `module.exports` exports `checkAuth`, `validateToken`, and `logAuthAttempt`

---

## Commit Quality (all tickets)

- [ ] All commit messages start with a conventional prefix: `feat:`, `fix:`, or `chore:`
- [ ] No vague messages: `update`, `stuff`, `wip`, `fix`, `changes`, `done`
- [ ] Each commit covers one logical change — no bundling of unrelated edits
- [ ] Commit messages are written in the present tense imperative: "add X" not "added X" or "adding X"
