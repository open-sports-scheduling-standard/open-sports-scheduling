# OSSS Standards: Naming Conventions & Structural Consistency

**Status:** Normative  
**Applies to:** OSSS specifications, schemas, registries, instances, results, validators, plugins  
**Audience:** Solver authors, platform vendors, league operators, contributors  

This document defines **mandatory and recommended naming conventions** across the OSSS ecosystem to ensure:
- consistency
- machine readability
- long-term stability
- vendor neutrality
- zero ambiguity in competitions and procurement

---

## 1. Core Design Principles

All naming in OSSS MUST adhere to the following principles:

1. **Stability over convenience**  
   Names MUST be designed to survive years of use.

2. **Explicit over implicit**  
   Avoid overloaded or context-dependent names.

3. **Human-readable but machine-safe**  
   Names MUST be readable without sacrificing parseability.

4. **Globally unique where required**  
   Identifiers MUST NOT rely on local context to be unique.

5. **No semantic drift**  
   Once a name is published, its meaning MUST NOT change.

---

## 2. Identifier Formats (REQUIRED)

### 2.1 General Identifier Rules
All identifiers (`id`, `rule`, `constraintId`, etc.) MUST:
- be lowercase
- use `snake_case`
- contain only: `a–z`, `0–9`, `_`
- start with a letter
- be immutable once published

✅ Valid:
```text
no_overlap_team
min_rest_72h
home_away_balance
````

❌ Invalid:

```text
NoOverlapTeam
min-rest-72h
homeAwayBalance
```

---

## 3. Rule Identifiers (`rule`)

### 3.1 Rule Naming Structure

Rule IDs MUST follow this pattern:

```
<domain>_<behavior>[_qualifier]
```

Examples:

* `no_overlap_team`
* `min_rest_time`
* `home_away_balance`
* `broadcast_window`
* `opponent_spacing`

### 3.2 Rule ID Stability

* Rule IDs MUST NEVER be reused
* Deprecated rules MUST remain resolvable
* Replacement rules MUST use a new ID

---

## 4. Constraint Identifiers (`constraint.id`)

### 4.1 Constraint IDs vs Rule IDs

* `rule` identifies *what logic runs*
* `constraint.id` identifies *this specific application*

Constraint IDs MAY include parameters:

```text
min_rest_72h
max_travel_500km
home_away_balance
```

### 4.2 Constraint ID Rules

* MUST be unique within an OSSS instance
* MUST be descriptive
* SHOULD encode key parameters if meaningful

---

## 5. Entity Identifiers (`teams`, `venues`, etc.)

### 5.1 Entity ID Rules

Entity IDs MUST:

* be unique within their entity type
* be stable across seasons where possible
* avoid embedding names that may change

Examples:

```json
{ "id": "afc_1", "name": "Amateur FC 1" }
{ "id": "stadium_north", "name": "North Stadium" }
```

### 5.2 Cross-Reference Safety

Entity IDs MUST be globally unique **within the instance** when referenced by:

* fixtures
* assignments
* constraints
* selectors

---

## 6. Fixture Identifiers (`fixtures[].id`)

### 6.1 Fixture ID Rules

Fixture IDs MUST:

* be unique per instance
* remain stable across re-optimizations
* NOT encode time or venue

Examples:

```text
round1_match1
week3_feature_game
playoff_semifinal_2
```

---

## 7. Selector Naming & Semantics

### 7.1 Selector Fields

Selector keys MUST use `camelCase` (JSON field standard):

```json
{
  "entityType": "team",
  "tags": ["u13", "girls"]
}
```

### 7.2 Selector Semantics

* Selectors MUST be **pure filters**
* Selectors MUST NOT encode behavior
* All logic lives in the rule, not the selector

---

## 8. Parameter Naming (`params`)

### 8.1 Parameter Rules

Parameters MUST:

* use `snake_case`
* include units where applicable
* be numeric or boolean when possible

Examples:

```json
{ "min_hours": 72 }
{ "max_km": 500 }
{ "max_games_per_day": 2 }
```

❌ Avoid:

```json
{ "time": "3 days" }
{ "distance": "far" }
```

---

## 9. Penalty Models & Fields

### 9.1 Penalty Model Naming

Penalty models MUST use fixed identifiers:

* `linear`
* `quadratic`
* `piecewise`
* `lexicographic`

No custom strings allowed.

### 9.2 Penalty Fields

Penalty definitions MUST use:

```json
{
  "model": "piecewise",
  "tiers": [
    { "upTo": 1, "weight": 10 },
    { "upTo": 3, "weight": 25 },
    { "above": 3, "weight": 50 }
  ]
}
```

Field names:

* `model` → camelCase
* `upTo`, `above` → camelCase
* `weight` → numeric

---

## 10. Result Object Naming (`osss-results.json`)

### 10.1 Result Fields

Top-level result fields are fixed:

* `feasible`
* `assignments`
* `scores`

### 10.2 Score Fields

Score entries MUST include:

```json
{
  "constraintId": "home_away_balance",
  "violations": 1,
  "penalty": 50,
  "explanation": "Team AFC-2 has 2 more away games than home"
}
```

Field naming:

* `constraintId` → camelCase (reference)
* `violations` → integer
* `penalty` → numeric (unitless score)

---

## 11. Objective Naming

### 11.1 Metric Names

Objective metrics MUST:

* be lowercase
* use snake_case
* describe measurable quantities

Examples:

```text
travel_distance_km
home_away_delta
rest_violation_count
prime_time_utilization
```

### 11.2 Aggregation Names

Allowed values:

* `sum`
* `max`
* `min`
* `average`
* `p95`
* `minimax`

No custom aggregations without registry entry.

---

## 12. Registry Naming Standards

### 12.1 Registry File Names

Registry files MUST be named:

```text
constraints.json
objectives.json
profiles.json
```

### 12.2 Registry Entry IDs

Registry IDs MUST match the corresponding:

* rule IDs
* metric IDs

Registry entries MUST NOT redefine semantics.

---

## 13. Plugin Naming & File Structure

### 13.1 Rule Plugin Files

Rule plugins MUST be named:

```
src/rules/{hard|soft}/<rule_id>.js
```

Example:

```
src/rules/hard/no_overlap_team.js
src/rules/soft/home_away_balance.js
```

### 13.2 Export Contract

Plugins MUST export:

* `meta`
* `evaluate({ constraint, idx })`

---

## 14. Versioning & Compatibility

### 14.1 Version Fields

Where versioning is required:

* use semantic versioning (`MAJOR.MINOR.PATCH`)
* include explicit version fields, never implicit

### 14.2 Backward Compatibility

* New fields MUST be additive
* Removed fields MUST remain readable
* Renames MUST be handled via aliasing

---

## 15. Reserved Prefixes & Fields

### 15.1 Reserved Prefixes

The following prefixes are reserved and MUST NOT be used by user extensions:

* `_osss_`
* `_validated_`
* `_internal_`

### 15.2 Validator Metadata

Validator-added fields MUST start with `_`:

```json
"_validatedBy": "osss-validator",
"_validatedAt": "2025-02-01T12:00:00Z"
```

---

## 16. Anti-Patterns (DO NOT DO)

❌ Encoding logic in IDs
❌ Using natural language in parameters
❌ Overloading rule names
❌ Changing rule semantics without a new ID
❌ Using uppercase or mixed-case IDs

---

## 17. Compliance Statement

An OSSS-compliant system MUST:

* follow all REQUIRED naming rules
* emit errors on invalid identifiers
* preserve identifier stability across versions

---

## 18. Closing Principle

> **Names are part of the contract.**

If names drift, standards fail.

OSSS treats naming as a **first-class guarantee**, not a cosmetic choice.

---

## Appendix A — Quick Reference

| Element        | Case       | Format        |
| -------------- | ---------- | ------------- |
| rule IDs       | snake_case | lowercase     |
| constraint IDs | snake_case | lowercase     |
| entity IDs     | snake_case | lowercase     |
| params         | snake_case | include units |
| selectors      | camelCase  | JSON standard |
| result fields  | camelCase  | fixed         |
| registry IDs   | snake_case | immutable     |

---

End of OSSS Naming & Conventions Standard

```

