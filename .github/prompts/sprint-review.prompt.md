---
description: "Sprint review and close: audit completed tasks → archive sprint → update velocity → surface next priorities"
---

# Sprint Review

Close the current sprint and prepare for the next one.

## Steps

1. **Read current sprint** — Read `.tasks/sprint-current.json`. Record the `sprint_id`, `goal`, `start_date`, `end_date`, and `tasks`.

2. **Audit tasks** — For each task in the sprint:
   - Read `.tasks/sprint-backlog.json` to find its current `status`
   - For tasks marked `DONE`: verify the deliverable exists on disk (e.g., the lesson file was created, the catalog.json was updated)
   - For tasks not `DONE`: note them as carry-over items

3. **Calculate velocity** — Count total `estimated_hours` for completed tasks. This is the sprint's delivered velocity. Note it for capacity planning.

4. **Write sprint archive** — Create `.tasks/history/sprint_{sprint_id}.json` containing:
   - Sprint metadata (id, dates, goal)
   - `completed_tasks` array with task IDs and actual hours
   - `carry_over_tasks` array
   - `velocity` (hours delivered)
   - `notes` (any blockers, lessons learned)

5. **Clear current sprint** — Reset `.tasks/sprint-current.json` to a blank template (id incremented, dates TBD, tasks empty, goal empty). Carry-over tasks remain in the backlog with status `TODO`.

6. **Update gap-analysis** — Read `.knowledge/validation/gap-analysis.md`. If any completed tasks resolved a knowledge gap, update its status.

7. **Surface priorities** — Read `.objectives/milestones.md` and the backlog. Output a prioritized short-list of the top 5 next tasks with the reasoning (milestone proximity, dependency graph, knowledge readiness).

8. **Update kanban** — Move all completed tasks to the DONE column in `.tasks/tasks.md`.

## Output

- `.tasks/history/sprint_{sprint_id}.json` (new archive)
- Updated `.tasks/sprint-current.json` (reset)
- Updated `.tasks/sprint-backlog.json` (status changes for any newly completed items)
- Updated `.tasks/tasks.md`
- Prioritized next-sprint short-list printed to chat
