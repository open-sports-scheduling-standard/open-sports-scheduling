# OSSS Results & Explainability

## Overview

Results represent the output of a scheduling solver. OSSS emphasizes **explainability** and **auditability**, requiring solvers to not only produce schedules but also explain their reasoning and trade-offs.

---

## Results Object

A complete OSSS result includes the schedule and comprehensive metadata.

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `version` | string | OSSS results spec version (e.g., "0.1.0") |
| `instance_id` | string | Reference to the OSSS instance |
| `solver_info` | object | Solver identification and configuration |
| `generation_time` | ISO-8601 | When the schedule was generated |
| `computation_time_ms` | number | Total solver runtime in milliseconds |
| `feasible` | boolean | Whether all hard constraints are satisfied |
| `assignments` | array | The proposed schedule |
| `constraint_reports` | array | Detailed constraint violation reports |
| `objective_scores` | array | Objective metric values |
| `total_score` | number | Combined objective score |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `warnings` | array | Non-fatal issues or warnings |
| `metadata` | object | Solver-specific metadata |
| `alternative_solutions` | array | Other feasible solutions (Pareto front) |
| `diff` | object | Changes from previous schedule version |

### Complete Example

```json
{
  "version": "0.1.0",
  "instance_id": "nba-2025-regular",
  "solver_info": {
    "name": "OptimalScheduler",
    "version": "2.1.0",
    "algorithm": "constraint_programming",
    "config": {
      "time_limit_seconds": 3600,
      "optimality_gap": 0.05
    }
  },
  "generation_time": "2025-01-15T14:30:00Z",
  "computation_time_ms": 245820,
  "feasible": true,
  "assignments": [ ... ],
  "constraint_reports": [ ... ],
  "objective_scores": [ ... ],
  "total_score": 1247.5,
  "warnings": []
}
```

---

## Solver Info

Identifies the solver and its configuration for reproducibility.

```json
{
  "name": "OptimalScheduler",
  "version": "2.1.0",
  "vendor": "SCORE Systems",
  "algorithm": "constraint_programming",
  "config": {
    "time_limit_seconds": 3600,
    "optimality_gap": 0.05,
    "random_seed": 42
  },
  "environment": {
    "os": "linux",
    "cores": 16,
    "memory_gb": 64
  }
}
```

**Solver Info Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Solver name |
| `version` | string | Solver version |
| `vendor` | string | Vendor or author |
| `algorithm` | string | Primary algorithm type |
| `config` | object | Configuration parameters |
| `environment` | object | Runtime environment details |

---

## Assignments

The actual schedule. See osss-core.md for assignment object structure.

```json
{
  "assignments": [
    {
      "fixtureId": "game-001",
      "startTime": "2025-03-27T19:30:00-04:00",
      "endTime": "2025-03-27T22:00:00-04:00",
      "venueId": "venue-staples",
      "resources": [
        {
          "type": "official",
          "ids": ["ref-001", "ref-002", "ref-003"]
        }
      ]
    }
  ]
}
```

---

## Constraint Reports

Detailed reporting for each constraint, showing compliance or violations.

### Constraint Report Object

```json
{
  "constraint_id": "min_rest_72h",
  "constraint_type": "hard",
  "satisfied": false,
  "violation_count": 3,
  "violations": [
    {
      "entity_id": "team-lakers",
      "description": "Team 'team-lakers' rest violation: 48.00h between 'game-012' and 'game-015' (min 72h)",
      "severity": "error",
      "fixtures": ["game-012", "game-015"],
      "actual_value": 48.0,
      "required_value": 72.0,
      "delta": 24.0
    },
    {
      "entity_id": "team-celtics",
      "description": "Team 'team-celtics' rest violation: 60.00h between 'game-024' and 'game-028' (min 72h)",
      "severity": "error",
      "fixtures": ["game-024", "game-028"],
      "actual_value": 60.0,
      "required_value": 72.0,
      "delta": 12.0
    }
  ],
  "penalty_score": null,
  "computation_time_ms": 142
}
```

### Soft Constraint Report

For soft constraints, include penalty calculation:

```json
{
  "constraint_id": "home_away_balance",
  "constraint_type": "soft",
  "satisfied": false,
  "violation_count": 5,
  "violations": [
    {
      "entity_id": "team-warriors",
      "description": "Home/away imbalance: 45 home vs 37 away games (delta: 8, max: 2)",
      "severity": "warning",
      "actual_value": 8,
      "required_value": 2,
      "delta": 6
    }
  ],
  "penalty_score": 360.0,
  "penalty_calculation": {
    "model": "quadratic",
    "weight": 10.0,
    "formula": "sum((delta - max_delta)^2 * weight)",
    "breakdown": [
      {
        "entity_id": "team-warriors",
        "violation": 6,
        "penalty": 360.0
      }
    ]
  },
  "computation_time_ms": 89
}
```

### Constraint Report Fields

| Field | Type | Description |
|-------|------|-------------|
| `constraint_id` | string | Reference to constraint |
| `constraint_type` | string | "hard" or "soft" |
| `satisfied` | boolean | Whether constraint is satisfied |
| `violation_count` | number | Number of violations |
| `violations` | array | Detailed violation list |
| `penalty_score` | number | Total penalty (soft only) |
| `penalty_calculation` | object | Penalty breakdown (soft only) |
| `computation_time_ms` | number | Time to evaluate constraint |

### Violation Object

| Field | Type | Description |
|-------|------|-------------|
| `entity_id` | string | Entity involved in violation |
| `description` | string | Human-readable explanation |
| `severity` | string | "error", "warning", or "info" |
| `fixtures` | array | Related fixture IDs |
| `actual_value` | number | Actual measured value |
| `required_value` | number | Required value |
| `delta` | number | Difference (actual - required) |
| `metadata` | object | Additional context |

---

## Objective Scores

Report on optimization objective achievement.

```json
{
  "objective_scores": [
    {
      "metric": "travel_distance_km",
      "aggregation": "sum",
      "value": 45230.5,
      "normalized_value": 0.452,
      "weight": 1.0,
      "contribution": 0.452,
      "breakdown_by_entity": [
        {
          "entity_id": "team-lakers",
          "value": 12450.3
        },
        {
          "entity_id": "team-celtics",
          "value": 15890.7
        }
      ]
    },
    {
      "metric": "home_away_delta",
      "aggregation": "max",
      "value": 8,
      "normalized_value": 0.8,
      "weight": 10.0,
      "contribution": 8.0,
      "worst_entity": "team-warriors"
    }
  ],
  "total_score": 8.452,
  "score_breakdown": {
    "hard_constraint_penalties": 0,
    "soft_constraint_penalties": 360.0,
    "objective_scores": 8.452
  }
}
```

---

## Feasibility

The `feasible` flag indicates whether all hard constraints are satisfied.

```json
{
  "feasible": true,
  "feasibility_report": {
    "total_hard_constraints": 15,
    "satisfied_hard_constraints": 15,
    "violated_hard_constraints": 0,
    "infeasibility_reason": null
  }
}
```

### When Infeasible

```json
{
  "feasible": false,
  "feasibility_report": {
    "total_hard_constraints": 15,
    "satisfied_hard_constraints": 12,
    "violated_hard_constraints": 3,
    "infeasibility_reason": "Unable to satisfy 'min_rest_72h' constraint for 3 teams given time window and fixture density",
    "conflicting_constraints": ["min_rest_72h", "weekend_only"],
    "suggestions": [
      "Reduce minimum rest time from 72h to 60h",
      "Extend season window by 2 weeks",
      "Reduce number of fixtures"
    ]
  }
}
```

---

## Entity-Level Reports

### Team Report

Detailed per-team analysis:

```json
{
  "team_reports": [
    {
      "entity_id": "team-lakers",
      "games_played": 82,
      "home_games": 41,
      "away_games": 41,
      "travel_distance_km": 12450.3,
      "back_to_back_count": 15,
      "rest_violations": [
        {
          "fixture_pair": ["game-012", "game-015"],
          "rest_hours": 48.0,
          "min_required": 72.0
        }
      ],
      "average_rest_days": 2.1,
      "weekend_games": 32,
      "prime_time_games": 28,
      "constraint_violations": 1,
      "soft_penalty_total": 45.0
    }
  ]
}
```

### Venue Report

Detailed per-venue analysis:

```json
{
  "venue_reports": [
    {
      "entity_id": "venue-staples",
      "games_hosted": 82,
      "utilization_percent": 72.5,
      "available_hours": 4380,
      "scheduled_hours": 3175,
      "turnaround_violations": 0,
      "blackout_conflicts": 0,
      "busiest_day": {
        "date": "2025-04-15",
        "games": 2
      }
    }
  ]
}
```

---

## Warnings

Non-fatal issues that don't violate constraints but may need attention.

```json
{
  "warnings": [
    {
      "code": "UNBALANCED_SCHEDULE",
      "severity": "warning",
      "message": "Team 'team-warriors' has 8-game home/away imbalance (exceeds soft constraint by 6)",
      "entity_id": "team-warriors",
      "suggestion": "Consider redistributing fixtures to improve balance"
    },
    {
      "code": "HIGH_TRAVEL_WEEK",
      "severity": "info",
      "message": "Team 'team-lakers' has 3 away games in week of 2025-05-12 with total travel 2,450 km",
      "entity_id": "team-lakers",
      "timeframe": {
        "start": "2025-05-12T00:00:00-04:00",
        "end": "2025-05-18T23:59:59-04:00"
      }
    }
  ]
}
```

### Warning Codes

| Code | Severity | Description |
|------|----------|-------------|
| `UNBALANCED_SCHEDULE` | warning | Significant home/away imbalance |
| `HIGH_TRAVEL_WEEK` | info | Unusually high travel in short period |
| `BACK_TO_BACK_CLUSTER` | warning | Multiple back-to-back games in sequence |
| `LOW_REST_PERIOD` | warning | Rest below recommended (but above minimum) |
| `VENUE_UNDERUTILIZED` | info | Venue scheduled below target utilization |
| `SUBOPTIMAL_OBJECTIVE` | info | Objective far from theoretical optimum |

---

## Versioning & Diffs

OSSS results support immutable versioning for change tracking.

### Version Metadata

```json
{
  "version_info": {
    "version_id": "v3",
    "previous_version_id": "v2",
    "created_at": "2025-01-15T14:30:00Z",
    "created_by": "scheduler-admin",
    "reason": "Accommodate venue blackout on 2025-06-15",
    "locked": false
  }
}
```

### Diff Report

```json
{
  "diff": {
    "from_version": "v2",
    "to_version": "v3",
    "changed_assignments": 12,
    "changes": [
      {
        "type": "modified",
        "fixture_id": "game-045",
        "field": "startTime",
        "old_value": "2025-06-15T19:30:00-04:00",
        "new_value": "2025-06-16T19:30:00-04:00",
        "reason": "Venue blackout conflict"
      },
      {
        "type": "modified",
        "fixture_id": "game-046",
        "field": "venueId",
        "old_value": "venue-staples",
        "new_value": "venue-forum",
        "reason": "Cascade from game-045 change"
      }
    ],
    "impact_summary": {
      "teams_affected": 8,
      "venues_affected": 3,
      "score_delta": -15.3,
      "new_violations": 0,
      "resolved_violations": 1
    }
  }
}
```

---

## Comparison Reports

When comparing multiple solver outputs:

```json
{
  "comparison": {
    "solutions": [
      {
        "solver": "OptimalScheduler v2.1",
        "feasible": true,
        "total_score": 1247.5,
        "computation_time_ms": 245820,
        "rank": 1
      },
      {
        "solver": "FastScheduler v1.0",
        "feasible": true,
        "total_score": 1389.2,
        "computation_time_ms": 45100,
        "rank": 2
      }
    ],
    "metric_comparison": [
      {
        "metric": "travel_distance_km",
        "solutions": [
          { "solver": "OptimalScheduler v2.1", "value": 45230.5 },
          { "solver": "FastScheduler v1.0", "value": 48900.1 }
        ]
      },
      {
        "metric": "home_away_delta",
        "solutions": [
          { "solver": "OptimalScheduler v2.1", "value": 8 },
          { "solver": "FastScheduler v1.0", "value": 6 }
        ]
      }
    ],
    "pareto_analysis": {
      "dominated": ["FastScheduler v1.0"],
      "non_dominated": ["OptimalScheduler v2.1"]
    }
  }
}
```

---

## Validation Report

Results from OSSS validator:

```json
{
  "validation": {
    "valid": true,
    "schema_version": "0.1.0",
    "validated_at": "2025-01-15T15:00:00Z",
    "validator_version": "0.1.0",
    "checks": [
      {
        "check": "schema_compliance",
        "passed": true
      },
      {
        "check": "referential_integrity",
        "passed": true
      },
      {
        "check": "constraint_evaluation",
        "passed": true,
        "details": {
          "hard_constraints_satisfied": 15,
          "soft_constraints_evaluated": 8
        }
      },
      {
        "check": "objective_calculation",
        "passed": true,
        "details": {
          "objectives_verified": 3,
          "score_matches": true
        }
      }
    ],
    "errors": [],
    "warnings": []
  }
}
```

---

## Explainability Requirements

OSSS requires solvers to provide explanations for:

1. **Hard constraint violations**: Why each violation occurred
2. **Soft constraint trade-offs**: Why solver chose certain violations
3. **Objective trade-offs**: How objectives compete
4. **Scheduling decisions**: Why specific assignments were made
5. **Infeasibility**: Why no feasible solution exists (if applicable)

### Example Explanation

```json
{
  "explanations": [
    {
      "type": "assignment_rationale",
      "fixture_id": "game-045",
      "explanation": "Scheduled at 2025-06-16T19:30:00 (not preferred 2025-06-15T19:30:00) due to venue blackout. This choice minimizes travel disruption for subsequent games.",
      "factors": [
        {
          "factor": "venue_availability",
          "impact": "forced_change",
          "details": "Venue staples has blackout 2025-06-15"
        },
        {
          "factor": "travel_optimization",
          "impact": "medium",
          "details": "Moving to 2025-06-16 reduces total team travel by 230km"
        }
      ]
    }
  ]
}
```

---

## Best Practices

1. **Always report computation time** for reproducibility
2. **Include solver configuration** for transparency
3. **Provide entity-level breakdowns** for auditability
4. **Explain violations** with human-readable messages
5. **Version all schedules** for change tracking
6. **Report warnings proactively** for potential issues
7. **Enable comparisons** by using standard metrics
8. **Document trade-offs** between competing objectives
