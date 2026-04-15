# Scoring Rubric — First Day at Stackworks Labs

**Total: 100 points**

---

## Branch Naming — 10 pts

| Criteria | Exceeds (10) | Meets (8) | Approaching (5) | Not Yet (0) |
|---|---|---|---|---|
| Branch names match the required pattern | Both `feature/newsletter-validation` and `fix/auth-logging` use the exact names specified in the tickets; both were created from `main` | Branch names are correct; one branch was not created directly from the latest `main` | Branch names deviate from the required pattern (wrong prefix, wrong casing, or abbreviated) | Branches not created; work committed directly to `main`; or branch names bear no resemblance to the required pattern |

---

## Commit Message Quality — 20 pts

| Criteria | Exceeds (20) | Meets (16) | Approaching (10) | Not Yet (0) |
|---|---|---|---|---|
| Commit messages follow the `type: description` convention | All commits use a valid prefix (`feat:`, `fix:`, `chore:`); messages are specific, imperative, and explain the change without requiring the reader to open the diff | Prefixes are correct; messages are specific but written in past tense or missing context | Prefixes correct but descriptions are vague (`feat: update signup`, `fix: auth`); or one commit is missing a prefix | No conventional prefixes used; messages are placeholders (`update`, `wip`, `done`) |

---

## Conflict Resolution — 30 pts

| Criteria | Exceeds (30) | Meets (24) | Approaching (15) | Not Yet (0) |
|---|---|---|---|---|
| Merge conflict in `auth.js` resolved correctly | No conflict markers remain; `logAuthAttempt`, `validateToken`, and `VALID_TOKENS` all present; `checkAuth` integrates both; `module.exports` lists all three; merge commit message is descriptive | No markers; all functions present; merge commit present but message is the default auto-generated text | No markers; but one developer's contribution was dropped (only one side of the conflict kept) | Conflict markers still present in the file; or file was deleted and recreated to avoid the conflict; or no merge commit |

---

## Git Log History — 20 pts

| Criteria | Exceeds (20) | Meets (16) | Approaching (10) | Not Yet (0) |
|---|---|---|---|---|
| `git log` reflects the expected commit history | Initial commit on `main`; SWL-002 branch shows feature commit; SWL-003 branch shows both the `logAuthAttempt` commit and a merge commit; history is clean with no accidental duplicate commits | History correct; one branch is missing its merge commit (was fast-forwarded instead) | History present but contains multiple `wip` commits or the work for multiple tickets was bundled into a single commit | `git log` shows no discernible feature/fix history; everything was committed directly to `main` |

---

## Working Tree Clean — 20 pts

| Criteria | Exceeds (20) | Meets (16) | Approaching (10) | Not Yet (0) |
|---|---|---|---|---|
| No uncommitted changes at the end of any ticket | `git status` on each branch shows "nothing to commit, working tree clean"; no untracked files related to the tickets remain | All ticket files committed; one unrelated untracked file present (e.g. a scratch file) | At least one ticket file has uncommitted local changes (modified but not staged, or staged but not committed) | Multiple files have uncommitted changes; or the final state of a branch includes only partial work |

---

## Skill Mapping

| Rubric Category | Course Skill |
|---|---|
| Branch Naming | `git:create_branch`, `git:feature_branch_workflow` |
| Commit Message Quality | `git:add_commit`, `git:commit_message_conventions` |
| Conflict Resolution | `git:resolve_conflict`, `git:complete_merge` |
| Git Log History | `git:dag_commit_graph`, `git:add_commit` |
| Working Tree Clean | `git:three_working_areas` |
