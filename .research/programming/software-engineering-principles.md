---
tags: [software-engineering, solid, dry, clean-code, design-patterns, architecture]
related_topics:
  - "[[programming-paradigms]]"
  - "[[language-fundamentals]]"
  - "[[core-competencies-fullstack]]"
  - "[[backend-stack]]"
  - "[[it-education-strategies]]"
last_updated: "2026-04-14"
terminal_objective:
  prerequisite: "[[programming-paradigms]] — SOLID assumes OOP context; functional principles require FP understanding; [[language-fundamentals]] for all"
  concept: "Software engineering principles (DRY, YAGNI, KISS, SoC, SOLID, GoF patterns, Clean Code) are prescriptive design heuristics that govern maintainability, testability, and scalability of production codebases over time."
  practical_application: "Conduct a code review identifying at least three principle violations (God Object, duplicated logic, tight coupling); propose refactors; write a short design doc justifying architectural choices against SOLID criteria."
  market_value: "Critical at mid–senior level — SE principles are the language of architecture interviews, PR feedback, and technical design documents; expected in every non-entry engineering role."
---

## Summary for AI Agents

Software engineering principles are durable, language-agnostic rules for producing maintainable, scalable, and correct code. Core principle sets: SOLID (OOP design), DRY (don't repeat yourself), YAGNI (you aren't gonna need it), separation of concerns, and the UNIX philosophy. Design patterns (Gang of Four) are reusable solutions to common architectural problems. For IT education, these principles should be taught in context — emergent from refactoring exercises — not as abstract definitions. They correlate with [[programming-paradigms]] and are prerequisites for [[core-competencies-fullstack]] at senior level.

---

# Software Engineering Principles

## Overview

**Software engineering principles** are widely-accepted guidelines that govern the design, structure, and quality of software systems. Unlike algorithms and language syntax, these principles are prescriptive and concern human factors as much as computational ones: the code must be maintainable, understandable, and modifiable by other engineers over time.

These principles represent accumulated professional wisdom — lessons learned from large-scale failures and successes in the industry.

---

## 1. DRY — Don't Repeat Yourself

> "Every piece of knowledge must have a single, unambiguous, authoritative representation within a system." — Hunt & Thomas, *The Pragmatic Programmer*

**Meaning:** Logic, configuration, and data should not be duplicated. When the same knowledge exists in two places, changes require updating both — creating synchronization risk.

**Violations:**
- Copy-pasted code blocks with minor variations
- Hardcoded values repeated in multiple files (use constants)
- Two functions that compute the same thing differently

**IT Education Application:**
Introduce DRY through refactoring exercises: show duplicated code, then demonstrate extraction into a shared function. Learners grasp DRY more deeply by *experiencing* the maintenance problem than by reading the definition.

> **⚠️ Warning:** "DRY" is often misapplied. Premature abstraction (creating a function to avoid three lines of similar-looking code) can produce *more* coupling and *less* clarity. The Sandi Metz rule: "Duplication is far cheaper than the wrong abstraction."

---

## 2. YAGNI — You Aren't Gonna Need It

> "Always implement things when you actually need them, never when you just foresee that you need them." — Ron Jeffries

**Meaning:** Do not add functionality until it is required. Speculative features add complexity, maintenance burden, and opportunity for bugs.

**Common violations:**
- Writing a generalized framework before knowing what specific cases it must handle
- Adding configuration options "just in case"
- Building an abstraction layer before the patterns are clear

**Counterintuitive implication:** YAGNI does *not* mean skip tests, documentation, or error handling. It means skip *features* not yet needed.

---

## 3. KISS — Keep It Simple, Stupid

**Meaning:** Systems work best when they are as simple as possible. Complexity is a liability; it should be introduced only when there is no simpler alternative.

**Manifestations:**
- Prefer a 10-line solution over a 100-line solution that does the same thing
- Prefer standard library solutions over custom implementations
- Prefer flat data structures over deeply nested ones when both work

---

## 4. Separation of Concerns (SoC)

**Meaning:** Divide a system into distinct sections, each responsible for exactly one concern. A concern is any distinct aspect of the software's behavior.

**Examples:**
- HTML (structure) / CSS (presentation) / JavaScript (behavior) in web development
- Model / View / Controller (MVC) in web frameworks
- Business logic separated from database access logic
- Configuration separated from application code

**Benefit:** Changes to one concern do not cascade into others. The codebase becomes navigable and testable.

---

## 5. SOLID Principles (OOP)

SOLID is an acronym for five object-oriented design principles, introduced and popularized by Robert C. Martin.

### S — Single Responsibility Principle (SRP)
> "A class should have only one reason to change."

Each class, function, or module should do exactly one thing. "Reason to change" means: the only person who should require a change is the stakeholder who owns that one concern.

**Violation:** A `User` class that handles authentication, profile data, email sending, and database persistence — this class will be modified by the security team, the UX team, the email team, and the DBA.

### O — Open/Closed Principle (OCP)
> "Software entities should be open for extension, but closed for modification."

Existing, tested code should not need to be changed to accommodate new features. New behavior should be added by extending the system, not modifying it.

**Implementation:** Use inheritance, interfaces, or composition to add behavior without touching existing code.

### L — Liskov Substitution Principle (LSP)
> "Objects of a subtype must be substitutable for objects of the supertype without altering the correctness of the program."

If `Dog extends Animal`, then any code that works with `Animal` must also work correctly with `Dog`. Subclasses must not violate the contract of the parent class.

**Violation:** A `Square extends Rectangle` where setting width also sets height — violates the rectangle contract.

### I — Interface Segregation Principle (ISP)
> "No client should be forced to depend on methods it does not use."

Prefer many small, specific interfaces over one large, general-purpose interface. Classes should not be forced to implement methods they don't need.

### D — Dependency Inversion Principle (DIP)
> "Depend on abstractions, not concretions."

High-level modules should not depend directly on low-level modules. Both should depend on abstractions (interfaces). This decouples components and enables testing with mocks.

---

## 6. Design Patterns (Gang of Four)

Design patterns are reusable solutions to recurring design problems. The Gang of Four (GoF) catalog (Gamma, Helm, Johnson, Vlissides, 1994) defines 23 patterns in three categories.

### Creational Patterns (object creation)

| Pattern | Purpose | IT Education Relevance |
| :--- | :--- | :--- |
| **Singleton** | Ensure only one instance | Database connections; configuration |
| **Factory Method** | Delegate instantiation to subclasses | Plugin systems; framework hooks |
| **Builder** | Construct complex objects step-by-step | Query builders; configuration objects |

### Structural Patterns (object composition)

| Pattern | Purpose | IT Education Relevance |
| :--- | :--- | :--- |
| **Adapter** | Convert interface of a class to another interface | API wrappers; third-party integrations |
| **Decorator** | Add behavior to objects without modifying class | Middleware pipelines (Express.js); HOCs in React |
| **Facade** | Provide a simplified interface to a subsystem | SDK wrappers; service classes |

### Behavioral Patterns (object communication)

| Pattern | Purpose | IT Education Relevance |
| :--- | :--- | :--- |
| **Observer** | One-to-many dependency; event system | DOM events; Pub/Sub; RxJS |
| **Strategy** | Define a family of algorithms; make them interchangeable | Sorting strategies; authentication methods |
| **Command** | Encapsulate a request as an object | Undo/redo; command queues; CLI handlers |

---

## 7. Clean Code Heuristics (Martin)

From Robert C. Martin's *Clean Code* (2008), a set of practical micro-level design rules:

| Heuristic | Rule |
| :--- | :--- |
| **Naming** | Use intention-revealing names. Never abbreviate unless universally understood. |
| **Functions** | Functions should do one thing. They should do it well. They should do it only. |
| **Function length** | Functions should rarely exceed 20 lines. |
| **Comments** | Comments compensate for failure to express in code. Code should be self-documenting. |
| **Error handling** | Error handling is one thing — don't mix it with business logic. |
| **Boundaries** | Isolate third-party code behind interfaces you own. |

---

## Teaching Software Engineering Principles

These principles are best taught through:

1. **Code review exercises**: Present code that violates a principle; ask learners to identify and fix it
2. **Refactoring katas**: Start with "bad" code and progressively apply principles
3. **Anti-pattern recognition**: Name and explain the *violation* (God Object, Spaghetti Code, Shotgun Surgery) before the principle
4. **Historical post-mortems**: Real-world examples of failures caused by violation (not theoretical)

> **💡 Tip:** Teach SOLID principles in order of immediacy: SRP first (most immediately applicable), then OCP, then the rest. DIP is the most abstract and should be introduced only when dependency injection and testing are in scope.

---

## Key Takeaways

- Software engineering principles are learned through practice, not definition-memorization.
- DRY, YAGNI, and KISS form the foundation; SOLID builds on them for OOP contexts.
- Design patterns are vocabulary for design conversations — they only make sense when learners have encountered the problem the pattern solves.
- Separation of concerns is the meta-principle from which most others derive.
- Clean code is a professional responsibility: code is read far more often than it is written.
