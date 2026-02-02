# Open Sports Scheduling Standard (OSSS)

**A neutral, open standard for expressing sports schedules, constraints, and optimization goals.**

The **Open Sports Scheduling Standard (OSSS)** defines a shared, machine-readable language for describing sports scheduling problems and solutions — including teams, venues, fixtures, officials, resources, hard and soft constraints, optimization objectives, and explainable outcomes. OSSS applies to traditional sports, esports tournaments, knockout brackets, and any competitive scheduling scenario.

OSSS is **vendor-neutral**, **solver-agnostic**, and **openly governed**.

> **Version 2.0** — Now with official scheduling, resource-level venue management, knockout tournament support, and 50+ constraints.

---

## Why OSSS exists

Sports scheduling is one of the most complex operational problems in traditional sports and esports.
Yet today:

- Scheduling rules are encoded privately inside vendor systems
- Constraints are implicit, undocumented, or non-portable
- Leagues and tournament organizers cannot easily audit or explain schedules
- Switching vendors requires rebuilding rules from scratch
- AI and optimization research cannot compare solutions fairly
- Esports face unique challenges: global time zones, server latency, viewership optimization

**OSSS fixes this by standardizing the problem, not the solver.**

---

## What OSSS does

OSSS defines:

- A common data model for teams, venues (physical and virtual), fixtures, officials, and resources
- **Official/referee scheduling** with availability, qualifications, and conflict-of-interest rules
- **Resource-level venue management** for multi-court/multi-field facilities
- **Knockout tournament support** with fixture dependencies and bracket seeding
- Explicit hard and soft constraints (50+ in registry, including esports-specific: latency, regional balance)
- Standardized objective and penalty models (linear, quadratic, exponential, logarithmic, step, piecewise)
- Explainable scoring and violation reporting
- Support for leagues, tournaments, playoffs, rescheduling, and global esports events
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

### Leagues, Governing Bodies & Tournament Organizers
- Transparent and auditable schedules (traditional sports and esports)
- Reduced vendor lock-in
- Clear codification of policies and rules
- Fair competitive integrity across regions and time zones

### Scheduling Vendors
- Faster integrations
- One constraint language across sports and esports
- Competition on quality, not lock-in

### Researchers & AI Developers
- Shared benchmarks (including esports datasets)
- Comparable solver results
- Real-world constraint modeling across physical and virtual competitions

### Operators, Officials & Esports Coordinators
- Clear trade-offs
- Fewer manual overrides
- Improved trust in outcomes
- Server selection and regional fairness transparency

---

## Governance & neutrality

OSSS is governed openly and independently.

- Public specification
- Open RFC and issue process
- Vendor-neutral governance
- Patent non-assertion pledge

SCORE is a founding contributor, but OSSS is **not owned or controlled by SCORE or any commercial entity**.

See: [`ODDD-CHARTER.md`](./OSSS-CHARTER.md)

---

## Repository structure

```
open-sports-scheduling/
  schemas/                    JSON schemas (osss-core, results, constraints, objectives, etc.)
  registry/
    constraints.json          Canonical constraint rules (50+ rules, v3.0.0)
    objectives.json           Canonical objective metrics (35 metrics, v3.0.0)
  examples/
    youth-league/             Minimal 2-team example
    amateur-league/           3-team regional league
    pro-league/               Full-featured professional league
    esports-tournament/       Esports with latency/server constraints
    american-football/        NFL-style scheduling
    basketball-5on5/          EuroLeague-style
    cricket-t20/              IPL-style T20 league
    ice-hockey/               NHL-style dense schedule
    rugby-union-15s/          Six Nations-style
    scottish-premiership/     Split-season format with complex phases
    surfing/                  Weather-dependent waiting period format
    tennis-singles/           Multi-court tournament
    volleyball-indoor/        Indoor league
    carry-over-fairness/      NP-hard carry-over balancing benchmark
    complex-multi-phase/      Group stage → knockout with dependencies
    venue-sharing-conflict/   Tight venue constraints benchmark
  osss-validator/             Reference validator CLI (see osss-validator/README.md)
  profiles/                   Constraint profiles (baseline, youth, amateur, pro)
  conformance/                Must-pass / must-fail conformance tests
  competition/                OSSS Scheduling Challenge framework
  specs/                      Technical specifications
  procurement/                Enterprise procurement resources
```

## Quick start

```bash
cd osss-validator && npm install && npm link
cd ..

# Validate an instance
osss-validate instance \
  --instance ./examples/youth-league/osss-instance.json \
  --schemas ./schemas \
  --registry ./registry

# Validate all examples
osss-validate bundle \
  --examples ./examples \
  --schemas ./schemas \
  --registry ./registry
```

See [`osss-validator/README.md`](./osss-validator/README.md) for full CLI documentation.

---

## Status

- Version: **v2.0**
- All 60 tests passing, 16 examples validating
- Full backwards compatibility with v1 instances
- Public review phase

### What's New in v2.0

| Feature | Description |
|---------|-------------|
| **Official Scheduling** | Availability, qualifications, conflicts, rest time for referees |
| **Resource Management** | Multi-court/multi-field venue scheduling |
| **Knockout Tournaments** | Fixture dependencies, bracket seeding, winner/loser propagation |
| **Enhanced Penalties** | Exponential, logarithmic, step, piecewise, lexicographic models |
| **9 New Constraints** | Officials, resources, tournament structure |
| **5 New Objectives** | Utilization tracking, constraint satisfaction metrics |

---

## Licensing

- Specification: **CC-BY-4.0**
- Schemas & reference code: **Apache-2.0**

---

**Sports scheduling should be transparent, portable, and fair.**

