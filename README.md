# Open Sports Scheduling Standard (OSSS)

**A neutral, open standard for expressing sports schedules, constraints, and optimization goals.**

The **Open Sports Scheduling Standard (OSSS)** defines a shared, machine-readable language for describing sports scheduling problems and solutions — including teams, venues, fixtures, hard and soft constraints, optimization objectives, and explainable outcomes.

OSSS is **vendor-neutral**, **solver-agnostic**, and **openly governed**.

---

## Why OSSS exists

Sports scheduling is one of the most complex operational problems in sport.  
Yet today:

- Scheduling rules are encoded privately inside vendor systems
- Constraints are implicit, undocumented, or non-portable
- Leagues cannot easily audit or explain schedules
- Switching vendors requires rebuilding rules from scratch
- AI and optimization research cannot compare solutions fairly

**OSSS fixes this by standardizing the problem, not the solver.**

---

## What OSSS does

OSSS defines:

- A common data model for teams, venues, fixtures, officials, and resources
- Explicit hard and soft constraints
- Standardized objective and penalty models
- Explainable scoring and violation reporting
- Support for leagues, tournaments, playoffs, and rescheduling
- Versioning, locks, and real-world change management

Any compliant scheduling engine can:
- Consume OSSS inputs
- Produce OSSS-compliant schedules
- Be audited using OSSS rules

---

## What OSSS does *not* do

- ❌ It does not prescribe algorithms
- ❌ It does not replace scheduling vendors
- ❌ It does not dictate UI or workflows
- ❌ It does not lock leagues into any platform

Innovation happens **above** the standard, not inside it.

---

## Who OSSS is for

### Leagues & Governing Bodies
- Transparent and auditable schedules
- Reduced vendor lock-in
- Clear codification of policies and rules

### Scheduling Vendors
- Faster integrations
- One constraint language across leagues
- Competition on quality, not lock-in

### Researchers & AI Developers
- Shared benchmarks
- Comparable solver results
- Real-world constraint modeling

### Operators & Officials
- Clear trade-offs
- Fewer manual overrides
- Improved trust in outcomes

---

## Governance & neutrality

OSSS is governed openly and independently.

- Public specification
- Open RFC and issue process
- Vendor-neutral governance
- Patent non-assertion pledge

SCORE is a founding contributor, but OSSS is **not owned or controlled by SCORE or any commercial entity**.

See: [`CHARTER.md`](./CHARTER.md)

---

## Repository structure

This repository contains the OSSS specifications, schemas, and registries.


---

## Status

- Version: **v0.1 (Draft)**
- Public review phase
- Founding Stewards being appointed

---

## Licensing

- Specification: **CC-BY-4.0**
- Schemas & reference code: **Apache-2.0**

---

**Sports scheduling should be transparent, portable, and fair.**

