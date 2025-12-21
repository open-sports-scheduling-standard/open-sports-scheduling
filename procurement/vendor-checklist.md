# OSSS Vendor Compliance Checklist

**Self-assessment tool for scheduling vendors and solution providers**

Version: 0.1-draft
Last Updated: 2025-01-01

---

## Purpose

This checklist helps scheduling vendors and solution providers:
- Self-assess OSSS compliance status
- Identify implementation gaps
- Plan feature development roadmap
- Respond to RFP requirements
- Demonstrate compliance to customers

---

## How to Use This Checklist

1. **Check applicable items** as you complete them
2. **Note version implemented** where requested
3. **Document limitations** in the notes section
4. **Track progress** toward target compliance level
5. **Update regularly** as your implementation evolves

---

## Compliance Levels

- **Level 1:** Basic Compliance (Minimum viable)
- **Level 2:** Standard Compliance (Recommended for most leagues)
- **Level 3:** Advanced Compliance (Complex leagues and competitions)
- **Level 4:** Research-Grade (Benchmarks and competitions)

---

## Level 1: Basic Compliance

### Input/Output Formats

- [ ] **Accept OSSS instance files**
  - Schema: `osss-core.schema.json`
  - File format: `osss-instance.json`
  - Validation: Passes JSON Schema validation
  - OSSS version supported: _______________

- [ ] **Produce OSSS result files**
  - Schema: `osss-results.schema.json`
  - File format: `osss-results.json`
  - Validation: Passes JSON Schema validation
  - OSSS version supported: _______________

- [ ] **Schema validation**
  - Validate inputs before processing
  - Reject invalid inputs with clear error messages
  - Include schema version in outputs

### Core Constraints (Hard)

- [ ] **no_overlap_team**
  - Teams cannot play multiple fixtures simultaneously
  - Proper violation detection
  - Tested with: _____ fixtures

- [ ] **no_overlap_venue_resource**
  - Venue resources cannot host multiple fixtures simultaneously
  - Proper violation detection
  - Tested with: _____ venues, _____ resources

- [ ] **min_rest_time**
  - Enforces minimum rest between team fixtures
  - Configurable rest period (hours)
  - Handles timezone-aware calculations

### Conformance Testing

- [ ] **Must-pass tests**
  - All tests in `/conformance/must-pass/` succeed
  - Number passing: _____ of 4

- [ ] **Must-fail tests**
  - All tests in `/conformance/must-fail/` correctly rejected
  - Number correctly failing: _____ of 4

- [ ] **Validation reports**
  - Generate validation report for each run
  - Include: errors, warnings, statistics

### Documentation

- [ ] **Implementation guide**
  - Document OSSS support
  - Include examples
  - API reference (if applicable)

- [ ] **Supported features list**
  - List all implemented constraints
  - List all implemented objectives
  - Document any limitations

- [ ] **Sample files**
  - Provide at least 2 valid OSSS instance examples
  - Provide corresponding result files
  - Include validation reports

**Level 1 Score:** _____ of 11 items complete

---

## Level 2: Standard Compliance

*All Level 1 items plus:*

### Constraint Profiles

- [ ] **Baseline profile support**
  - Load and apply `/profiles/baseline.json`
  - All constraints in profile implemented
  - Tested successfully: Yes / No

- [ ] **Youth profile support**
  - Load and apply `/profiles/youth.json`
  - All constraints in profile implemented
  - Tested successfully: Yes / No

- [ ] **Amateur profile support**
  - Load and apply `/profiles/amateur.json`
  - All constraints in profile implemented
  - Tested successfully: Yes / No

- [ ] **Professional profile support**
  - Load and apply `/profiles/pro.json`
  - All constraints in profile implemented
  - Tested successfully: Yes / No

### Soft Constraints & Penalties

- [ ] **Soft constraint support**
  - Implement soft constraints from registry
  - Number of soft constraints implemented: _____
  - Penalty calculation: Linear / Quadratic / Exponential / Custom

- [ ] **Configurable penalties**
  - Penalty weights configurable per constraint
  - Support penalty models from registry
  - Penalty aggregation: Sum / Max / Other: _____

### Violation Reporting

- [ ] **Structured violation output**
  - violations array in results
  - Include: constraintId, fixtureIds, severity, message
  - Tested with invalid schedules

- [ ] **Human-readable explanations**
  - Convert violation codes to readable messages
  - Include relevant context (team names, times, venues)
  - Support multiple languages: _______________

- [ ] **Violation severity levels**
  - Hard violations clearly marked
  - Soft violations include penalty value
  - Summary statistics (total violations, by type)

### Objective Functions

- [ ] **Calculate standard objectives**
  - Objectives from `registry/objectives.json`
  - Number implemented: _____ of 13
  - List implemented: _________________________________

- [ ] **Weighted objective aggregation**
  - Support user-defined objective weights
  - Calculate composite score
  - Include in results output

- [ ] **Objective reporting**
  - results.objectives array populated
  - Include: objectiveId, value, weight, description
  - Per-team breakdowns where applicable

### Result Attestation

- [ ] **Instance hashing**
  - Generate SHA-256 hash of instance
  - Include in results.attestation.instanceHash

- [ ] **Result hashing**
  - Generate SHA-256 hash of result
  - Include in results.attestation.resultHash

- [ ] **Ruleset hashing**
  - Generate SHA-256 hash of constraints + objectives
  - Include in results.attestation.rulesetHash

- [ ] **Validator metadata**
  - Include validator name, version
  - Include timestamp, runtime
  - Include environment info (optional)

- [ ] **Verification support**
  - Provide verification tool/script
  - Allow independent hash recomputation
  - Document verification process

**Level 2 Score:** _____ of 18 items complete (plus Level 1)

---

## Level 3: Advanced Compliance

*All Level 2 items plus:*

### Selector DSL v2

- [ ] **Boolean logic selectors**
  - allOf (AND)
  - anyOf (OR)
  - not (NOT)
  - Nested combinations

- [ ] **Temporal selectors**
  - dateRange
  - dayOfWeek
  - phase
  - round

- [ ] **Team selectors**
  - division
  - ageGroup
  - role (home/away)
  - teamId

- [ ] **Venue selectors**
  - venueType
  - capacity (min/max ranges)
  - venueId
  - resourceType

- [ ] **Complex selector testing**
  - Tested with 10+ selector combinations
  - Handles edge cases correctly
  - Documentation with examples

### Venue Resources & Availability

- [ ] **Multi-resource venues**
  - Support venues with multiple resources
  - Resource types: field, court, pitch, arena, track, pool, rink, other
  - Tested with: _____ multi-resource venues

- [ ] **Availability windows**
  - Date ranges
  - Recurring patterns (daily/weekly/monthly)
  - Priority levels
  - Cost per window

- [ ] **Changeover time**
  - Venue-level changeover time
  - Resource-level changeover time
  - Enforced between fixtures

- [ ] **Operational constraints**
  - maxFixturesPerDay
  - maxConsecutiveHours
  - requiredGapHours

- [ ] **Preferred venues**
  - Team home venue preferences
  - Respect preferences where possible
  - Report when preferences violated

### Custom Constraints

- [ ] **Custom constraint definition**
  - Allow leagues to define custom constraints
  - Plugin/extension mechanism
  - JSON-based or code-based: _____

- [ ] **Custom parameters**
  - Support custom constraint parameters
  - Parameter validation
  - Documentation generation

- [ ] **Custom penalty functions**
  - User-defined penalty calculation
  - Standard penalty models available
  - Tested with: _____ custom constraints

### Explainability

- [ ] **Decision explanations**
  - Explain why fixture was scheduled at specific time
  - Explain constraint trade-offs
  - Interactive query capability

- [ ] **What-if analysis**
  - Simulate fixture changes
  - Show impact on constraints/objectives
  - Rollback capability

- [ ] **Export formats**
  - JSON (standard)
  - CSV
  - PDF/HTML (human-readable)
  - Other: _____

**Level 3 Score:** _____ of 21 items complete (plus Levels 1-2)

---

## Level 4: Research-Grade Compliance

*All Level 3 items plus:*

### Competition Support

- [ ] **Competition attestation format**
  - Generate competition-ready attestations
  - Include all required metadata
  - Follow competition submission format

- [ ] **Reproducible results**
  - Deterministic solver (or seeded random)
  - Same input always produces same output
  - Document any non-determinism

- [ ] **Benchmark participation**
  - Tested against OSSS benchmark instances
  - Performance metrics documented
  - Results comparable to other solvers

### Dataset Tools

- [ ] **Anonymization support**
  - Can export anonymized instances
  - PII removal
  - Location fuzzing
  - Tested with real data

- [ ] **Dataset contribution**
  - Can generate synthetic instances
  - Can export instances for public use
  - Follow dataset contribution guidelines

### Research Features

- [ ] **Multi-objective optimization**
  - Pareto front generation
  - Lexicographic optimization
  - Max/min aggregation modes

- [ ] **Sensitivity analysis**
  - Parameter sensitivity testing
  - Constraint importance ranking
  - What-if bulk scenarios

- [ ] **Solver metadata**
  - Algorithm class documented (MILP, CP-SAT, heuristic, etc.)
  - Runtime performance metrics
  - Hardware requirements documented

### Open Source & Community

- [ ] **Public examples**
  - Public case studies
  - Sample implementations
  - Contribution to OSSS examples

- [ ] **Community participation**
  - Active in OSSS discussions
  - Issue reporting/fixing
  - RFC/proposal participation

- [ ] **Documentation**
  - Research paper references
  - Algorithm documentation
  - Performance benchmarks published

**Level 4 Score:** _____ of 12 items complete (plus Levels 1-3)

---

## Overall Summary

| Level | Items Complete | Status |
|-------|----------------|--------|
| Level 1: Basic | _____ / 11 | Complete / In Progress / Not Started |
| Level 2: Standard | _____ / 18 | Complete / In Progress / Not Started |
| Level 3: Advanced | _____ / 21 | Complete / In Progress / Not Started |
| Level 4: Research-Grade | _____ / 12 | Complete / In Progress / Not Started |

**Target Compliance Level:** _____
**Current Compliance Level:** _____
**Estimated completion date:** _____

---

## Implementation Notes

### Known Limitations

*Document any known limitations, partial implementations, or deviations from OSSS spec:*

1. _______________________________________________________
2. _______________________________________________________
3. _______________________________________________________

### Planned Features

*List features planned for future releases:*

| Feature | Target Date | Priority |
|---------|-------------|----------|
|         |             |          |
|         |             |          |
|         |             |          |

### Dependencies

*External dependencies required for OSSS support:*

- _______________________________________________________
- _______________________________________________________

---

## Testing Evidence

### Conformance Test Results

```
Date run: _____
OSSS version: _____
Must-pass results: _____ / 4 passing
Must-fail results: _____ / 4 correctly failing

Attach conformance test output: [link or attach file]
```

### Sample Files

*Attach or link to sample OSSS files demonstrating compliance:*

1. **Simple instance:** _____
2. **Medium instance:** _____
3. **Complex instance:** _____

### Validation Reports

*Attach validation reports for sample files:*

- _______________________________________________________

---

## RFP Response Summary

### For Procurement Teams

**Vendor Name:** _____________________
**Product Name:** _____________________
**OSSS Compliance Level:** _____
**OSSS Version Supported:** _____

**Compliance Statement:**

```
We certify that [PRODUCT NAME] meets OSSS Compliance Level [X] as documented in this checklist. All required features are implemented and tested. Conformance test results are attached. We commit to maintaining compliance with OSSS [VERSION] throughout the contract term.
```

**Signature:** _____________________
**Date:** _____________________
**Title:** _____________________

---

## Appendix: Constraint Coverage Matrix

### Required Constraints (from registry/constraints.json)

| Constraint ID | Implemented | Tested | Notes |
|---------------|-------------|--------|-------|
| no_overlap_team | ☐ Yes ☐ No | ☐ Yes ☐ No | |
| no_overlap_venue_resource | ☐ Yes ☐ No | ☐ Yes ☐ No | |
| min_rest_time | ☐ Yes ☐ No | ☐ Yes ☐ No | |
| max_consecutive_fixtures | ☐ Yes ☐ No | ☐ Yes ☐ No | |
| home_away_pattern | ☐ Yes ☐ No | ☐ Yes ☐ No | |
| max_home_streak | ☐ Yes ☐ No | ☐ Yes ☐ No | |
| max_away_streak | ☐ Yes ☐ No | ☐ Yes ☐ No | |
| travel_distance_limit | ☐ Yes ☐ No | ☐ Yes ☐ No | |
| blackout_window | ☐ Yes ☐ No | ☐ Yes ☐ No | |
| preferred_time_window | ☐ Yes ☐ No | ☐ Yes ☐ No | |

*Add additional constraints as needed*

---

## Appendix: Objective Coverage Matrix

### Standard Objectives (from registry/objectives.json)

| Objective ID | Implemented | Tested | Notes |
|--------------|-------------|--------|-------|
| total_travel_distance | ☐ Yes ☐ No | ☐ Yes ☐ No | |
| max_team_travel | ☐ Yes ☐ No | ☐ Yes ☐ No | |
| travel_balance | ☐ Yes ☐ No | ☐ Yes ☐ No | |
| home_away_balance | ☐ Yes ☐ No | ☐ Yes ☐ No | |
| home_streak_length | ☐ Yes ☐ No | ☐ Yes ☐ No | |
| primetime_distribution | ☐ Yes ☐ No | ☐ Yes ☐ No | |
| rest_time_average | ☐ Yes ☐ No | ☐ Yes ☐ No | |
| min_rest_time | ☐ Yes ☐ No | ☐ Yes ☐ No | |
| venue_utilization | ☐ Yes ☐ No | ☐ Yes ☐ No | |
| venue_balance | ☐ Yes ☐ No | ☐ Yes ☐ No | |
| schedule_compactness | ☐ Yes ☐ No | ☐ Yes ☐ No | |
| opponent_variety | ☐ Yes ☐ No | ☐ Yes ☐ No | |
| schedule_stability | ☐ Yes ☐ No | ☐ Yes ☐ No | |

---

## Resources & Support

- **OSSS Repository:** https://github.com/[osss-org]/open-sports-scheduling
- **Conformance Suite:** `/conformance/`
- **Sample Profiles:** `/profiles/`
- **Documentation:** `/specs/`
- **Registry:** `/registry/`

---

## Feedback & Updates

This checklist is maintained as part of OSSS.

**Submit feedback:**
- GitHub Issues
- Discussions
- Email: [TBD]

**Version History:**
- v0.1-draft (2025-01-01): Initial release

---

## License

Apache-2.0 - Use and modify freely

---

**Use this checklist to demonstrate your commitment to open, transparent, and portable scheduling solutions.**
