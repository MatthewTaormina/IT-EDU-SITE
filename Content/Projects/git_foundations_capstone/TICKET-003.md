**[SWL-003] Resolve Merge Conflict on the Auth Module**

| Field | Value |
|---|---|
| Type | Bug / Chore |
| Priority | High |
| Assignee | You |
| Reporter | Jordan Rivera |
| Sprint | Sprint 12 |
| Labels | `auth`, `merge-conflict` |
| Attachments | [assets/alex_auth_conflict.js](assets/alex_auth_conflict.js) |

## Description

We need the auth module to log every authentication attempt so we can trace auth failures in production. `src/auth.js` currently has a `checkAuth(token)` function that returns `false` unconditionally — it's a stub; real token validation hasn't been wired in yet. Your job is to add a `logAuthAttempt(token)` function and update `checkAuth` to call it before returning.

**The complication:** Alex Kim has also been working on `auth.js`. His branch landed on `main` earlier today — see `assets/alex_auth_conflict.js`. His changes replaced the stub with real token validation using a `VALID_TOKENS` set and a `validateToken` function.

Your `logAuthAttempt` work and Alex's token validation work both need to be present in the final file. Neither can be dropped.

**Steps:**

1. Create a branch from `main`: `fix/auth-logging`
2. Working from the starter `src/auth.js` (the stub — just `checkAuth` returning `false`), add a `logAuthAttempt(token)` function and update `checkAuth` to call it:

   ```js
   function logAuthAttempt(token) {
     console.log(`[auth] attempt with token: ${token}`);
   }

   function checkAuth(token) {
     logAuthAttempt(token);
     return false;
   }
   ```

3. Stage and commit your change: `feat: add auth attempt logging to checkAuth`
4. Now simulate Alex's changes landing on `main`. Apply the contents of `assets/alex_auth_conflict.js` as the current state of `main`'s `src/auth.js`. If you set up a proper two-branch repo, merge `main` into your branch at this point.
5. Run: `git merge main`
6. Git will report a conflict in `src/auth.js`. Open the file — it will look something like this:

```
<<<<<<< HEAD
function logAuthAttempt(token) {
  console.log(`[auth] attempt with token: ${token}`);
}

function checkAuth(token) {
  logAuthAttempt(token);
  return false;
}

module.exports = { checkAuth, logAuthAttempt };
=======
const VALID_TOKENS = new Set([
  "swl_token_dev_001",
  "swl_token_dev_002",
  "swl_token_staging_001",
]);

function checkAuth(token) {
  if (!token || typeof token !== "string") return false;
  return validateToken(token);
}

function validateToken(token) {
  return VALID_TOKENS.has(token);
}

module.exports = { checkAuth, validateToken };
>>>>>>> main
```

**Reading conflict markers:**

- `<<<<<<< HEAD` — start of your version (current branch)
- `=======` — dividing line between the two versions
- `>>>>>>> main` — end of the incoming version (from `main`)

Everything between `<<<<<<< HEAD` and `=======` is what your branch has. Everything between `=======` and `>>>>>>> main` is what came from `main`. You must edit the file manually to produce the correct merged result, then remove all three marker lines.

**Correct resolution:** The final `src/auth.js` must contain all of the following:

- `VALID_TOKENS` set — from Alex
- `logAuthAttempt(token)` — yours
- `validateToken(token)` — from Alex
- `checkAuth(token)` — updated to call **both** `logAuthAttempt` and `validateToken`
- `module.exports = { checkAuth, validateToken, logAuthAttempt }`

Accepting only one side of the conflict is the wrong resolution. Both sets of changes are required.

7. After editing the file to its correct merged state, stage and commit the resolution with a descriptive message — not the default `Merge branch 'main'`.

## Acceptance Criteria

- [ ] Branch `fix/auth-logging` exists and was created from `main`
- [ ] `src/auth.js` on the branch contains `logAuthAttempt(token)`
- [ ] `src/auth.js` on the branch contains `validateToken(token)` (from Alex's changes)
- [ ] `src/auth.js` on the branch contains the `VALID_TOKENS` set (from Alex's changes)
- [ ] `checkAuth(token)` calls `logAuthAttempt`
- [ ] `checkAuth(token)` calls `validateToken` (Alex's logic is not removed)
- [ ] No conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) remain in `src/auth.js`
- [ ] A merge commit is present in the branch history
- [ ] Merge commit message is descriptive — not just `Merge branch 'main' into fix/auth-logging`
- [ ] `module.exports` exports all three: `checkAuth`, `validateToken`, `logAuthAttempt`

## Conversation History

**Jordan Rivera** · 2026-04-14  
This is the most complex ticket today. Read it fully before you start. Do not skip the section on conflict markers — it's there because most people get tripped up the first time they see them.

**Alex Kim** · 2026-04-14  
Hey — just so you know, I finished my auth changes this morning and they're already on `main`. I attached my version of the file to the ticket. When you resolve the conflict, make sure `checkAuth` still calls `validateToken` — don't strip that out just to keep things simple.

**Jordan Rivera** · 2026-04-14  
What Alex said. And the merge commit message should give enough context that someone reading the log six months from now understands what was preserved and why. The default auto-generated message doesn't do that.
