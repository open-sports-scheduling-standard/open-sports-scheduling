# OSSS Auditability Guide

**Comprehensive guide for auditing OSSS compliance and schedule quality**

Version: 0.1-draft
Last Updated: 2025-01-01

---

## Purpose

This guide helps auditors, quality assurance teams, and compliance officers:
- Verify OSSS implementation compliance
- Audit schedule decisions and outcomes
- Validate constraint adherence
- Investigate violations and anomalies
- Generate audit reports

---

## Audit Types

### 1. Compliance Audit
**Purpose:** Verify vendor implementation meets OSSS specifications

**When:** During vendor evaluation, contract acceptance, periodic reviews

**Focus:**
- Schema compliance
- Conformance test results
- Feature completeness
- Documentation quality

### 2. Schedule Quality Audit
**Purpose:** Evaluate quality and fairness of generated schedules

**When:** After schedule generation, before publication, post-season review

**Focus:**
- Constraint violations
- Objective performance
- Fairness metrics
- Stakeholder satisfaction

### 3. Attestation Audit
**Purpose:** Verify tamper-proof result attestations

**When:** Competition submissions, dispute resolution, vendor claims verification

**Focus:**
- Hash validation
- Timestamp verification
- Metadata accuracy
- Result reproducibility

---

## Audit Methodology

### Phase 1: Planning

#### 1.1 Define Scope

```
Audit Scope Checklist:

□ Compliance level to verify (Basic / Standard / Advanced / Research-Grade)
□ OSSS version to audit against
□ Specific constraints to test
□ Specific objectives to verify
□ Time period covered (for schedule audits)
□ Sample size (number of instances/results to review)
```

#### 1.2 Gather Documentation

**Required Materials:**
- OSSS instance files
- OSSS result files
- Validation reports
- Vendor documentation
- Conformance test results
- Attestation records

#### 1.3 Set Up Environment

```bash
# Install OSSS validator
cd osss-validator
npm install

# Verify validator installation
./bin/osss-validate.js --help

# Clone/update schemas and registries
git clone https://github.com/[osss-org]/open-sports-scheduling
cd open-sports-scheduling
```

---

### Phase 2: Compliance Verification

#### 2.1 Schema Validation

**Test all instance files:**

```bash
osss-validate instance \
  --instance path/to/instance.json \
  --schemas ./schemas \
  --registry ./registry
```

**Expected output:**
- ✅ Schema validation passes
- ✅ All required fields present
- ✅ Data types correct
- ✅ References valid (teamIds, venueIds, etc.)

**Common issues:**
- Missing required fields
- Invalid date formats
- Broken references
- Type mismatches

**Audit checklist:**
```
□ Instance file is valid JSON
□ Conforms to osss-core.schema.json
□ All teamIds referenced in fixtures exist
□ All venueIds referenced in fixtures exist
□ Dates are ISO 8601 format with timezones
□ Constraint parameters match registry schemas
□ Objective weights sum appropriately (if applicable)
```

#### 2.2 Result Validation

**Test all result files:**

```bash
osss-validate result \
  --instance path/to/instance.json \
  --result path/to/result.json \
  --schemas ./schemas \
  --registry ./registry
```

**Expected output:**
- ✅ Result schema validation passes
- ✅ All fixtures from instance are scheduled
- ✅ Violations are properly reported
- ✅ Objectives are calculated correctly

**Audit checklist:**
```
□ Result file is valid JSON
□ Conforms to osss-results.schema.json
□ All fixtures scheduled (or infeasibility documented)
□ Violations include: constraintId, fixtureIds, severity, message
□ Objectives include: objectiveId, value, weight
□ Attestation present and complete
□ Timestamps are reasonable
```

#### 2.3 Conformance Testing

**Run official conformance suite:**

```bash
osss-validate conformance \
  --conformance ./conformance \
  --schemas ./schemas \
  --registry ./registry
```

**Expected results:**
- Must-pass: 4/4 passing
- Must-fail: 4/4 correctly failing

**Audit checklist:**
```
□ All must-pass tests succeed
□ All must-fail tests correctly rejected
□ Error messages are clear and actionable
□ Validation is consistent across runs
```

---

### Phase 3: Constraint Verification

#### 3.1 Hard Constraint Testing

**For each hard constraint, verify:**

1. **No false positives** (valid schedules not rejected)
2. **No false negatives** (invalid schedules not caught)

**Test procedure:**

```bash
# Test 1: Valid schedule should pass
osss-validate result \
  --instance valid-schedule-instance.json \
  --result valid-schedule-result.json \
  --schemas ./schemas \
  --registry ./registry

# Expected: No violations for this constraint

# Test 2: Invalid schedule should fail
osss-validate result \
  --instance invalid-schedule-instance.json \
  --result invalid-schedule-result.json \
  --schemas ./schemas \
  --registry ./registry

# Expected: Violations reported for this constraint
```

**Key hard constraints to test:**

| Constraint ID | Test Case | Expected Violation |
|---------------|-----------|-------------------|
| no_overlap_team | Team plays 2 fixtures simultaneously | Yes |
| no_overlap_venue_resource | Venue hosts 2 fixtures simultaneously | Yes |
| min_rest_time | Team has < min rest between fixtures | Yes |
| blackout_window | Fixture scheduled during blackout | Yes |

**Audit checklist:**
```
□ Violations detected for all intentionally violated constraints
□ No false violations on valid schedules
□ Violation messages are clear and accurate
□ All affected fixtures are listed
```

#### 3.2 Soft Constraint Testing

**For each soft constraint, verify:**

1. **Penalty calculation** is correct
2. **Penalty aggregation** follows specified model
3. **Objective reporting** includes soft constraint penalties

**Audit checklist:**
```
□ Soft violations do not cause hard failure
□ Penalties calculated according to penalty model (linear/quadratic/etc.)
□ Penalties weighted correctly
□ Total penalty matches sum/max/aggregation mode
□ Objectives section includes soft constraint contributions
```

---

### Phase 4: Objective Verification

#### 4.1 Calculate Objectives Independently

**For critical objectives, manually verify calculation:**

**Example: total_travel_distance**

1. Extract all fixtures with venues
2. Look up team locations
3. Calculate travel for each team between consecutive fixtures
4. Sum total distance
5. Compare to reported value

**Tolerance:** Allow for rounding differences (< 0.1%)

**Audit checklist:**
```
□ Objective values match independent calculation (within tolerance)
□ All standard objectives from registry are calculated
□ Custom objectives are documented
□ Weights applied correctly
□ Aggregation mode follows specification
```

#### 4.2 Verify Objective Fairness

**Fairness metrics to check:**

| Metric | Formula | Acceptable Range |
|--------|---------|-----------------|
| Home/Away Balance | \|home - away\| per team | ≤ 1 fixture difference |
| Travel Balance | Std dev of team travel | < 20% of mean |
| Rest Time Fairness | Min/max rest ratio | > 0.7 |
| Primetime Fairness | Std dev of primetime slots | < 20% of mean |

**Audit checklist:**
```
□ No team is systematically disadvantaged
□ Fairness metrics within acceptable ranges
□ Outliers are documented and justified
□ Trade-offs are transparent
```

---

### Phase 5: Attestation Verification

#### 5.1 Hash Validation

**Verify cryptographic attestations:**

```javascript
const crypto = require('crypto');
const { hashInstance, hashResult, verifyAttestation } = require('./osss-validator/src/attestation.js');

// Load files
const instance = JSON.parse(fs.readFileSync('instance.json'));
const result = JSON.parse(fs.readFileSync('result.json'));

// Recompute hashes
const computedInstanceHash = hashInstance(instance);
const computedResultHash = hashResult(result);

// Compare to attestation
const attestation = result.attestation;
console.log('Instance hash match:', computedInstanceHash === attestation.instanceHash);
console.log('Result hash match:', computedResultHash === attestation.resultHash);

// Full verification
const verified = verifyAttestation(instance, result);
console.log('Attestation verified:', verified);
```

**Audit checklist:**
```
□ Instance hash recomputation matches attestation
□ Result hash recomputation matches attestation
□ Ruleset hash recomputation matches attestation
□ Timestamps are reasonable (not future, not ancient)
□ Validator metadata is complete
□ Attestation hash is consistent
```

#### 5.2 Tampering Detection

**Signs of tampering:**
- Hash mismatches
- Missing attestation fields
- Implausible timestamps
- Metadata inconsistencies
- Result doesn't match instance constraints

**Audit checklist:**
```
□ No evidence of result modification
□ Instance and result are consistent
□ Hashes validate independently
□ Timestamps are chronological
```

---

### Phase 6: Documentation Review

#### 6.1 Vendor Documentation

**Required documentation:**

```
□ OSSS implementation guide present
□ List of supported constraints complete and accurate
□ List of supported objectives complete and accurate
□ Known limitations documented
□ API documentation (if applicable)
□ Examples provided and validated
□ Version compatibility matrix present
```

#### 6.2 User-Facing Documentation

```
□ How to import OSSS files
□ How to export OSSS files
□ How to interpret violations
□ How to tune constraint weights
□ Troubleshooting guide
```

---

### Phase 7: Reporting

#### 7.1 Audit Report Template

```markdown
# OSSS Audit Report

**Audit Type:** [Compliance / Schedule Quality / Attestation]
**Auditor:** [Name/Organization]
**Date:** [ISO Date]
**Vendor/System:** [Name and Version]
**OSSS Version:** [Specification Version]

---

## Executive Summary

[High-level findings: Pass/Fail, major issues, recommendations]

---

## Scope

- Compliance Level Audited: [Basic / Standard / Advanced / Research-Grade]
- Instances Reviewed: [Number]
- Results Reviewed: [Number]
- Time Period: [Date Range]

---

## Findings

### Schema Validation
- **Status:** ✅ Pass / ❌ Fail
- **Details:** [Summary]
- **Issues:** [List any issues]

### Conformance Tests
- **Must-Pass:** X/4 passing
- **Must-Fail:** X/4 correctly failing
- **Status:** ✅ Pass / ❌ Fail
- **Issues:** [List any issues]

### Constraint Verification
- **Hard Constraints Tested:** [Number]
- **Soft Constraints Tested:** [Number]
- **False Positives:** [Number]
- **False Negatives:** [Number]
- **Status:** ✅ Pass / ❌ Fail
- **Issues:** [List any issues]

### Objective Verification
- **Objectives Calculated:** X/13 standard objectives
- **Independent Verification:** ✅ Pass / ❌ Fail
- **Deviation:** [Percentage]
- **Issues:** [List any issues]

### Attestation Verification
- **Hash Validation:** ✅ Pass / ❌ Fail
- **Tampering Detected:** Yes / No
- **Issues:** [List any issues]

### Documentation Review
- **Completeness:** [Score /10]
- **Accuracy:** ✅ Pass / ❌ Fail
- **Issues:** [List any issues]

---

## Detailed Issues

| ID | Severity | Category | Description | Recommendation |
|----|----------|----------|-------------|----------------|
| 1 | High/Medium/Low | [Category] | [Description] | [Fix recommendation] |
| 2 | ... | ... | ... | ... |

---

## Compliance Summary

**Overall Compliance Level Achieved:** [None / Basic / Standard / Advanced / Research-Grade]

**Gaps to Next Level:**
1. [Gap 1]
2. [Gap 2]

---

## Recommendations

### Critical (Must Fix)
1. [Recommendation 1]
2. [Recommendation 2]

### Important (Should Fix)
1. [Recommendation 1]
2. [Recommendation 2]

### Optional (Nice to Have)
1. [Recommendation 1]
2. [Recommendation 2]

---

## Certification

Based on this audit:

□ **APPROVED** - Meets [LEVEL] compliance
□ **CONDITIONAL** - Approved pending fixes to: [list]
□ **REJECTED** - Does not meet minimum compliance

**Auditor Signature:** _____________________
**Date:** _____________________

---

## Appendices

### A. Test Results
[Attach conformance test output]

### B. Sample Files Reviewed
[List files reviewed]

### C. Evidence
[Screenshots, logs, validation reports]
```

---

## Common Audit Scenarios

### Scenario 1: Pre-Procurement Vendor Evaluation

**Goal:** Evaluate multiple vendors for OSSS compliance before selection

**Process:**
1. Request vendors complete Vendor Checklist
2. Request sample OSSS files from each vendor
3. Run conformance tests on each vendor's samples
4. Compare compliance levels
5. Verify claims in vendor proposals
6. Generate comparison matrix

**Deliverable:** Vendor comparison report with compliance scores

---

### Scenario 2: Post-Implementation Acceptance Testing

**Goal:** Verify delivered system meets contracted OSSS compliance level

**Process:**
1. Review contract requirements (OSSS compliance level)
2. Run full conformance suite
3. Test with real league data
4. Verify import/export functionality
5. Check violation reporting
6. Validate attestations
7. Review documentation

**Deliverable:** Pass/Fail acceptance report

---

### Scenario 3: Schedule Dispute Resolution

**Goal:** Investigate complaints about schedule fairness or violations

**Process:**
1. Obtain OSSS instance and result files
2. Validate attestation (ensure no tampering)
3. Check specific constraints related to complaint
4. Calculate fairness metrics
5. Compare to league policies
6. Generate explanation report

**Deliverable:** Dispute resolution report with findings

---

### Scenario 4: Competition Result Verification

**Goal:** Verify competition submission is valid and untampered

**Process:**
1. Verify attestation hashes
2. Re-run validation on instance and result
3. Verify solver metadata
4. Check for suspicious patterns
5. Compare to other submissions
6. Verify timestamp and runtime claims

**Deliverable:** Competition verification report

---

## Tools & Scripts

### Automated Audit Script

```bash
#!/bin/bash
# osss-audit.sh - Automated OSSS audit script

INSTANCE=$1
RESULT=$2
SCHEMAS=$3
REGISTRY=$4
OUTPUT_DIR=$5

echo "Starting OSSS Audit..."
echo "Instance: $INSTANCE"
echo "Result: $RESULT"
echo "Output: $OUTPUT_DIR"

mkdir -p $OUTPUT_DIR

# 1. Validate instance
echo "1. Validating instance..."
osss-validate instance \
  --instance $INSTANCE \
  --schemas $SCHEMAS \
  --registry $REGISTRY \
  --format json > $OUTPUT_DIR/instance-validation.json

# 2. Validate result
echo "2. Validating result..."
osss-validate result \
  --instance $INSTANCE \
  --result $RESULT \
  --schemas $SCHEMAS \
  --registry $REGISTRY \
  --format json > $OUTPUT_DIR/result-validation.json

# 3. Verify attestation
echo "3. Verifying attestation..."
node -e "
const {verifyAttestation} = require('./osss-validator/src/attestation.js');
const fs = require('fs');
const instance = JSON.parse(fs.readFileSync('$INSTANCE'));
const result = JSON.parse(fs.readFileSync('$RESULT'));
const verified = verifyAttestation(instance, result);
console.log(JSON.stringify({verified}, null, 2));
" > $OUTPUT_DIR/attestation-verification.json

# 4. Generate summary
echo "4. Generating audit summary..."
node scripts/generate-audit-summary.js \
  $OUTPUT_DIR/instance-validation.json \
  $OUTPUT_DIR/result-validation.json \
  $OUTPUT_DIR/attestation-verification.json \
  > $OUTPUT_DIR/audit-summary.json

echo "Audit complete. Results in $OUTPUT_DIR/"
```

---

## Best Practices

### For Auditors

1. **Be Systematic** - Follow the methodology, don't skip steps
2. **Document Everything** - Screenshots, logs, calculations
3. **Independent Verification** - Don't trust vendor claims, verify independently
4. **Sample Size** - Test multiple instances, not just one
5. **Edge Cases** - Test boundary conditions and unusual scenarios
6. **Reproduce** - If possible, run solvers yourself to verify reproducibility

### For Auditees (Vendors/Leagues)

1. **Prepare Documentation** - Have all materials ready before audit
2. **Run Self-Audit First** - Find and fix issues before formal audit
3. **Be Transparent** - Disclose limitations proactively
4. **Provide Access** - Give auditors access to tools and files
5. **Document Changes** - Maintain changelog of OSSS-related updates
6. **Maintain Conformance** - Run conformance tests regularly, not just before audits

---

## Appendix: Fairness Metrics Reference

### Home/Away Balance

```
For each team:
  home_count = number of home fixtures
  away_count = number of away fixtures
  imbalance = |home_count - away_count|

League fairness = max(imbalance across all teams)
Acceptable: ≤ 1
```

### Travel Balance (Coefficient of Variation)

```
For each team:
  total_travel = sum of travel distances

mean_travel = average across teams
std_dev_travel = standard deviation across teams
CV = std_dev_travel / mean_travel

Acceptable: CV < 0.20 (20%)
```

### Rest Time Fairness

```
For each team:
  min_rest = minimum rest period between consecutive fixtures
  max_rest = maximum rest period between consecutive fixtures

League min_rest = minimum across all teams
League max_rest = maximum across all teams
Fairness ratio = League min_rest / League max_rest

Acceptable: > 0.7
```

---

## Updates & Maintenance

This guide is maintained as part of OSSS.

- **Version:** 0.1-draft
- **Last Updated:** 2025-01-01
- **Feedback:** GitHub issues or discussions

---

## License

CC-BY-4.0 - Use and adapt with attribution

---

**Rigorous auditing ensures OSSS compliance is meaningful, not just claimed.**
