# OSSS Scheduling Challenge - Official Rules

**Version**: 1.0.0
**Effective Date**: 2025-01-01
**Challenge Type**: Open, Continuous

---

## Overview

The OSSS Scheduling Challenge is an open competition for sports scheduling algorithms. Participants develop solvers that generate optimal schedules for real-world sports leagues.

### Goals

1. **Advance the state of the art** in sports scheduling optimization
2. **Build a library** of benchmark problems and solutions
3. **Foster collaboration** between researchers, vendors, and practitioners
4. **Demonstrate OSSS** as a common interchange format

---

## Tracks

### Track 1: Youth League Optimization
**Difficulty**: ⭐⭐ Beginner
**Focus**: Player safety, family convenience, fairness
**Typical Size**: 8-16 teams, 10-20 weeks
**Key Constraints**: Long rest periods (72h+), minimal travel, no weekdays

### Track 2: Amateur League Optimization
**Difficulty**: ⭐⭐⭐ Intermediate
**Focus**: Competitive balance, cost efficiency, venue sharing
**Typical Size**: 12-24 teams, 16-30 weeks
**Key Constraints**: Shared venues, moderate rest, balanced schedules

### Track 3: Professional League Optimization
**Difficulty**: ⭐⭐⭐⭐ Advanced
**Focus**: Broadcast windows, revenue maximization, strict fairness
**Typical Size**: 16-32 teams, 30-40 weeks
**Key Constraints**: Broadcast compliance, minimal rest, high fairness requirements

### Track 4: Multi-Division Coordination
**Difficulty**: ⭐⭐⭐⭐⭐ Expert
**Focus**: Cross-division coordination, shared resources, complex constraints
**Typical Size**: 40+ teams across divisions, 30-40 weeks
**Key Constraints**: Venue sharing, division-specific rules, playoff coordination

---

## Submission Requirements

### 1. Valid OSSS Result
```json
{
  "osssVersion": "1.0.0",
  "metadata": {
    "solverName": "YourSolver",
    "solverVersion": "1.0.0",
    "submittedBy": "team-name",
    "submittedAt": "2025-01-15T10:00:00Z",
    "track": "track-2-amateur",
    "instanceId": "amateur-2025-01"
  },
  "schedule": { ... },
  "validation": { ... }
}
```

### 2. Attestation
All submissions must include cryptographic attestation:
- Instance hash verification
- Result hash
- Validation proof

### 3. Solver Description
Brief description (max 500 words):
- Algorithm approach
- Key techniques
- Computational resources used
- Runtime

### 4. Reproducibility
Optional but recommended:
- Source code (for open division)
- Dependencies list
- Execution instructions

---

## Scoring

### Primary Metrics

#### Hard Constraint Compliance (Pass/Fail)
- **Pass**: Zero hard constraint violations
- **Fail**: Any hard constraint violations
- Only feasible schedules are ranked

#### Soft Constraint Penalties (Lower is Better)
Total penalty from all soft constraints

#### Objectives Score (Track-Dependent)
Weighted score across objectives:
- Travel optimization
- Fairness metrics
- Schedule quality
- Venue efficiency

### Tie-Breaking

If multiple submissions have identical scores:
1. **Submission time** (earlier is better)
2. **Solution stability** (fewer changes from baseline)
3. **Computational efficiency** (faster runtime)

### Track-Specific Weights

**Track 1 (Youth)**:
- Travel: 40%
- Fairness: 30%
- Player welfare: 30%

**Track 2 (Amateur)**:
- Cost efficiency: 35%
- Fairness: 35%
- Schedule quality: 30%

**Track 3 (Professional)**:
- Fairness: 40%
- Broadcast compliance: 35%
- Travel: 25%

**Track 4 (Multi-Division)**:
- Venue efficiency: 30%
- Fairness (cross-division): 35%
- Overall quality: 35%

---

## Divisions

### Open Division
- Any approach allowed
- Code sharing encouraged
- Collaboration permitted
- No resource limits

### Commercial Division
- Vendor products
- Proprietary algorithms allowed
- Resource reporting required
- No code sharing required

### Academic Division
- Research-focused
- Novel approaches emphasized
- Publication encouraged
- Reproducibility valued

---

## Timeline

### Continuous Challenge
Problems released quarterly:
- **Q1**: January 15
- **Q2**: April 15
- **Q3**: July 15
- **Q4**: October 15

Each problem open for 90 days.

### Annual Championship
December 1: Best overall performer across all tracks

---

## Prizes & Recognition

### Per-Track Winners
- **1st Place**: OSSS Gold Medal + Featured on website
- **2nd Place**: OSSS Silver Medal + Recognition
- **3rd Place**: OSSS Bronze Medal + Recognition

### Annual Championship
- **Champion**: OSSS Grand Prix Trophy
- **Innovation Award**: Most novel approach
- **Efficiency Award**: Best computational efficiency
- **Open Source Award**: Best open-source contribution

### Recognition
All top-10 finishers receive:
- OSSS Verified Solver badge
- Listing on Hall of Fame
- Competition certificate
- Performance profile

---

## Rules & Conduct

### Allowed

✅ Any programming language
✅ Any algorithm or technique
✅ Commercial or open-source solvers
✅ Cloud computing resources
✅ Collaboration within teams
✅ Multiple submissions (best score counts)

### Prohibited

❌ Tampering with instance files
❌ Fabricating validation results
❌ Reverse-engineering test data
❌ Automated attacks on infrastructure
❌ Plagiarism of other solutions
❌ Sharing solutions between competing teams

### Fair Play

- Honor system with attestation verification
- Random validation checks
- Disqualification for violations
- Appeals process available

---

## Submission Process

### Step 1: Select Track & Instance
Download instance from:
```
https://opensportsscheduling.org/competition/tracks/{track}/{instance}.json
```

### Step 2: Generate Schedule
Run your solver to produce `result.json`

### Step 3: Validate
```bash
osss-validate result \
  --instance instance.json \
  --result result.json \
  --schemas ./schemas \
  --registry ./registry \
  --attest \
  --output attestation.json
```

### Step 4: Submit
Upload to submission portal:
- `result.json`
- `attestation.json`
- `solver-description.md`

### Step 5: Verification
Automated verification within 1 hour:
- Hash verification
- Constraint validation
- Objective scoring
- Leaderboard update

---

## Leaderboard

Public leaderboard at:
```
https://opensportsscheduling.org/competition/leaderboard
```

Shows:
- Team name
- Track
- Score
- Rank
- Submission date
- Solver (optional)

Updated in real-time.

---

## Dataset Policy

### Training Datasets
Provided for practice:
- Historical instances
- Synthetic problems
- Example solutions

### Competition Datasets
Released per schedule:
- Unknown to participants beforehand
- Realistic league parameters
- Difficulty calibrated per track

### Holdout Datasets
Secret test set:
- Never released publicly
- Used for final rankings
- Prevents overfitting

---

## Intellectual Property

### Submissions
- Participants retain all rights to their solvers
- Results may be published by OSSS for research
- Anonymization available on request

### Open Division
- Encouraged to open-source
- MIT/Apache-2.0 licenses recommended
- Recognition for contributions

### Commercial Division
- Proprietary algorithms allowed
- No code disclosure required
- Performance results published

---

## Support & Questions

- **Discussion Forum**: GitHub Discussions
- **Technical Issues**: GitHub Issues
- **Rule Clarifications**: competition@opensportsscheduling.org
- **Appeals**: appeals@opensportsscheduling.org

---

## Changes to Rules

- Rules may be updated between competitions
- Major changes require 90-day notice
- All participants notified
- Version tracking maintained

---

## Code of Conduct

All participants must:
- Compete honestly and fairly
- Respect other participants
- Follow submission guidelines
- Accept judging decisions
- Promote OSSS mission

Violations may result in:
- Submission rejection
- Temporary ban
- Permanent ban (severe cases)

---

## Legal

### Liability
OSSS organizers not liable for:
- Technical issues
- Data loss
- Prize delivery delays
- Rule interpretation disputes

### Eligibility
Open to all:
- Individuals
- Teams
- Academic institutions
- Commercial entities

No geographic restrictions.

---

**Let the best scheduler win! 🏆**

For the latest rules, visit: https://opensportsscheduling.org/competition/rules
