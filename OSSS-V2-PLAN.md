# OSSS v2.0 - Standards Evolution Plan

## Executive Summary

Based on comprehensive audits of the OSSS schemas, registry, validator implementation, and example instances, this document outlines the changes needed for OSSS v2.0. The audit identified **31 schema/registry issues**, **18 validator implementation issues**, and **significant gaps in example coverage**.

---

## Part 1: Critical Issues to Fix

### 1.1 Schema Issues

| Issue | Severity | Fix |
|-------|----------|-----|
| Fixture participants allow duplicate roles (home/home) | CRITICAL | Add validation for complementary roles |
| Season dates have no format validation | CRITICAL | Enforce ISO 8601 with timezone |
| Venue location missing range validation | SIGNIFICANT | Add lat/lon bounds (-90/90, -180/180) |
| Missing `sport` field at root | SIGNIFICANT | Add required sport enum |
| Missing `blackoutDates` in season | SIGNIFICANT | Add to season object |
| Assignment missing `resourceId` | CRITICAL | Add for multi-resource venues |
| Missing fixture `prerequisiteId` for knockouts | SIGNIFICANT | Add dependency field |

### 1.2 Registry Issues

| Issue | Severity | Fix |
|-------|----------|-----|
| `hard_or_soft` type not in schema enum | CRITICAL | Split into separate entries |
| Penalty models mismatch (exponential/flat not in schema) | CRITICAL | Add to schema enum |
| Constraint params not validated against paramsSchema | CRITICAL | Implement validation |
| Missing official assignment constraints | SIGNIFICANT | Add to registry |
| Missing resource capacity constraints | SIGNIFICANT | Add to registry |

### 1.3 Validator Issues

| Issue | Severity | Fix |
|-------|----------|-----|
| `c.rule` vs `c.ruleId` inconsistency | HIGH | Standardize to `ruleId` |
| Missing endTime handling causes NaN | HIGH | Add validation/fallback |
| No validation assignments reference valid fixtures | HIGH | Add cross-reference check |
| Inconsistent rule export patterns | MEDIUM | Standardize all modules |
| O(n²) overlap detection | LOW | Optimize with sweep-line |

---

## Part 2: New Features for v2.0

### 2.1 Schema Additions

#### 2.1.1 Sport Type Definition
```json
{
  "sport": {
    "type": "string",
    "enum": [
      "soccer", "basketball", "american_football", "ice_hockey",
      "rugby_union", "rugby_league", "cricket", "baseball",
      "volleyball", "handball", "tennis", "table_tennis",
      "esports", "surfing", "swimming", "athletics", "other"
    ]
  }
}
```

#### 2.1.2 Team Strength/Ranking
```json
{
  "team": {
    "properties": {
      "strength": { "type": "number", "minimum": 0, "maximum": 100 },
      "ranking": { "type": "integer", "minimum": 1 },
      "region": { "type": "string" },
      "conference": { "type": "string" }
    }
  }
}
```

#### 2.1.3 Fixture Dependencies
```json
{
  "fixture": {
    "properties": {
      "dependsOn": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "fixtureId": { "type": "string" },
            "condition": {
              "type": "string",
              "enum": ["winner", "loser", "1st", "2nd", "3rd", "4th"]
            }
          }
        }
      }
    }
  }
}
```

#### 2.1.4 Assignment Resource Support
```json
{
  "assignment": {
    "properties": {
      "resourceId": {
        "type": "string",
        "description": "Specific resource within venue (e.g., Court 1, Field A)"
      }
    }
  }
}
```

### 2.2 New Constraints

| Constraint ID | Category | Type | Purpose |
|--------------|----------|------|---------|
| `official_availability` | officials | hard | Ensure officials available for assigned fixtures |
| `official_qualification` | officials | hard | Match official level to fixture requirements |
| `official_conflict` | officials | hard | Prevent official assignment to conflicting teams |
| `official_rest_time` | officials | hard/soft | Minimum rest between official assignments |
| `resource_capacity` | venue | hard | Validate fixture fits resource capacity |
| `fixture_resource_compatibility` | venue | hard | Match fixture sport to resource type |
| `complete_round_robin` | structure | hard | Ensure all team pairs meet required times |
| `bracket_seeding` | structure | hard | Validate knockout bracket structure |

### 2.3 New Objectives

| Objective ID | Category | Calculation | Purpose |
|-------------|----------|-------------|---------|
| `constraint_satisfaction` | meta | count | Track number of satisfied constraints |
| `hard_violation_count` | meta | count | Count hard constraint violations |
| `soft_penalty_total` | meta | sum | Sum of soft constraint penalties |
| `official_utilization` | efficiency | balance | Balance official assignments |
| `resource_utilization` | efficiency | maximize | Maximize resource usage |

### 2.4 Validator Enhancements

1. **Cross-Reference Validation**: Verify all IDs reference existing entities
2. **Constraint Completeness Check**: Ensure all defined constraints have results
3. **Temporal Validation**: Verify start < end for all date ranges
4. **Parameter Schema Validation**: Validate constraint params against registry paramsSchema
5. **Fixture Cardinality Check**: Ensure exactly one assignment per fixture
6. **Distance Calculation Standardization**: Use Haversine with documented precision

---

## Part 3: Implementation Plan

### Phase 1: Schema Updates (Priority: CRITICAL)

1. **osss-core.schema.json**
   - Add `sport` required field with enum
   - Add `blackoutDates` to season object
   - Add `strength`, `ranking`, `region` to team definition
   - Add `dependsOn` to fixture definition
   - Fix participant validation (require complementary roles)
   - Add format validation for all date fields

2. **osss-results.schema.json**
   - Add `resourceId` to assignment
   - Add `objectives` array for objective results
   - Add `schemaVersion` for compatibility tracking

3. **osss-constraints.schema.json**
   - Add `exponential`, `flat`, `step` to penalty model enum
   - Add `hard_or_soft` handling or remove from registry
   - Add `phases` to selector support

4. **osss-objectives.schema.json**
   - Add `calculation` field to objectiveResult
   - Add `optimizationGoal` to results
   - Make `aggregation` required with default

### Phase 2: Registry Updates (Priority: HIGH)

1. **constraints.json**
   - Split all `hard_or_soft` constraints into separate entries
   - Add 8 new constraints (officials, resources, structure)
   - Fix penalty model types to match schema
   - Add cross-reference documentation

2. **objectives.json**
   - Add 5 new objectives (meta, efficiency)
   - Complete targetRanges for all objectives
   - Add mathematical definitions for calculations

### Phase 3: Validator Fixes (Priority: HIGH)

1. **src/validate/instance.js**
   - Fix `c.rule` to `c.ruleId`
   - Add sport validation
   - Add cross-reference validation

2. **src/validate/result.js**
   - Add endTime validation with fallback
   - Add fixture existence validation
   - Add cardinality check (one assignment per fixture)

3. **src/rules/utils.js**
   - Add NaN checks for all Date.parse calls
   - Standardize distance calculation (Haversine)
   - Add epsilon for floating-point comparisons

4. **src/rules/index.js**
   - Standardize export pattern for all rules
   - Add parameter schema validation

### Phase 4: Example Updates (Priority: MEDIUM)

1. Add missing results files:
   - carry-over-fairness/osss-results.json
   - complex-multi-phase/osss-results.json
   - scottish-premiership/osss-results.json
   - volleyball-indoor/osss-results.json
   - youth-league/osss-results.json

2. Fix existing issues:
   - pro-league: Fix venue ID mismatch
   - esports-tournament: Fix constraint violation
   - amateur-league: Fix JSON formatting

3. Complete fixture sets where partial

### Phase 5: Documentation (Priority: MEDIUM)

1. Update README with v2.0 changes
2. Add migration guide from v1 to v2
3. Document penalty model semantics
4. Add constraint/objective decision guide

---

## Part 4: Breaking Changes

### 4.1 Schema Breaking Changes

| Change | Migration |
|--------|-----------|
| `sport` now required | Add sport field to all instances |
| Date format enforced | Update all dates to ISO 8601 with timezone |
| Participant roles validated | Ensure home/away/neutral properly assigned |

### 4.2 Registry Breaking Changes

| Change | Migration |
|--------|-----------|
| `hard_or_soft` split | Update constraint references to use specific type |
| Penalty model names changed | Update custom penalty configurations |

### 4.3 Validator Breaking Changes

| Change | Migration |
|--------|-----------|
| `ruleId` required (not `rule`) | Update constraint definitions |
| `endTime` validated | Ensure all assignments have valid endTime |

---

## Part 5: Version Strategy

### Semantic Versioning
- **v2.0.0**: Major release with breaking changes
- **v2.0.1+**: Patch releases for bug fixes
- **v2.1.0+**: Minor releases for new features

### Compatibility
- v2.0 validator will include v1 compatibility mode
- Migration tool to convert v1 instances to v2 format

---

## Part 6: Success Metrics

1. **Schema Compliance**: 100% of examples validate against v2 schemas
2. **Constraint Coverage**: All 50+ constraints implemented in validator
3. **Test Coverage**: 80%+ code coverage for validator
4. **Documentation**: Complete API reference for all constraints/objectives
5. **Performance**: Validate 1000-fixture instance in <5 seconds

---

## Appendix A: Full Issue List

### Schema Issues (31 total)
[See audit report for complete list]

### Validator Issues (18 total)
[See audit report for complete list]

### Example Issues (15+ total)
[See audit report for complete list]

---

## Appendix B: New Constraint Definitions

### official_availability
```json
{
  "ruleId": "official_availability",
  "name": "Official Availability",
  "description": "Ensures assigned officials are available during fixture time",
  "category": "officials",
  "type": "hard",
  "paramsSchema": {
    "type": "object",
    "properties": {
      "checkBlackouts": { "type": "boolean", "default": true }
    }
  }
}
```

### official_qualification
```json
{
  "ruleId": "official_qualification",
  "name": "Official Qualification Match",
  "description": "Ensures official qualification level meets fixture requirements",
  "category": "officials",
  "type": "hard",
  "paramsSchema": {
    "type": "object",
    "properties": {
      "qualificationField": { "type": "string", "default": "qualificationLevel" },
      "fixtureRequirementField": { "type": "string", "default": "requiredOfficialLevel" }
    }
  }
}
```

### resource_capacity
```json
{
  "ruleId": "resource_capacity",
  "name": "Resource Capacity",
  "description": "Validates fixture participant count fits resource capacity",
  "category": "venue",
  "type": "hard",
  "paramsSchema": {
    "type": "object",
    "properties": {
      "includeSpectators": { "type": "boolean", "default": false },
      "capacityBuffer": { "type": "number", "default": 0 }
    }
  }
}
```

---

*Document version: 1.0*
*Created: 2026-01-30*
*Status: Ready for implementation*
