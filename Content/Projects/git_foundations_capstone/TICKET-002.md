**[SWL-002] Implement Newsletter Signup Validation**

| Field | Value |
|---|---|
| Type | Feature |
| Priority | Medium |
| Assignee | You |
| Reporter | Jordan Rivera |
| Sprint | Sprint 12 |
| Labels | `feature`, `validation` |
| Attachments | — |

## Description

The `/signup` endpoint currently accepts any value for `email` and passes it downstream without checking it first. This is causing noise in the database — we're seeing blank entries and strings that are obviously not email addresses.

`src/signup.js` exports a `validateSignup(email)` function. Right now it always returns `true`. Update it to return `false` if the provided email is empty, not a string, or does not contain both an `@` character and a `.` after the `@`.

This is not a perfect email validator — that's fine. It just needs to catch the obvious junk.

**Branch:** `feature/newsletter-validation`  
**Base:** `main`

## Acceptance Criteria

- [ ] Branch `feature/newsletter-validation` is created from `main`
- [ ] `validateSignup("")` returns `false`
- [ ] `validateSignup(null)` returns `false`
- [ ] `validateSignup("notanemail")` returns `false`
- [ ] `validateSignup("user@stackworks.io")` returns `true`
- [ ] `validateSignup("user@stackworks")` returns `false` (no `.` after `@`)
- [ ] No syntax errors — `node src/signup.js` runs without crashing
- [ ] Commit message follows the `feat: description` convention
- [ ] Branch is committed locally (push is simulated — no remote required for this exercise)

## Conversation History

**Jordan Rivera** · 2026-04-14  
Dropping this to you as a starter feature. The logic is simple, but I want to see that you know how to work in a feature branch and write a commit that explains the change.

**Jordan Rivera** · 2026-04-14  
Don't over-engineer this. No external libraries. A regex is fine, a few `if` statements is fine. Keep it readable. The function signature is already in `signup.js` — just fill in the body.

**Alex Kim** · 2026-04-14  
Heads up — `"user@stackworks"` should fail the check. The dot after the `@` is a real constraint. Jordan mentioned it above but wanted to flag it explicitly.
