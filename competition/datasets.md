# OSSS Competition Datasets

Datasets are the foundation of fair competition. This document describes dataset types, generation, and usage policies.

---

## Dataset Categories

### 1. Training Datasets
**Purpose**: Practice and algorithm development
**Availability**: Public, downloadable anytime
**Usage**: Unlimited

Examples:
- `training/youth-league-basic-01.json`
- `training/amateur-league-standard-01.json`
- `training/professional-league-example-01.json`

### 2. Competition Datasets
**Purpose**: Official competition submissions
**Availability**: Released per competition schedule
**Usage**: One submission per team per instance

Examples:
- `competition/2025-q1/track-1-youth-2025q1.json`
- `competition/2025-q1/track-2-amateur-2025q1.json`

### 3. Holdout Datasets
**Purpose**: Final ranking verification
**Availability**: Never public
**Usage**: Automated testing only

Used to:
- Prevent overfitting
- Verify generalization
- Detect gaming

---

## Dataset Structure

Each dataset includes:

### Instance File
```json
{
  "osssVersion": "1.0.0",
  "metadata": {
    "datasetId": "track-2-amateur-2025q1",
    "track": "track-2-amateur",
    "releaseDate": "2025-01-15",
    "difficulty": "moderate",
    "description": "Realistic amateur league with venue sharing",
    "source": "synthetic",
    "license": "CC-BY-4.0"
  },
  "teams": [...],
  "venues": [...],
  "fixtures": [...],
  "constraints": {...},
  "objectives": {...}
}
```

### Metadata File
```json
{
  "datasetId": "track-2-amateur-2025q1",
  "statistics": {
    "numTeams": 16,
    "numVenues": 8,
    "numFixtures": 240,
    "numConstraints": 12,
    "seasonDays": 180,
    "expectedDifficulty": "moderate"
  },
  "provenance": {
    "generated": "2025-01-01T00:00:00Z",
    "generator": "osss-dataset-generator",
    "version": "1.0.0",
    "seed": "42"
  },
  "validation": {
    "schemaValid": true,
    "constraintsValid": true,
    "instanceHash": "abc123..."
  }
}
```

### Baseline Solutions
Reference solutions for comparison:
- `baseline-greedy.json` - Simple greedy algorithm
- `baseline-random.json` - Random search baseline
- `baseline-reference.json` - Reference validator performance

---

## Dataset Generation

### Synthetic Datasets

Generated using `osss dataset generate`:

```bash
osss dataset generate \
  --track track-2-amateur \
  --num-teams 16 \
  --num-venues 8 \
  --season-weeks 20 \
  --output instance.json \
  --seed 42
```

Parameters:
- `--track`: Competition track template
- `--num-teams`: Number of teams
- `--num-venues`: Number of venues
- `--season-weeks`: Season length
- `--complexity`: low | moderate | high
- `--seed`: Random seed (reproducibility)

### Real-World Datasets

Anonymized from actual leagues:

```bash
osss dataset anonymize \
  --input real-league.json \
  --output anonymized.json \
  --preserve-structure \
  --remove-pii
```

Anonymization:
- ✅ Team names → Generic IDs
- ✅ Venue names → Generic labels
- ✅ Locations → Approximate coordinates
- ✅ Dates → Relative time
- ❌ Structure preserved
- ❌ Constraints preserved

---

## Dataset Difficulty Calibration

### Easy
- Few constraints (< 5 hard)
- Generous rest periods (72h+)
- Low fixture density
- Abundant venues
- High feasibility

### Moderate
- Standard constraints (5-10 hard)
- Normal rest periods (48h)
- Medium fixture density
- Shared venues
- Feasible with effort

### Hard
- Many constraints (10-15 hard)
- Tight rest periods (48h)
- High fixture density
- Limited venues
- Feasibility challenging

### Very Hard
- Complex constraints (15+ hard, many soft)
- Minimal rest (48h strict)
- Dense fixtures
- Scarce venues
- Often infeasible

---

## Dataset Validation

All datasets must pass:

```bash
osss-validate instance \
  --instance dataset.json \
  --schemas ./schemas \
  --registry ./registry
```

Checks:
- ✅ Schema compliance
- ✅ Constraint registry validation
- ✅ Structural consistency
- ✅ Metadata completeness

---

## Dataset Mutation

Create variants for testing:

```bash
osss dataset mutate \
  --input base-instance.json \
  --mutation add-teams \
  --num-teams 4 \
  --output mutated.json
```

Mutation types:
- `add-teams` - Add more teams
- `remove-venues` - Reduce venue capacity
- `tighten-rest` - Reduce rest time
- `add-constraints` - Increase difficulty
- `change-season` - Modify season length

---

## Privacy & Data Sharing

### Public Datasets
Safe to share:
- ✅ Synthetic generated data
- ✅ Fully anonymized real data
- ✅ Training datasets
- ✅ Competition datasets (after release)

### Private Datasets
Do NOT share:
- ❌ Raw league data with PII
- ❌ Holdout test sets
- ❌ Pre-release competition data
- ❌ Unreleased instances

### Anonymization Guidelines

**Remove**:
- Team names, player names
- Coach/staff names
- Exact venue addresses
- Specific dates/times
- League identifying information
- Sponsor information

**Preserve**:
- Team count
- Venue count
- Fixture structure
- Constraint types
- Relative distances
- Temporal relationships

---

## Dataset Repository

All public datasets available at:
```
https://opensportsscheduling.org/datasets/
```

Structure:
```
datasets/
├── training/
│   ├── track-1-youth/
│   ├── track-2-amateur/
│   ├── track-3-professional/
│   └── track-4-multi-division/
├── competition/
│   ├── 2025-q1/
│   ├── 2025-q2/
│   ├── 2025-q3/
│   └── 2025-q4/
└── contributed/
    └── community-datasets/
```

---

## Dataset Contribution

Community can contribute datasets:

### Submission Process

1. **Prepare dataset**
   - Anonymize if real-world
   - Validate schema
   - Document metadata

2. **Submit PR**
   - Add to `datasets/contributed/`
   - Include README
   - Provide baseline solution

3. **Review**
   - Validation checks
   - Quality assessment
   - License verification

4. **Acceptance**
   - Merge to repository
   - Credit contributors
   - Add to catalog

### Licensing

Contributed datasets should use:
- **CC-BY-4.0** (recommended)
- **CC0** (public domain)
- **ODC-BY** (database-specific)

---

## Dataset Statistics

### Current Library

| Track | Training | Competition | Total |
|-------|----------|-------------|-------|
| Youth | 10 | 4 per quarter | 26 |
| Amateur | 15 | 4 per quarter | 31 |
| Professional | 12 | 4 per quarter | 28 |
| Multi-Division | 8 | 2 per quarter | 16 |
| **Total** | **45** | **56/year** | **101** |

### Growth Target

- Year 1: 100+ datasets
- Year 2: 250+ datasets
- Year 3: 500+ datasets

---

## Quality Standards

All datasets must:
- ✅ Validate against OSSS schemas
- ✅ Include complete metadata
- ✅ Provide difficulty rating
- ✅ Have at least one baseline solution
- ✅ Document any special characteristics
- ✅ Be properly licensed

---

## Dataset Requests

Community can request:
- Specific league types
- Particular constraints
- Difficulty levels
- Real-world scenarios

Submit requests via:
- GitHub Discussions
- Competition forum
- Email: datasets@opensportsscheduling.org

---

## Benchmark Results

Each dataset tracks:
- Best known solution
- Average solution quality
- Solver performance
- Feasibility rate
- Typical runtime

Published on dataset page.

---

**Data is the foundation of fair competition.**
