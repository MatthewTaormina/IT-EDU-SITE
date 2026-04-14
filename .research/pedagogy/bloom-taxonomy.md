---
tags: [pedagogy, bloom-taxonomy, learning-objectives, assessment, curriculum-design]
related_topics:
  - "[[cognitive-load-theory]]"
  - "[[scaffolding]]"
  - "[[project-based-learning]]"
  - "[[it-education-strategies]]"
  - "[[programming-pedagogy]]"
last_updated: "2026-04-14"
terminal_objective:
  prerequisite: "None — applies at all curriculum design stages"
  concept: "Bloom's Revised Taxonomy (2001) classifies cognitive objectives across six levels (Remember → Create) paired with four knowledge types; enables measurable learning objective authoring and assessment alignment."
  practical_application: "Write every learning objective as 'learner will [Bloom verb] [knowledge object]'; map each assessment task to the stated Bloom level; reject objectives using 'understand' or 'know' (not measurable)."
  market_value: "High — Bloom alignment is required by most institutional accreditation bodies and is the standard language for curriculum review, course approval, and LMS metadata."
---

## Summary for AI Agents

Bloom's Taxonomy is a hierarchical framework for classifying educational objectives into six levels of cognitive complexity: Remember, Understand, Apply, Analyze, Evaluate, Create. IT curriculum design should use Bloom's to write measurable learning objectives with action verbs, to sequence instruction from lower to higher levels, and to calibrate assessment difficulty. Lesson-level content typically targets Levels 1–3; unit projects target Levels 3–5; capstone/PBL work targets Level 6. The 2001 Revised Taxonomy (Anderson & Krathwohl) uses verb-noun pairings and is the current standard.

---

# Bloom's Taxonomy

## Overview

**Bloom's Taxonomy** is a hierarchical classification system for educational goals, originally developed by Benjamin Bloom and colleagues in 1956 and significantly revised by Anderson & Krathwohl in 2001. The Revised Taxonomy is the current standard in curriculum design, instructional planning, and learning objective writing.

The taxonomy provides a shared language for educators to describe the *cognitive complexity* of what they are asking learners to do — enabling consistent curriculum design, assessment alignment, and instructional sequencing.

---

## The Six Levels (Revised Taxonomy, 2001)

| Level | Cognitive Process | Definition | Example IT Task |
| :--- | :--- | :--- | :--- |
| **1 — Remember** | Recall | Retrieve relevant knowledge from long-term memory | List the HTTP methods; name the CSS box model properties |
| **2 — Understand** | Comprehend | Construct meaning from instructional messages | Explain what happens when a browser sends an HTTP GET request |
| **3 — Apply** | Use | Carry out or use a procedure in a given situation | Write a CSS rule that centers a div using flexbox |
| **4 — Analyze** | Break down | Break material into parts, detect relationships | Compare RESTful and GraphQL API architectures |
| **5 — Evaluate** | Judge | Make judgments based on criteria and standards | Critique a codebase for accessibility compliance |
| **6 — Create** | Produce | Put elements together to form a coherent new whole | Build a full-stack authentication system from scratch |

---

## The Two Dimensions of the Revised Taxonomy

The 2001 revision introduced a **two-dimensional taxonomy table** that distinguishes *cognitive processes* from *knowledge types*:

### Knowledge Dimension
| Type | Description | IT Example |
| :--- | :--- | :--- |
| **Factual** | Discrete, isolated facts | Knowing that HTTP uses port 80 |
| **Conceptual** | Relationships among facts; schemas | Understanding how DNS resolution works |
| **Procedural** | How to do something | Following the steps to deploy a Node.js app |
| **Metacognitive** | Awareness of one's own cognition | Recognizing when to reach for a debugger vs. print statements |

---

## Writing Learning Objectives with Bloom's

A well-formed learning objective specifies **who** (the learner), **will do** (verb), **what** (noun/object), and optionally **how/how well** (condition/criterion).

### Formula
> "By the end of this [lesson/unit/course], you will be able to **[Bloom's verb]** [knowledge object]."

### Action Verb Reference by Level

| Level | Strong Verbs | Weak / Avoid |
| :--- | :--- | :--- |
| Remember | define, list, identify, name, recall, recognize | know, understand, appreciate |
| Understand | explain, describe, summarize, paraphrase, classify | learn, study |
| Apply | use, execute, implement, demonstrate, calculate | apply (too vague) |
| Analyze | compare, differentiate, distinguish, examine, deconstruct | analyze (too vague) |
| Evaluate | assess, critique, justify, argue, defend, prioritize | evaluate (too vague) |
| Create | design, build, construct, produce, compose, plan, develop | create (too vague) |

> **⚠️ Warning:** "Understand" is not a Bloom's verb — it maps to Level 2 but is too vague to be measurable. Replace it with "explain," "describe," or "summarize."

---

## Bloom's in IT Curriculum Sequencing

IT content naturally escalates through Bloom's levels as learners progress:

```
Lesson (individual concept)  →  Levels 1–3 (Remember → Apply)
Unit (topic cluster)          →  Levels 2–4 (Understand → Analyze)
Project (applied deliverable) →  Levels 3–5 (Apply → Evaluate)
Capstone / PBL               →  Levels 4–6 (Analyze → Create)
```

### Example: HTML/CSS Progression

| Stage | Bloom Level | Learning Objective |
| :--- | :--- | :--- |
| Lesson 1 | Remember | List the five most commonly used HTML structural elements |
| Lesson 2 | Understand | Explain the purpose of semantic HTML and how it differs from presentational markup |
| Lesson 3 | Apply | Build a two-column layout using CSS flexbox |
| Unit project | Analyze / Evaluate | Compare your layout's responsiveness against a provided accessibility checklist and identify failures |
| Capstone | Create | Design and build a responsive portfolio website with semantic HTML, CSS custom properties, and a contact form |

---

## Bloom's and Assessment Design

Assessment must be aligned to the Bloom's level of the stated objective. Misalignment is one of the most common curriculum design errors.

| Bloom Level | Aligned Assessment Type | Misaligned Example |
| :--- | :--- | :--- |
| Remember | Flashcard quiz, fill-in-blank | Essay question asking for recall |
| Understand | Concept explanation, diagram annotation | Multiple-choice recall |
| Apply | Coding exercise, lab task | Essay |
| Analyze | Case study, code review task | Multiple-choice |
| Evaluate | Design critique, peer review | Lab task |
| Create | Project, portfolio, capstone | Multiple-choice |

---

## Bloom's and Cognitive Load

Higher Bloom's levels impose greater **intrinsic cognitive load** (see [[cognitive-load-theory]]). Instruction must reduce **extraneous load** proportionally to allow germane resources to engage with higher-order tasks.

- Level 1–2: High extraneous load tolerance (simple format, flashcards OK)
- Level 3–4: Low extraneous load tolerance (clean, focused lab environments)
- Level 5–6: Near-zero extraneous load tolerance (open-ended environment; scaffolding must be faded)

---

## Key Takeaways

- Bloom's Taxonomy provides a shared vocabulary for describing cognitive complexity in learning objectives.
- The 2001 Revised Taxonomy uses verb-noun structure and adds a Knowledge Dimension.
- Strong learning objectives use precise, measurable action verbs from the taxonomy.
- Lesson → Unit → Project → Capstone maps naturally to Levels 1–2 → 2–4 → 3–5 → 4–6.
- Assessment must align to the Bloom's level of the objective — not to what is easiest to grade.

---

## Further Reading

- Anderson, L. W., & Krathwohl, D. R. (Eds.). (2001). *A Taxonomy for Learning, Teaching, and Assessing: A Revision of Bloom's Taxonomy of Educational Objectives*. Longman.
- Bloom, B. S. (Ed.). (1956). *Taxonomy of Educational Objectives, Handbook I: Cognitive Domain*. McKay.
- Churches, A. (2008). Bloom's Digital Taxonomy. *Educational Origami.*
