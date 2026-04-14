# README_AGENT.md — Instructional Knowledge Engine: Agent System Prompt Extension

**Version:** 2.0.0  
**Last Updated:** 2026-04-14  
**Scope:** Any AI agent reading or writing data within the `.knowledge/` directory  

---

## 1. WHAT THIS FOLDER IS

`.knowledge/` is an **Instructional Knowledge Engine** — a machine-optimized research graph that backs IT educational content generation for the IT EDU SITE platform. It is **not** public-facing documentation. It is **not** an application. It exists exclusively to:

1. Give AI agents high-density, structured domain knowledge for curriculum tasks
2. Provide a validated competency model for content scoping and sequencing
3. Surface gap intelligence to drive research backlog prioritization
4. Define educational asset templates that agents can instantiate

---

## 2. HOW TO READ THIS FOLDER

### Entry Points (in order)

| Priority | File | When to Read |
| :--- | :--- | :--- |
| 1 | `.knowledge/map.json` | **Always read first.** Gives the full node graph and edge relationships in one JSON parse. Use to identify relevant documents before reading any Markdown file. |
| 2 | `.knowledge/validation/gap-analysis.md` | Read when the task involves new content creation — check the gap register before generating anything that might already be covered or that fills a CRITICAL gap. |
| 3 | Domain `manifest.json` files | Read the relevant directory's `manifest.json` to get terminal objectives and available educational asset templates for that domain. |
| 4 | Individual `.md` research files | Read only when the task requires deep knowledge of a specific topic. Use the YAML frontmatter `terminal_objective` block for machine-parseable task context. |

### The YAML `terminal_objective` Block

Every research `.md` file contains a `terminal_objective` block in its YAML frontmatter with four fields:

```yaml
terminal_objective:
  prerequisite: "What must be known before this content"
  concept: "The machine-readable concept definition for this node"
  practical_application: "What the learner actually does with this knowledge"
  market_value: "Industry demand signal and employment relevance"
```

**Use these fields as structured inputs** when generating learning objectives, scoping project requirements, or assessing learner readiness. Do not re-derive these from prose — the YAML is authoritative.

---

## 3. AGENT TASK PROTOCOLS

### Protocol A — Generate a New Lesson or Unit

```
1. READ .knowledge/map.json → identify the relevant domain node(s)
2. READ the domain manifest.json → review terminal_objective and existing educational_assets
3. READ the target research .md file → use terminal_objective.concept as the lesson's core definition
4. CHECK .knowledge/validation/gap-analysis.md → verify the topic is not a CRITICAL gap that needs a new research document first
5. GENERATE content following:
   - terminal_objective.prerequisite → set as lesson prerequisites
   - terminal_objective.concept → write the "Concept Explanation" section
   - terminal_objective.practical_application → write the lab/challenge deliverable
   - terminal_objective.market_value → write the "Why This Matters" framing
6. VALIDATE: Does the generated content target Bloom Level ≥ 3? If not, revise.
```

### Protocol B — Assess a Learner's Readiness for a Topic

```
1. READ .knowledge/map.json → find the target node
2. READ the node's YAML terminal_objective.prerequisite field
3. TRAVERSE the graph: for each prerequisite node, recursively collect its prerequisites
4. PRODUCE: a flattened prerequisite chain with estimated mastery evidence for each node
5. OUTPUT: JSON object { target, prerequisite_chain: [{node, evidence_type, mastery_signal}] }
```

### Protocol C — Prioritize Content Development Backlog

```
1. READ .knowledge/validation/gap-analysis.md → extract gap_summary from manifest.json
2. FILTER: severity = CRITICAL || HIGH
3. CROSS-REFERENCE: .knowledge/map.json → does a node already exist for this gap?
4. OUTPUT: ordered list of { gap_id, topic, action, new_document_path, prerequisite_nodes }
   sorted by (severity DESC, curriculum_impact DESC)
```

### Protocol D — Create a New Research Document

```
1. VERIFY: the topic is in the gap-analysis.md gap register (do not create undocumented additions)
2. READ an existing research .md file in the target domain for format reference
3. GENERATE the new document with:
   - YAML frontmatter: tags, related_topics (Wikilinks), last_updated, terminal_objective (all 4 fields)
   - "## Summary for AI Agents" section immediately after frontmatter
   - Content structured for RAG chunking: short, self-contained sections with clear headings
   - No conversational filler; no placeholder prose
4. UPDATE .knowledge/map.json: add the new node and its edges
5. UPDATE the domain manifest.json: add the document entry with terminal_objective and educational_assets
6. UPDATE .knowledge/indexes/master-index.md: add the node to the appropriate domain table
```

### Protocol E — Generate Educational Assets from a Research Node

```
1. READ the domain manifest.json → find the document's educational_assets array
2. FOR each asset in educational_assets:
   - asset.type → determines the content template (see Section 4 below)
   - asset.bloom_level → sets cognitive complexity target
   - asset.deliverable → defines the exact output the learner must produce
3. GENERATE the asset using the deliverable as the acceptance criteria
4. VERIFY: asset does not introduce new technical content not present in the source research node
```

---

## 4. EDUCATIONAL ASSET TEMPLATES

### `code_lab`
A hands-on coding task with a concrete, verifiable deliverable.

**Required structure:**
- Setup / prerequisites (what is already provided)
- Task description (what the learner must implement)
- Success criteria (a list of checkable conditions)
- Hint (optional — minimum necessary nudge, does not give away the solution)

**Bloom target:** Level 3 (Apply) minimum; Level 4 (Analyze) preferred.

---

### `quiz`
A set of short-answer or classification questions testing conceptual understanding.

**Required structure:**
- 10–25 questions minimum
- Each question must map to a specific terminal_objective.concept element
- No multiple-choice unless item stems require selecting the "most correct" among technically valid options
- Include answer key with explanations

**Bloom target:** Level 1–2 (Remember/Understand).

---

### `project`
A multi-session deliverable that synthesizes multiple research nodes.

**Required structure:**
- Driving question or business scenario
- Technical requirements list (specific, not vague)
- Minimum viable product (MVP) specification
- Stretch goals (optional advanced extensions)
- Assessment rubric aligned to terminal_objective.market_value criteria

**Bloom target:** Level 5–6 (Evaluate/Create).

---

### `exercise`
A focused, single-session practice task that is more structured than a project but less prescriptive than a lab.

**Required structure:**
- Scenario or starting state
- Task (what to do)
- Deliverable (what to produce or answer)

**Bloom target:** Level 3–4 (Apply/Analyze).

---

### `case_study`
A provided artifact (codebase, design, system description) to analyze against principles.

**Required structure:**
- The artifact (or reference to it)
- Analysis questions aligned to research node concepts
- Written deliverable requirements

**Bloom target:** Level 4–5 (Analyze/Evaluate).

---

### `rubric`
A scoring instrument for evaluating learner output against defined criteria.

**Required structure:**
- Criterion list derived from terminal_objective.practical_application
- Performance level descriptors (at minimum: Developing / Meets / Exceeds)
- Point values per criterion (if applicable)

**Bloom target:** Level 5 (Evaluate — the rubric evaluates the learner's product).

---

## 5. CONSTRAINTS AND PROHIBITED BEHAVIORS

| Constraint | Rule |
| :--- | :--- |
| **No application code** | Do not generate React components, Express routes, or any code that belongs in the application itself |
| **No public-facing content** | Everything in `.knowledge/` is internal background data |
| **No placeholder prose** | Every field must contain real content — no "TBD", "content here", or "coming soon" |
| **No undocumented additions** | New research documents must be registered in `map.json`, the domain `manifest.json`, and `indexes/master-index.md` |
| **No Bloom Level 1–2 projects** | Projects must target Bloom ≥ 5; if the deliverable is only recall/comprehension, change the asset type to `quiz` |
| **No orphaned nodes** | Every new research document must have at least two edges in `map.json` |
| **No deprecated tech** | Check `validation/gap-analysis.md` Deprecation Notices before generating code examples |

---

## 6. PRIORITY SIGNAL (2026)

When generating new content or filling gaps, prioritize these high-signal skill areas above foundational basics:

| Priority | Skill Area | Research Gap ID | Target Document |
| :--- | :--- | :--- | :--- |
| ★★★★★ | Automated Testing (unit/integration/e2e) | GAP-004 | `programming/automated-testing.md` |
| ★★★★★ | LLM API Integration | GAP-001 | `programming/llm-api-integration.md` |
| ★★★★★ | Model Context Protocol (MCP) | GAP-003 | `programming/mcp-model-context-protocol.md` |
| ★★★★★ | AI Agent Orchestration | GAP-002 | `programming/agent-orchestration.md` |
| ★★★★☆ | Web Security (OWASP Top 10) | GAP-011 | `web-dev/web-security.md` |
| ★★★★☆ | Observability + OpenTelemetry | GAP-006 | `web-dev/observability.md` |
| ★★★★☆ | Vector Databases + Embeddings | GAP-008 | `programming/vector-databases-embeddings.md` |
| ★★★☆☆ | Edge Computing + Serverless | GAP-007 | Expand `web-dev/infrastructure.md` |
| ★★★☆☆ | Kubernetes Basics | GAP-013 | Expand `web-dev/infrastructure.md` |

---

## 7. GRAPH NAVIGATION QUICK REFERENCE

To navigate the research graph without reading every document:

```json
// Parse .knowledge/map.json
// Nodes are in: map.nodes[]
// Edges are in: map.edges[]
// Each edge: { "from": "node-id", "to": "node-id", "relationship": "relationship-type" }

// To find prerequisites of a node:
// Filter edges where edge.to === targetNodeId
// The edge.from nodes are the prerequisites (follow "requires", "justified-by", "substrate-of" relationship types)

// To find what a node enables:
// Filter edges where edge.from === sourceNodeId
// The edge.to nodes are what this knowledge unlocks

// To find all documents in a domain:
// Filter nodes where node.domain === "pedagogy" | "programming" | "web-dev" | "indexes" | "validation"
```

---

## 8. VERSIONING PROTOCOL

When updating any research document:

1. Update the `last_updated` YAML field to the current ISO date
2. If `terminal_objective` fields change, update the corresponding `manifest.json` entry
3. If the node's `related_nodes` change, update `map.json` edges and `indexes/cross-reference-map.md`
4. Increment `map.json` `meta.version` using semver: PATCH for content updates, MINOR for new nodes, MAJOR for schema changes

Current schema version: **2.0.0**
