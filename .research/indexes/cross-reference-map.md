---
tags: [index, cross-reference, graph, adjacency, research-navigation]
related_topics:
  - "[[master-index]]"
last_updated: "2026-04-14"
---

## Summary for AI Agents

This document is the cross-reference map for the `.research/` knowledge base. It defines the directed relationships between all research nodes. Use this to traverse the research graph: given a starting node, this document lists every node it links to and every node that links to it. For the full machine-readable version, see `map.json` in the `.research/` root. For node descriptions and domain groupings, see [[master-index]].

---

# Cross-Reference Map

## Graph Conventions

- **→** indicates "this node references / is related to"
- **Bidirectional** links are shown once with a note
- Relationships reflect substantive content dependencies, not just casual mentions

---

## Node: `project-based-learning`

**Outbound (references):**
- → [[scaffolding]] — PBL requires scaffolding to prevent cognitive overload; fading strategy applies
- → [[bloom-taxonomy]] — PBL projects should be assessed at Bloom Levels 3–6
- → [[cognitive-load-theory]] — Explains why PBL needs front-loaded support
- → [[it-education-strategies]] — PBL is one strategy within the broader IT education strategy space

**Inbound (referenced by):**
- ← [[scaffolding]] — Scaffolding design context often uses PBL as the delivery model
- ← [[it-education-strategies]] — PBL cited as a primary IT instructional strategy
- ← [[core-competencies-fullstack]] — PBL projects are the delivery mechanism for capstone competencies

---

## Node: `scaffolding`

**Outbound:**
- → [[project-based-learning]] — Scaffolding is the primary support mechanism in PBL
- → [[cognitive-load-theory]] — Scaffolding is the primary tool for managing cognitive load
- → [[bloom-taxonomy]] — Scaffold level should be adjusted to target Bloom level
- → [[it-education-strategies]] — Scaffolding strategies are enumerated in IT education context
- → [[programming-pedagogy]] — Code-specific scaffolds (starter code, faded examples) are a programming pedagogy topic

**Inbound:**
- ← [[project-based-learning]] — PBL requires scaffolding
- ← [[cognitive-load-theory]] — CLT explains why scaffolding works
- ← [[programming-pedagogy]] — Scaffolding techniques are a core programming pedagogy topic
- ← [[it-education-strategies]] — Scaffolding listed as a key IT strategy

---

## Node: `cognitive-load-theory`

**Outbound:**
- → [[scaffolding]] — Scaffolding manages extraneous and intrinsic load
- → [[bloom-taxonomy]] — Higher Bloom levels impose more intrinsic load; CLT governs design
- → [[project-based-learning]] — CLT explains why PBL needs scaffolding at launch
- → [[programming-pedagogy]] — Worked examples, Parsons Problems, faded examples all derive from CLT

**Inbound:**
- ← [[scaffolding]] — Scaffolding explained through CLT lens
- ← [[programming-pedagogy]] — CLT is the theoretical basis for most programming pedagogy findings
- ← [[it-education-strategies]] — CLT cited as foundational framework for IT instructional decisions

---

## Node: `bloom-taxonomy`

**Outbound:**
- → [[cognitive-load-theory]] — Higher Bloom levels require lower extraneous load
- → [[scaffolding]] — Scaffold level adjusted by Bloom target
- → [[project-based-learning]] — PBL assessment aligned to Bloom 3–6
- → [[it-education-strategies]] — Competency levels aligned to Bloom in IT context
- → [[programming-pedagogy]] — Assessment types mapped to Bloom levels

**Inbound:**
- ← [[project-based-learning]] — PBL rubrics aligned to Bloom
- ← [[scaffolding]] — Scaffold design references Bloom level of target objective
- ← [[cognitive-load-theory]] — Bloom level predicts intrinsic load
- ← [[it-education-strategies]] — Competency levels reference Bloom taxonomy

---

## Node: `it-education-strategies`

**Outbound:**
- → [[project-based-learning]] — PBL cited as primary IT instructional strategy
- → [[scaffolding]] — Scaffolding strategies for IT context
- → [[bloom-taxonomy]] — Competency levels aligned to Bloom
- → [[cognitive-load-theory]] — CLT cited as foundational
- → [[programming-pedagogy]] — Research-backed programming strategies cross-referenced
- → [[core-competencies-fullstack]] — Strategy document references competency scoping

**Inbound:**
- ← [[project-based-learning]] — PBL is one of the strategies
- ← [[programming-pedagogy]] — Programming pedagogy is a sub-domain of IT education strategies
- ← [[core-competencies-fullstack]] — Competency map designed with IT education strategies

---

## Node: `language-fundamentals`

**Outbound:**
- → [[programming-paradigms]] — Fundamentals are the building blocks that paradigms organize
- → [[programming-pedagogy]] — Notional machine and mental models reference fundamental concepts

**Inbound:**
- ← [[programming-paradigms]] — Paradigms build on language fundamentals
- ← [[programming-pedagogy]] — Fundamentals are the first content domain in programming education
- ← [[core-competencies-fullstack]] — Tier 0/1 competencies require fundamentals

---

## Node: `programming-paradigms`

**Outbound:**
- → [[language-fundamentals]] — Paradigms are patterns of using language fundamentals
- → [[software-engineering-principles]] — OOP paradigm underpins SOLID; FP underpins DRY via immutability
- → [[programming-pedagogy]] — Paradigm context shapes how concepts are taught
- → [[frontend-stack]] — React = functional + declarative; DOM = imperative; all paradigms present in web dev
- → [[backend-stack]] — Node.js uses event-driven + imperative patterns

**Inbound:**
- ← [[language-fundamentals]] — Fundamentals are the substrate for all paradigms
- ← [[software-engineering-principles]] — SOLID assumes OOP paradigm
- ← [[frontend-stack]] — Frontend uses multiple paradigms simultaneously
- ← [[backend-stack]] — Backend is primarily imperative + event-driven

---

## Node: `software-engineering-principles`

**Outbound:**
- → [[programming-paradigms]] — SOLID is OOP-specific; FP underpins DRY and immutability
- → [[core-competencies-fullstack]] — SE principles are Tier 4+ competencies
- → [[backend-stack]] — Principles applied in API and service layer design
- → [[it-education-strategies]] — Principles taught via refactoring, not definition

**Inbound:**
- ← [[programming-paradigms]] — Paradigms provide the context in which principles apply
- ← [[core-competencies-fullstack]] — Listed as advanced programming competency
- ← [[backend-stack]] — REST API design and service architecture reference SE principles

---

## Node: `programming-pedagogy`

**Outbound:**
- → [[it-education-strategies]] — Programming pedagogy is a subdomain of IT education
- → [[scaffolding]] — Code-specific scaffolds are a programming pedagogy focus
- → [[cognitive-load-theory]] — CLT is the theoretical basis for PRIMM, worked examples
- → [[bloom-taxonomy]] — Assessment strategies mapped to Bloom levels
- → [[language-fundamentals]] — Notional machine builds accurate mental model of fundamentals
- → [[programming-paradigms]] — Language selection decisions are paradigm-influenced

**Inbound:**
- ← [[it-education-strategies]] — Programming pedagogy research cited
- ← [[scaffolding]] — Scaffolding in programming contexts
- ← [[cognitive-load-theory]] — CLT explains why programming pedagogy strategies work

---

## Node: `core-competencies-fullstack`

**Outbound:**
- → [[frontend-stack]] — Tiers 1–2 map directly to frontend technologies
- → [[backend-stack]] — Tiers 3–4 map to backend technologies
- → [[infrastructure]] — Tier 5 maps to DevOps competencies
- → [[web-standards]] — Standards underpin all technology competencies
- → [[software-engineering-principles]] — Advanced competency tier
- → [[it-education-strategies]] — Competency map designed with these strategies
- → [[programming-paradigms]] — Paradigm literacy is a cross-cutting competency

**Inbound:**
- ← [[frontend-stack]] — Frontend stack competencies are listed in this map
- ← [[backend-stack]] — Backend stack competencies are listed here
- ← [[infrastructure]] — Infrastructure competencies are listed here
- ← [[it-education-strategies]] — Strategy design references this competency map

---

## Node: `frontend-stack`

**Outbound:**
- → [[backend-stack]] — Frontend and backend are complementary; API contract defines the interface
- → [[web-standards]] — HTML, CSS, JS are defined by standards bodies
- → [[infrastructure]] — Frontend apps are deployed to static hosts or CDNs
- → [[core-competencies-fullstack]] — Frontend competencies are Tiers 1–2

**Inbound:**
- ← [[backend-stack]] — Backend serves the API that frontend consumes
- ← [[web-standards]] — Standards define HTML/CSS/JS behavior
- ← [[programming-paradigms]] — React is functional + declarative paradigm
- ← [[core-competencies-fullstack]] — Competency map describes frontend tiers

---

## Node: `backend-stack`

**Outbound:**
- → [[frontend-stack]] — Backend exposes the API that frontend consumes
- → [[web-standards]] — HTTP specification governs backend-client communication
- → [[infrastructure]] — Backend apps are deployed to application platforms
- → [[software-engineering-principles]] — SE principles applied in service design

**Inbound:**
- ← [[frontend-stack]] — Frontend calls backend APIs
- ← [[infrastructure]] — Infrastructure hosts backend services
- ← [[core-competencies-fullstack]] — Competency tiers 3–4

---

## Node: `web-standards`

**Outbound:**
- → [[frontend-stack]] — Standards define the behavior of HTML, CSS, and JavaScript
- → [[backend-stack]] — HTTP spec governs all API communication

**Inbound:**
- ← [[frontend-stack]] — Frontend technologies are standards implementations
- ← [[backend-stack]] — HTTP/REST behavior is defined by standards
- ← [[core-competencies-fullstack]] — Standards literacy is a professional competency

---

## Node: `infrastructure`

**Outbound:**
- → [[frontend-stack]] — Static deployment of frontend apps
- → [[backend-stack]] — Application platform deployment for backend services
- → [[core-competencies-fullstack]] — Tier 5 DevOps competencies

**Inbound:**
- ← [[frontend-stack]] — Frontend is deployed to infrastructure
- ← [[backend-stack]] — Backend runs on infrastructure platforms
- ← [[core-competencies-fullstack]] — Infrastructure as a Tier 5 competency

---

## Node: `master-index`

**Outbound:** All nodes (navigation hub)

**Inbound:**
- ← [[cross-reference-map]] — Companion document

---

## Node: `cross-reference-map`

**Outbound:**
- → [[master-index]] — Companion navigation hub

**Inbound:**
- ← [[master-index]] — Linked from master index

---

## Summary Table: Relationship Density

Nodes sorted by total in + out connections (most connected = most central to the graph):

| Node | Out | In | Total | Role |
| :--- | :--- | :--- | :--- | :--- |
| it-education-strategies | 6 | 4 | 10 | Central hub — pedagogy domain |
| core-competencies-fullstack | 7 | 4 | 11 | Central hub — competency domain |
| scaffolding | 5 | 4 | 9 | Bridge — pedagogy ↔ programming |
| cognitive-load-theory | 4 | 3 | 7 | Foundation — explains learning constraints |
| bloom-taxonomy | 5 | 4 | 9 | Framework — used by all pedagogy nodes |
| programming-pedagogy | 6 | 3 | 9 | Bridge — pedagogy ↔ programming |
| frontend-stack | 4 | 4 | 8 | Hub — web-dev domain |
| backend-stack | 4 | 4 | 8 | Hub — web-dev domain |
| programming-paradigms | 5 | 4 | 9 | Bridge — programming ↔ web-dev |
| project-based-learning | 4 | 3 | 7 | Strategy — pedagogy |
| software-engineering-principles | 4 | 3 | 7 | Principles — programming |
| language-fundamentals | 2 | 3 | 5 | Foundation — programming |
| web-standards | 2 | 3 | 5 | Foundation — web-dev |
| infrastructure | 3 | 3 | 6 | Operational — web-dev |
