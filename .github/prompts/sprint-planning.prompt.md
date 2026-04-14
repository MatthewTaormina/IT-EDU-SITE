---
description: "Sprint planning ceremony: read backlog → select tasks for 2-week sprint → update sprint-current.json and tasks.md"
---

# Sprint Planning

Plan the next 2-week sprint.

## Steps

1. **Read current sprint** — Read `.tasks/sprint-current.json`. If any tasks are IN_PROGRESS or not DONE, carry them forward first before adding new work. Note the last sprint ID so you can increment it.

2. **Read the backlog** — Read `.tasks/sprint-backlog.json`. Identify all tasks with status `TODO` or `BLOCKED`. Sort by priority: `CRITICAL → HIGH → MEDIUM → LOW`.

3. **Check objectives** — Read `.objectives/milestones.md`. Identify the nearest milestone. Prefer tasks that directly advance it.

4. **Check capacity** — Default sprint capacity is 40 hours. Factor in any carry-over tasks. Only commit tasks whose `estimated_hours` sum fits within capacity.

5. **Check blockers** — For each candidate task, verify all `dependencies` have status `DONE`. Skip any task with unmet dependencies unless you can unblock it this sprint.

6. **Check knowledge readiness** — For each content task, verify its `knowledge_nodes` exist in `.knowledge/map.json`. If a required node is missing, either:
   - Add a research task for it first, OR
   - Pick a different content task

7. **Write sprint plan** — Update `.tasks/sprint-current.json`:
   - Increment the `sprint_id`
   - Set `start_date` and `end_date` (14 days)
   - Set `goal` (1–2 sentence sprint goal)
   - Set `tasks` to the selected task IDs
   - Update each selected task in the backlog to `IN_PROGRESS` for the first task, `TODO` for the rest

8. **Update kanban** — Update `.tasks/tasks.md` to reflect the new sprint column.

## Output

- Updated `.tasks/sprint-current.json`
- Updated `.tasks/sprint-backlog.json` (status changes)
- Updated `.tasks/tasks.md`
