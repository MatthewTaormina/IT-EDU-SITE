# Checklist: PRD Review (Pre-Development Gate)

> A PRD must pass this checklist before any implementation work begins.
> Gate enforced in: [[.plan/operations/tasks.md]] — move task to `[IN_PROGRESS]` only after all items are checked.

---

## Completeness

- [ ] All 11 PRD sections are filled (no `_TODO_` placeholders remaining)
- [ ] At least 3 user stories defined
- [ ] At least 2 functional requirements with priority set
- [ ] Non-functional requirements cover: Performance, Accessibility, Browser Support
- [ ] Technical constraints section reviewed against [[site/docusaurus.config.ts]] and [[.skills/edu_content_authoring.md]]

## Alignment

- [ ] PRD goal maps to ≥1 North Star goal in [[.plan/vision/vision.md]]
- [ ] Corresponding Kanban task exists in [[.plan/operations/tasks.md]] and ID is referenced in PRD metadata
- [ ] Milestone linkage confirmed in [[.plan/roadmap/milestones.md]]

## Scope Control

- [ ] "Out of Scope" section explicitly lists at least 1 item
- [ ] No open questions are blocking implementation (Q with no owner or due date)

## UX

- [ ] At least one Mermaid.js or SVG wireframe/flow diagram is present (in PRD or linked from [[.plan/ux/]])

## Approval

- [ ] PRD status set to `APPROVED` in metadata table
- [ ] Reviewed by ≥1 person (human or agent) other than the author

---

*Checklist version: 1.0 | Source: [[.plan/operations/checklists/checklist_prd_review.md]]*
