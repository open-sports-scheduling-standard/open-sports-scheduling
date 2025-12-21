# OSSS Objectives Re-Scoring Framework

The Objectives Framework extends OSSS validation beyond constraints to enable consistent optimization comparison across solvers and competitions.

## Purpose

While constraints define feasibility, objectives measure schedule quality. The framework enables:
- ✅ Standardized objective definitions
- ✅ Consistent measurement across solvers
- ✅ Fair competition benchmarking
- ✅ Multi-objective optimization comparison
- ✅ Research reproducibility

## Objectives vs Constraints

| Aspect | Constraints | Objectives |
|--------|-------------|------------|
| Purpose | Define feasibility | Measure quality |
| Violation | Makes schedule invalid | Lowers quality score |
| Types | Hard (must satisfy) / Soft (prefer to satisfy) | Optimization targets |
| Output | Pass/Fail + penalties | Numeric scores |

## Objective Structure

```json
{
  "objectiveId": "total_travel_distance",
  "weight": 1.0,
  "params": {},
  "selector": "*",
  "target": {
    "ideal": 15000,
    "max": 30000
  }
}
```

## Aggregation Modes

### Weighted Sum (Default)
Combines objectives using weights:

```json
{
  "aggregation": {
    "mode": "weighted_sum"
  }
}
```

Total score = Σ(weight × objective_score)

### Max (Worst-Case)
Uses maximum (worst) objective value:

```json
{
  "aggregation": {
    "mode": "max"
  }
}
```

Total score = max(all objective scores)

### Min (Best-Case)
Uses minimum (best) objective value:

```json
{
  "aggregation": {
    "mode": "min"
  }
}
```

### Percentile (P95, P99)
Uses specific percentile of objective values:

```json
{
  "aggregation": {
    "mode": "percentile",
    "percentile": 95
  }
}
```

Common for fairness metrics (e.g., p95 travel distance).

### Lexicographic (Priority Order)
Optimizes objectives in strict priority order:

```json
{
  "aggregation": {
    "mode": "lexicographic",
    "priorities": [
      "total_travel_distance",
      "home_away_balance",
      "opponent_variety"
    ]
  }
}
```

Higher priority objectives dominate completely.

## Standard Objectives

### Travel Objectives

**total_travel_distance**
- Minimize total km traveled by all teams
- Unit: kilometers
- Calculation: sum
- Lower is better

**max_team_travel**
- Minimize worst-case travel for any team (fairness)
- Unit: kilometers
- Calculation: max
- Lower is better

**travel_balance**
- Minimize variation in team travel
- Unit: kilometers (std dev)
- Calculation: stddev
- Lower is better

### Fairness Objectives

**home_away_balance**
- Minimize max home/away game difference
- Unit: games
- Calculation: max absolute difference
- Lower is better

**home_streak_length**
- Minimize max consecutive home or away games
- Unit: games
- Calculation: max
- Lower is better

**primetime_distribution**
- Balance primetime fixture allocation
- Unit: count (std dev)
- Calculation: stddev
- Lower is better

### Player Welfare Objectives

**rest_time_average**
- Maximize average rest between fixtures
- Unit: hours
- Calculation: average
- Higher is better

**min_rest_time**
- Maximize minimum rest (worst case)
- Unit: hours
- Calculation: min
- Higher is better

### Efficiency Objectives

**venue_utilization**
- Optimize facility usage
- Unit: percentage
- Calculation: average
- Sweet spot: 60-80%

**venue_balance**
- Balance load across venues
- Unit: games (std dev)
- Calculation: stddev
- Lower is better

**schedule_compactness**
- Minimize season length
- Unit: days
- Calculation: range (last - first fixture)
- Lower is better

### Quality Objectives

**opponent_variety**
- Maximize spacing between repeat matchups
- Unit: days
- Calculation: average
- Higher is better

### Operational Objectives

**schedule_stability**
- Minimize changes from previous schedule
- Unit: count
- Calculation: count of changes
- Lower is better

## Example: Multi-Objective Instance

```json
{
  "osssVersion": "1.0.0",
  "metadata": {
    "leagueId": "example-league",
    "seasonId": "2025"
  },
  "objectives": {
    "objectives": [
      {
        "objectiveId": "total_travel_distance",
        "weight": 2.0,
        "target": {
          "ideal": 15000,
          "max": 30000
        }
      },
      {
        "objectiveId": "home_away_balance",
        "weight": 3.0,
        "target": {
          "ideal": 0,
          "max": 2
        }
      },
      {
        "objectiveId": "opponent_variety",
        "weight": 1.0,
        "target": {
          "min": 7,
          "ideal": 21
        }
      }
    ],
    "aggregation": {
      "mode": "weighted_sum"
    }
  }
}
```

## Example: Result with Objectives

```json
{
  "osssVersion": "1.0.0",
  "metadata": {
    "solverName": "example-solver",
    "solverVersion": "1.0.0"
  },
  "schedule": {
    "fixtures": []
  },
  "validation": {
    "feasible": true,
    "hardConstraintViolations": [],
    "softConstraintPenalties": [],
    "totalPenalty": 125
  },
  "objectives": [
    {
      "objectiveId": "total_travel_distance",
      "score": 18500,
      "weightedScore": 37000,
      "normalized": 0.82,
      "details": {
        "breakdown": {
          "team-1": 2500,
          "team-2": 3000,
          "team-3": 2200
        }
      },
      "targetComparison": {
        "meetsMin": true,
        "meetsMax": true,
        "deviationFromIdeal": 3500
      }
    },
    {
      "objectiveId": "home_away_balance",
      "score": 1,
      "weightedScore": 3,
      "normalized": 0.95,
      "details": {
        "maxDelta": 1,
        "teams": {
          "team-1": 0,
          "team-2": 1,
          "team-3": 0
        }
      },
      "targetComparison": {
        "meetsMin": true,
        "meetsMax": true,
        "deviationFromIdeal": 1
      }
    }
  ],
  "objectivesScore": {
    "aggregatedScore": 37003,
    "aggregationMode": "weighted_sum",
    "rank": "good"
  }
}
```

## CLI Usage

### Validate with Objectives
```bash
osss-validate objectives \
  --instance path/to/instance.json \
  --result path/to/result.json \
  --schemas ./schemas \
  --registry ./registry
```

### Compare Results by Objectives
```bash
osss-validate compare \
  --instance instance.json \
  --results result-a.json result-b.json result-c.json \
  --schemas ./schemas \
  --registry ./registry \
  --rank-by objectives
```

## Use Cases

### 1. Solver Competitions
Define objective function consistently:
- All solvers optimize same objectives
- Fair comparison of approaches
- Reproducible results

### 2. Multi-Solver Comparison
Run multiple solvers, compare objective scores:
- Identify Pareto-optimal solutions
- Understand trade-offs
- Select best solver for league needs

### 3. Research Benchmarking
Standardized metrics enable:
- Algorithm comparison
- Performance tracking over time
- Publication-ready results

### 4. League Decision Support
Show trade-offs explicitly:
- "Schedule A: less travel, less fair"
- "Schedule B: more fair, more travel"
- Data-driven selection

## Implementation Notes

### Calculation Methods

**sum**: Σ(values)
**average**: mean(values)
**max**: max(values)
**min**: min(values)
**stddev**: √(Σ(x - μ)² / n)
**range**: max - min
**count**: number of occurrences

### Normalization

For cross-objective comparison:
- normalized = (score - min) / (max - min)
- Scale to [0, 1] where 1 is ideal
- Enables fair aggregation

### Target Comparison

Objectives can specify targets:
- **min**: Minimum acceptable value
- **ideal**: Target value
- **max**: Maximum acceptable value

Results indicate whether targets are met.

## Adoption Impact

The Objectives Framework enables:
- ✅ Fair solver competitions
- ✅ Consistent research benchmarks
- ✅ Multi-criteria optimization
- ✅ Data-driven league decisions
- ✅ Transparent quality measurement

---

**Enables consistent optimization comparison.**
