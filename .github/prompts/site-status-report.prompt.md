---
description: "Site status report: sprint history + milestone progress + catalog stats → report saved to .reviews/reports/"
---

# Site Status Report

Generate a snapshot report of the platform's current state.

## Steps

1. **Sprint history** — Read all files in `.tasks/history/`. Extract velocity per sprint. Calculate average velocity and trend (improving/declining/stable).

2. **Current sprint** — Read `.tasks/sprint-current.json`. Report the sprint goal, tasks in flight, and current progress.

3. **Backlog health** — Read `.tasks/sprint-backlog.json`. Count tasks by status (`TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`) and by priority. Flag any CRITICAL tasks that are blocked.

4. **Milestone progress** — Read `.objectives/milestones.md`. For each milestone:
   - Count tasks tagged to that milestone in the backlog
   - Count how many are DONE vs remaining
   - Estimate remaining effort (sum of `estimated_hours` for non-DONE tasks)
   - Assess on-track vs at-risk based on velocity

5. **Content inventory** — Read `Content/catalog.json`. Produce counts:
   - Total items by type (lessons, units, courses, pathways, articles, projects)
   - Items by domain
   - Items by difficulty level

6. **Knowledge coverage** — Read `.knowledge/map.json` and `.knowledge/validation/gap-analysis.md`. Report:
   - Total knowledge nodes by domain
   - Open CRITICAL and HIGH gaps (unresolved)
   - Gaps resolved this sprint (if any)

7. **Write report** — Produce `.reviews/reports/site-status-{YYYY-MM-DD}.md` with:
   - Executive summary (3–5 bullet points)
   - Sprint metrics section
   - Milestone tracker table
   - Content inventory table
   - Knowledge coverage section
   - Top 3 recommended next actions

## Output

- `.reviews/reports/site-status-{YYYY-MM-DD}.md`
