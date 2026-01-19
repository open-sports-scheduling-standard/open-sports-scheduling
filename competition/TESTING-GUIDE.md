# OSSS Competition Testing Guide

**Version:** 1.0.0
**Last Updated:** 2025-01-01

Complete guide for testing your solver and submissions before competing in the OSSS Scheduling Challenge.

---

## Table of Contents

1. [Overview](#overview)
2. [Testing Levels](#testing-levels)
3. [Pre-Submission Checklist](#pre-submission-checklist)
4. [Local Testing](#local-testing)
5. [Automated CI Testing](#automated-ci-testing)
6. [Competition Judge Validation](#competition-judge-validation)
7. [Common Issues & Solutions](#common-issues--solutions)
8. [Best Practices](#best-practices)

---

## Overview

Testing your submission ensures:
- ✅ **Compliance**: Your result meets OSSS specification
- ✅ **Correctness**: All hard constraints are satisfied
- ✅ **Scoring Accuracy**: Penalties calculated correctly
- ✅ **Competition Eligibility**: Submission passes automated judging
- ✅ **Reproducibility**: Results can be independently verified

**Critical**: The competition judge will **re-score** your submission. Submitting pre-calculated scores that don't match will result in rejection.

---

## Testing Levels

### Level 1: Schema Validation ⭐
**Purpose:** Verify JSON structure is valid
**Tools:** `osss-validate schema`
**Pass Criteria:** Zero schema errors

### Level 2: Constraint Validation ⭐⭐
**Purpose:** Check constraint compliance
**Tools:** `osss-validate result`
**Pass Criteria:** Zero hard constraint violations

### Level 3: Score Verification ⭐⭐⭐
**Purpose:** Validate penalty calculations
**Tools:** `osss-validate result --fix-scores`
**Pass Criteria:** Scores match validator output

### Level 4: Track Compliance ⭐⭐⭐⭐
**Purpose:** Meet track-specific requirements
**Tools:** `osss-validate track`
**Pass Criteria:** Track objectives met

### Level 5: Competition Conformance ⭐⭐⭐⭐⭐
**Purpose:** Full competition readiness
**Tools:** GitHub Actions CI
**Pass Criteria:** Passes automated judge

---

## Pre-Submission Checklist

Before submitting to the competition, verify:

### Required Fields
```bash
# Check your submission has all required fields
jq '{
  track: .track,
  solver: .solver.name,
  version: .solver.version,
  instanceId: .instanceId,
  feasible: .feasible,
  schedule: (.schedule.fixtures | length)
}' submission.json
```

**Expected output:**
```json
{
  "track": "track-2-amateur",
  "solver": "MySolver",
  "version": "1.0.0",
  "instanceId": "amateur-2025-01",
  "feasible": true,
  "schedule": 156
}
```

### Validation Checklist

- [ ] `track` field matches instance track (`track-1-youth`, `track-2-amateur`, etc.)
- [ ] `solver.name` is your team/solver identifier (no special characters)
- [ ] `solver.version` follows semantic versioning (e.g., "1.0.0")
- [ ] `instanceId` matches the competition instance ID exactly
- [ ] `feasible` is `true` (infeasible submissions are not ranked)
- [ ] `schedule.fixtures` array contains all fixtures from instance
- [ ] All fixtures have `fixtureId`, `dateTime`, and `venueId`
- [ ] No hard constraint violations
- [ ] Soft constraint penalties calculated correctly

---

## Local Testing

### Step 1: Install OSSS Validator

```bash
# Clone the repository
git clone https://github.com/osss/open-sports-scheduling.git
cd open-sports-scheduling

# Install dependencies
npm install

# Build validator
npm run build

# Test installation
npx osss-validate --version
```

### Step 2: Download Competition Instance

```bash
# Download from competition instances directory
TRACK="track-2-amateur"
INSTANCE_ID="amateur-2025-01"

cp "competition/instances/${TRACK}/${INSTANCE_ID}.json" instance.json
```

### Step 3: Generate Your Schedule

```bash
# Run your solver (replace with your command)
./my-solver --input instance.json --output result.json
```

### Step 4: Validate Schema

```bash
# Validate result against OSSS schema
osss-validate schema \
  --type result \
  --file result.json \
  --schemas ./schemas

# Expected output:
# ✅ Schema validation passed
```

### Step 5: Validate Constraints

```bash
# Full validation with constraint checking
osss-validate result \
  --instance instance.json \
  --result result.json \
  --schemas ./schemas \
  --registry ./registry \
  --verbose

# Expected output:
# ✅ Instance valid
# ✅ Result valid
# ✅ Hard constraints: 0 violations
# ⚠️  Soft constraints: 12 violations (penalty: 245)
# ✅ Feasible schedule
```

### Step 6: Verify Scores (CRITICAL)

```bash
# Re-calculate scores to verify accuracy
osss-validate result \
  --instance instance.json \
  --result result.json \
  --schemas ./schemas \
  --registry ./registry \
  --fix-scores \
  --output verified.json

# Compare your scores with validator scores
diff <(jq -S '.scores' result.json) <(jq -S '.scores' verified.json)

# No diff = your scores are correct ✅
# Diff present = use verified.json scores ⚠️
```

**IMPORTANT:** If scores differ, update your submission with the validator's scores from `verified.json`.

### Step 7: Generate Attestation

```bash
# Create cryptographic attestation
osss-validate result \
  --instance instance.json \
  --result result.json \
  --schemas ./schemas \
  --registry ./registry \
  --attest \
  --output attestation.json

# Verify attestation
jq '{
  instanceHash: ._instanceHash,
  resultHash: ._resultHash,
  rulesetHash: ._rulesetHash,
  validatorVersion: ._validatorVersion
}' attestation.json
```

### Step 8: Create Submission Package

```bash
# Your submission must follow this naming convention:
# submissions/{track}/{solver-name}-{instanceId}.json

TRACK="track-2-amateur"
SOLVER="MySolver"
INSTANCE="amateur-2025-01"

# Copy your verified result as submission
cp verified.json "submissions/${TRACK}/${SOLVER}-${INSTANCE}.json"

# Submission is ready!
echo "✅ Submission ready: submissions/${TRACK}/${SOLVER}-${INSTANCE}.json"
```

---

## Automated CI Testing

### Test Before Committing

Create a pre-commit test script:

```bash
#!/bin/bash
# save as: scripts/test-submission.sh

set -e

SUBMISSION=$1
TRACK=$(jq -r '.track' "$SUBMISSION")
INSTANCE_ID=$(jq -r '.instanceId' "$SUBMISSION")
INSTANCE="competition/instances/${TRACK}/${INSTANCE_ID}.json"

echo "🧪 Testing submission: $SUBMISSION"
echo "📋 Track: $TRACK"
echo "📄 Instance: $INSTANCE_ID"

# Test 1: Schema validation
echo "1️⃣ Schema validation..."
npx osss-validate schema --type result --file "$SUBMISSION" --schemas ./schemas

# Test 2: Constraint validation
echo "2️⃣ Constraint validation..."
npx osss-validate result \
  --instance "$INSTANCE" \
  --result "$SUBMISSION" \
  --schemas ./schemas \
  --registry ./registry

# Test 3: Score verification
echo "3️⃣ Score verification..."
npx osss-validate result \
  --instance "$INSTANCE" \
  --result "$SUBMISSION" \
  --schemas ./schemas \
  --registry ./registry \
  --fix-scores \
  --output /tmp/verified.json

# Compare scores
ORIGINAL_SCORE=$(jq '.scores.totalPenalty' "$SUBMISSION")
VERIFIED_SCORE=$(jq '.scores.totalPenalty' /tmp/verified.json)

if [ "$ORIGINAL_SCORE" != "$VERIFIED_SCORE" ]; then
  echo "⚠️  Score mismatch!"
  echo "   Submitted: $ORIGINAL_SCORE"
  echo "   Verified:  $VERIFIED_SCORE"
  echo "   Use: osss-validate result --fix-scores"
  exit 1
fi

echo "✅ All tests passed!"
```

**Usage:**
```bash
chmod +x scripts/test-submission.sh
./scripts/test-submission.sh submissions/track-2-amateur/MySolver-amateur-2025-01.json
```

### GitHub Actions Workflow (Local Testing)

Create `.github/workflows/test-submission.yml`:

```yaml
name: Test Submission Locally

on:
  workflow_dispatch:
    inputs:
      submission:
        description: 'Path to submission file'
        required: true
        type: string

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Run validation
        run: |
          ./scripts/test-submission.sh "${{ inputs.submission }}"
```

---

## Competition Judge Validation

When you submit a PR, the automated competition judge will:

### Judge Process Flow

1. **🔍 Detect Submission**
   - Finds modified files in `submissions/` directory
   - Ensures exactly ONE submission per PR

2. **🧾 Schema Validation**
   - Validates against `schemas/osss-submission.schema.json`
   - Checks all required fields present

3. **📋 Parse Metadata**
   - Extracts `track`, `solver`, `instanceId`
   - Locates corresponding instance file

4. **⚖️ Re-Score (Anti-Cheat)**
   - **Ignores submitted scores**
   - Re-calculates all constraint penalties
   - Generates authoritative score

5. **🏆 Update Leaderboard**
   - Ranks by authoritative score
   - Updates track leaderboard
   - Issues performance badges

6. **💬 PR Comment**
   - Posts results to PR
   - Shows penalty score
   - Indicates feasibility

### Judge Validation Checks

The judge performs these validations:

```javascript
// Pseudocode of judge validation
function validateSubmission(submission, instance) {

  // 1. Schema compliance
  assert(validSchema(submission));

  // 2. Instance matching
  assert(submission.instanceId === instance.id);
  assert(submission.track === instance.track);

  // 3. Fixture coverage
  const instanceFixtures = instance.fixtures.map(f => f.id);
  const resultFixtures = submission.schedule.fixtures.map(f => f.fixtureId);
  assert(setsEqual(instanceFixtures, resultFixtures));

  // 4. Hard constraints (MUST pass)
  const hardViolations = checkHardConstraints(submission, instance);
  assert(hardViolations.length === 0);

  // 5. Re-calculate soft penalties
  const authoritativeScores = calculatePenalties(submission, instance);

  // 6. Update submission with authoritative scores
  submission.scores = authoritativeScores;

  return submission;
}
```

### Test Mode vs. Production Mode

The judge workflow has two modes:

**Test Mode** (`OSSS_TEST_MODE=true`):
- ✅ Validates submission
- ✅ Re-calculates scores
- ✅ Comments on PR
- ❌ Does NOT update leaderboard
- ❌ Does NOT commit badges

**Production Mode** (`OSSS_TEST_MODE=false`):
- ✅ Validates submission
- ✅ Re-calculates scores
- ✅ Comments on PR
- ✅ Updates leaderboard
- ✅ Issues badges

---

## Common Issues & Solutions

### Issue 1: Schema Validation Fails

**Error:**
```
❌ Schema validation failed:
   - Missing required property 'track'
```

**Solution:**
```bash
# Ensure all required fields present
jq 'keys' your-result.json
# Should include: track, solver, instanceId, schedule, scores, feasible
```

### Issue 2: Hard Constraint Violation

**Error:**
```
❌ Hard constraint violated: min_rest_time
   Team 'team-A' has only 60h rest between fixtures (required: 72h)
```

**Solution:**
- Review constraint in instance file
- Adjust your schedule to satisfy constraint
- Re-run your solver with stricter rest requirements

### Issue 3: Score Mismatch

**Error:**
```
⚠️  Score mismatch!
   Submitted: 1250
   Verified:  1340
```

**Solution:**
```bash
# Always use validator to calculate scores
osss-validate result \
  --instance instance.json \
  --result your-result.json \
  --schemas ./schemas \
  --registry ./registry \
  --fix-scores \
  --output corrected.json

# Use corrected.json as your submission
```

### Issue 4: Instance Not Found

**Error:**
```
❌ Instance not found for track: track-2-amateur
```

**Solution:**
```bash
# Verify instance exists
ls competition/instances/track-2-amateur/

# Ensure instanceId matches exactly
jq -r '.instanceId' your-result.json
# Must match: amateur-2025-01 (not amateur_2025_01)
```

### Issue 5: Multiple Files in PR

**Error:**
```
❌ Exactly ONE submission JSON must be modified per PR.
```

**Solution:**
- Create separate PRs for each submission
- Each PR should modify exactly one file in `submissions/`

### Issue 6: Infeasible Schedule

**Error:**
```
⚠️  Result: Infeasible
   Hard constraint violations: 3
```

**Solution:**
- Infeasible schedules cannot be ranked
- Fix hard constraint violations
- Set `feasible: true` only after all hard constraints satisfied

---

## Best Practices

### 1. Version Control Your Solver

```bash
# Track solver versions
git tag v1.0.0-mysolver
git push origin v1.0.0-mysolver
```

### 2. Maintain Test Instances

```bash
# Create test instances for development
osss-validate dataset-generate \
  --track amateur \
  --num-teams 12 \
  --seed 42 \
  --output tests/test-instance.json
```

### 3. Automate Testing

```bash
# Add to your solver's CI
npm test           # Unit tests
./test-solver.sh   # Integration tests
./test-submission.sh submission.json  # OSSS validation
```

### 4. Track Performance Metrics

```json
{
  "solver": "MySolver",
  "version": "1.2.0",
  "metrics": {
    "runtime": "18.3s",
    "memory": "2.1GB",
    "iterations": 50000
  }
}
```

### 5. Document Algorithm Approach

Create `solver-description.md`:
```markdown
# MySolver v1.2.0

## Algorithm
- Constraint Programming with CP-SAT
- Two-phase approach: feasibility then optimization

## Key Techniques
- Variable ordering heuristics
- Conflict-driven clause learning
- Parallel search

## Runtime: ~20s on Track 2
```

### 6. Regression Testing

```bash
# Test against previous submissions
for f in submissions/track-2-amateur/MySolver-*.json; do
  echo "Testing: $f"
  ./scripts/test-submission.sh "$f"
done
```

### 7. Score Improvement Tracking

```bash
# Track your improvements over time
git log --oneline submissions/ | while read commit; do
  git show $commit:submissions/track-2-amateur/MySolver-amateur-2025-01.json | \
    jq '.scores.totalPenalty'
done
```

---

## Advanced Testing

### Stress Testing

```bash
# Generate large instances
osss-validate dataset-generate \
  --track professional \
  --num-teams 32 \
  --num-venues 32 \
  --season-weeks 40 \
  --output stress-test.json

# Test solver performance
time ./my-solver --input stress-test.json --output stress-result.json
```

### Fuzzing

```bash
# Mutate instances to test robustness
osss-validate dataset-mutate \
  --input instance.json \
  --mutation add-constraints \
  --output mutated.json

./my-solver --input mutated.json --output result.json
```

### Comparative Testing

```bash
# Compare against baseline
BASELINE_SCORE=$(jq '.scores.totalPenalty' baseline-result.json)
YOUR_SCORE=$(jq '.scores.totalPenalty' your-result.json)

IMPROVEMENT=$(echo "scale=2; ($BASELINE_SCORE - $YOUR_SCORE) / $BASELINE_SCORE * 100" | bc)
echo "Improvement: ${IMPROVEMENT}%"
```

---

## Support & Resources

### Documentation
- [Competition Rules](./rules.md)
- [Track Specifications](./tracks.md)
- [Submission Guidelines](./SUBMISSION-GUIDE.md)
- [GitHub Setup Guide](./GITHUB-SETUP.md)

### Testing Tools
- **OSSS Validator**: `npx osss-validate --help`
- **Conformance Tests**: See `conformance/README.md`
- **Example Submissions**: See `examples/submissions/`

### Getting Help
- **GitHub Discussions**: Ask questions
- **GitHub Issues**: Report bugs
- **Email**: competition@opensportsscheduling.org

---

**Test thoroughly. Submit confidently. Compete successfully! 🏆**
