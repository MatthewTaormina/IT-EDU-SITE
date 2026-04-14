---
description: "Add a new topic to the knowledge base: web research → synthesize terminal_objective → register in map.json and manifests"
---

# New Research Node

Add a research node for: **$topic** in domain **$domain**.

## Steps

1. **Check map.json** — Read `.knowledge/map.json`. Confirm no existing node covers this topic. If one exists, run an update on the existing file instead.

2. **Check gap-analysis** — Read `.knowledge/validation/gap-analysis.md`. Note any existing gap register entry for this topic — that's your priority context.

3. **Read domain manifest** — Read `.knowledge/{domain}/manifest.json`. Understand where this topic fits in the domain's terminal objectives and which assets it should produce.

4. **Web research** — Use `@research-analyst` with web search to gather:
   - Authoritative definitions and technical depth
   - Industry usage context and employer expectations
   - Common beginner misconceptions
   - Prerequisite knowledge required
   - Practical applications and exercises

5. **Write the research doc** — Use `@research-analyst` to create `.knowledge/{domain}/{topic}.md` with:
   - File-level `terminal_objective` YAML block (prerequisite, concept, practical_application, market_value) — **this is the most critical section**
   - Domain overview (2–4 paragraphs)
   - Key concepts (reference-style, not tutorial)
   - Common misconceptions
   - Educational assets (examples, exercises, quiz questions)
   - References with URLs

6. **Register in map.json** — Add the new node to `.knowledge/map.json` with `id`, `domain`, `type`, `file`, `edges` (links to related nodes).

7. **Update domain manifest** — Add the new node to the `nodes` array in `.knowledge/{domain}/manifest.json`.

8. **Update gap-analysis** — If this resolves a CRITICAL/HIGH gap entry, mark it resolved in `.knowledge/validation/gap-analysis.md`.

## Output

- `.knowledge/{domain}/{topic}.md`
- Updated `.knowledge/map.json`
- Updated `.knowledge/{domain}/manifest.json`
- Updated `.knowledge/validation/gap-analysis.md` (if gap resolved)
