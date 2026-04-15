**[SWL-001] Set Up Your Local Environment**

| Field | Value |
|---|---|
| Type | Setup / Chore |
| Priority | High |
| Assignee | You |
| Reporter | Jordan Rivera |
| Sprint | Sprint 12 |
| Labels | `onboarding`, `good-first-ticket` |
| Attachments | — |

## Description

Before anything else, you need a working local copy of the `launchpad` repository. We do not work directly on GitHub's web editor — everything goes through a local clone pushed to `origin`.

Set up your local environment using the steps below. The repository URL is:

```
https://github.com/stackworks-labs/launchpad
```

For this project, you'll initialise a local repository that mirrors the structure in the `starter/` folder, then apply the provided starter files to simulate cloning into an existing codebase.

**Steps:**

1. Initialise a new local git repository: `git init launchpad`
2. Copy the contents of `starter/` into your `launchpad/` directory
3. Configure your git identity (global or local — either is fine):
   - `git config user.name "Your Name"`
   - `git config user.email "you@example.com"`
4. Stage and commit all starter files with the message `chore: initialise repository from team starter`
5. Verify setup with `git log`

Your `git log` should show exactly one commit authored by you, with the message above.

## Acceptance Criteria

- [ ] A local repository exists at `launchpad/`
- [ ] `git config user.name` returns your full name
- [ ] `git config user.email` returns a valid email address
- [ ] All starter files are committed in a single initial commit
- [ ] Commit message is exactly `chore: initialise repository from team starter`
- [ ] `git log` shows one commit — no detached HEAD, no extra commits

## Conversation History

**Jordan Rivera** · 2026-04-14  
Assigning this as your first ticket. It's the setup step — nothing creative, but you need to do it before any other ticket makes sense.

**Jordan Rivera** · 2026-04-14  
When you run `git log`, check that your name appears as the author, not a default placeholder. If you see "John Doe" or a blank author, your `git config` isn't set.
