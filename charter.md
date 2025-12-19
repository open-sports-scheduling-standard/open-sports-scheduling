1. Mission
The Open Sports Scheduling Standard (OSSS) exists to define and steward a neutral, open, and interoperable standard for expressing sports scheduling problems and solutions, including:

Teams, venues, timeslots, and resources
Hard and soft constraints
Optimization objectives and fairness criteria
Explainable scoring and auditability of schedules
OSSS enables leagues, vendors, researchers, and governing bodies to exchange scheduling data and solutions without vendor lock-in, while encouraging innovation and competition among scheduling engines.

2. Problem Statement
Sports scheduling is a universal operational challenge across amateur, collegiate, professional, and international sport. Today:

Scheduling rules are encoded privately inside vendor-specific systems

Constraints are undocumented, implicit, or non-portable

Leagues cannot easily audit, compare, or replace scheduling solutions

AI-based solvers cannot compete fairly due to incompatible inputs and outputs

The absence of a shared standard increases cost, reduces transparency, and limits innovation.

3. Scope
OSSS defines what a sports scheduling problem and solution look like — not how they are solved.

In Scope
Data models for competitions, fixtures, teams, venues, officials, and resources
Declarative constraint definitions (hard and soft)
Objective and penalty models
Schedule outputs and explainability reports
Versioning, locking, and rescheduling semantics
Out of Scope
—
Prescribing algorithms or solver implementations
—
UI/UX requirements
—
Commercial terms or licensing of implementations
4. Principles
OSSS is governed by the following principles:

01
Neutrality
OSSS is vendor-neutral and not controlled by any single company or platform.

02
Solver Agnosticism
The standard must support constraint programming, MILP, heuristics, AI/ML, and human-driven scheduling.

03
Declarative Design
Rules express intent and constraints, not procedural logic.

04
Explainability
Every compliant schedule must be auditable and explainable.

05
Interoperability First
Any compliant implementation must be able to consume OSSS inputs and validate OSSS outputs.

06
Extensibility Without Fragmentation
Extensions are permitted but must be namespaced and non-breaking.

5. Deliverables
The OSSS Working Group maintains the following artifacts:

OSSS Core Specification
Constraint & Objective Registry
JSON Schema Definitions
Reference Examples and Test Cases
Compliance Levels and Validation Rules
Optional reference implementations may be published but are not normative.

6. Governance
6.1 Roles
Founding Stewards
Recognized leaders who guide the initial scope, neutrality, and ratification of OSSS v1. No operational or commercial obligations.

Standards Council
Maintainers responsible for approving changes, managing releases, and resolving disputes.

Contributors
Any individual or organization submitting issues, proposals, or code under the OSSS license.

6.2 Decision Making
OSSS follows lazy consensus by default

Significant changes require:

Public RFC
Review period
Explicit approval by the Standards Council
Silence after the review period implies consent.

7. Intellectual Property & Licensing
Specification

CC-BY-4.0

Schemas & Reference Code

Apache License 2.0

Patent Non-Assertion
All contributors agree not to assert patent claims against any implementation of the OSSS specification.

8. Relationship to Vendors and Platforms
Organizations may:
Implement OSSS
Extend OSSS via namespaced rules
Offer commercial products and services built on OSSS
No vendor may:
✕
Claim exclusive ownership of the standard
✕
Require OSSS adoption to use proprietary products
✕
Introduce incompatible forks under the OSSS name
9. Compliance and Conformance
OSSS defines graduated compliance levels to enable adoption at different levels of complexity:

Level 1
Core Feasibility
Basic schedule validity and hard constraint satisfaction

Level 2
Travel, Fairness, and Optimization
Soft constraints, penalties, and optimization objectives

Level 3
Broadcast, Officials, and Pro Operations
Full professional-grade scheduling capabilities

Compliance claims must specify the supported level(s).

10. Transparency
All OSSS work is conducted in public, including:

Repositories
Issue tracking
RFC discussions
Release notes
11. Amendments
This Charter may be amended by:

1
Public proposal
2
Review period
3
Approval by the Standards Council
Amendments must preserve OSSS neutrality and openness.

12. Founding Statement
"OSSS is founded on the belief that sports scheduling should be transparent, portable, and fair—and that open standards enable better outcomes for leagues, athletes, officials, fans, and technology providers alike."
End of Charter
