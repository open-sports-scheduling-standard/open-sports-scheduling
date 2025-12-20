# OSSS Objectives & Optimization

## Overview

Objectives define the optimization goals for schedule generation. While hard constraints establish feasibility, objectives guide the solver toward preferable solutions among valid schedules.

OSSS separates **feasibility** (hard constraints) from **optimization** (objectives + soft constraints), allowing solvers to:
1. First find any feasible solution
2. Then optimize toward stated objectives
3. Report clear trade-offs between competing goals

---

## Objective Model

An objective defines a metric to optimize and how to aggregate it across entities.

### Objective Object

```json
{
  "metric": "travel_distance_km",
  "aggregation": "sum",
  "weight": 1.0,
  "direction": "minimize",
  "selector": { "entityType": "team" },
  "constraints": {
    "max_value": 50000
  }
}
```

### Objective Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `metric` | string | Yes | Metric name (see Standard Metrics) |
| `aggregation` | string | Yes | How to combine values (sum, avg, max, etc.) |
| `weight` | number | Yes | Relative importance (positive number) |
| `direction` | string | No | "minimize" or "maximize" (default: "minimize") |
| `selector` | object | No | Limit to subset of entities (default: all) |
| `constraints` | object | No | Hard limits on objective value |
| `enabled` | boolean | No | Whether objective is active (default: true) |

---

## Standard Metrics

### Travel & Distance

#### `travel_distance_km`
Total travel distance for away games.

**Calculation:**
```
For each team:
  For each consecutive away game pair:
    distance += haversine(game1.venue, game2.venue)
```

**Example:**
```json
{
  "metric": "travel_distance_km",
  "aggregation": "sum",
  "weight": 1.0,
  "direction": "minimize"
}
```

---

#### `max_single_trip_km`
Longest single trip distance.

**Calculation:**
```
For each team:
  max_trip = max(distance from home to each away venue)
```

**Example:**
```json
{
  "metric": "max_single_trip_km",
  "aggregation": "max",
  "weight": 0.5,
  "direction": "minimize",
  "constraints": {
    "max_value": 1000
  }
}
```

---

### Rest & Workload

#### `rest_violation_hours`
Total hours of rest time violations below minimum threshold.

**Calculation:**
```
For each team:
  For each consecutive game pair:
    if rest < min_hours:
      violation += (min_hours - rest)
```

**Example:**
```json
{
  "metric": "rest_violation_hours",
  "aggregation": "sum",
  "weight": 100.0,
  "direction": "minimize",
  "selector": {
    "entityType": "team",
    "tags": ["youth"]
  }
}
```

---

#### `workload_variance`
Variance in games per week across teams.

**Calculation:**
```
variance = std_dev(games_per_week for all teams)
```

**Example:**
```json
{
  "metric": "workload_variance",
  "aggregation": "value",
  "weight": 5.0,
  "direction": "minimize"
}
```

---

### Fairness

#### `home_away_delta`
Absolute difference between home and away games per team.

**Calculation:**
```
For each team:
  delta = abs(home_games - away_games)
```

**Example:**
```json
{
  "metric": "home_away_delta",
  "aggregation": "max",
  "weight": 10.0,
  "direction": "minimize"
}
```

---

#### `strength_of_schedule_variance`
Variance in opponent strength across teams.

**Calculation:**
```
For each team:
  avg_opponent_strength = avg(opponent.strength for all games)
variance = std_dev(avg_opponent_strength across all teams)
```

**Example:**
```json
{
  "metric": "strength_of_schedule_variance",
  "aggregation": "value",
  "weight": 3.0,
  "direction": "minimize"
}
```

---

### Broadcasting & Revenue

#### `prime_time_games`
Number of games in prime broadcast windows.

**Calculation:**
```
count = games scheduled within broadcast windows
```

**Example:**
```json
{
  "metric": "prime_time_games",
  "aggregation": "sum",
  "weight": 20.0,
  "direction": "maximize",
  "selector": {
    "entityType": "fixture",
    "tags": ["featured", "rivalry"]
  }
}
```

---

#### `venue_utilization`
Percentage of venue capacity used.

**Calculation:**
```
For each venue:
  utilization = (hours_scheduled / hours_available)
```

**Example:**
```json
{
  "metric": "venue_utilization",
  "aggregation": "average",
  "weight": 2.0,
  "direction": "maximize"
}
```

---

### Schedule Quality

#### `back_to_back_games`
Count of back-to-back game days for teams.

**Calculation:**
```
For each team:
  count += games on consecutive days
```

**Example:**
```json
{
  "metric": "back_to_back_games",
  "aggregation": "sum",
  "weight": 15.0,
  "direction": "minimize"
}
```

---

#### `weekend_game_distribution`
Even distribution of weekend games across teams.

**Calculation:**
```
For each team:
  weekend_games = count(games on Sat/Sun)
variance = std_dev(weekend_games across teams)
```

**Example:**
```json
{
  "metric": "weekend_game_distribution",
  "aggregation": "value",
  "weight": 5.0,
  "direction": "minimize"
}
```

---

## Aggregation Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| `sum` | Total across all entities | Total travel distance |
| `average` | Mean value | Average games per team |
| `max` | Maximum value | Worst-case scenario (minimax) |
| `min` | Minimum value | Best-case scenario |
| `minimax` | Minimize the maximum | Fairness optimization |
| `maximin` | Maximize the minimum | Equity optimization |
| `variance` | Statistical variance | Consistency |
| `std_dev` | Standard deviation | Balance |
| `value` | Direct value (no aggregation) | Single-value metrics |

---

## Multi-Objective Optimization

### Weighted Sum Approach

Most common: combine objectives using weights.

```json
{
  "objectives": [
    {
      "metric": "travel_distance_km",
      "aggregation": "sum",
      "weight": 1.0
    },
    {
      "metric": "home_away_delta",
      "aggregation": "max",
      "weight": 10.0
    }
  ]
}
```

**Total score:**
```
score = (1.0 * travel_distance) + (10.0 * home_away_delta)
```

### Lexicographic Optimization

Optimize objectives in priority order.

```json
{
  "objectives": [
    {
      "metric": "rest_violation_hours",
      "aggregation": "sum",
      "weight": 100.0,
      "priority": 1
    },
    {
      "metric": "travel_distance_km",
      "aggregation": "sum",
      "weight": 1.0,
      "priority": 2
    }
  ]
}
```

Solver optimizes priority 1 first, then priority 2 without degrading priority 1.

### Pareto Optimization

Generate multiple solutions on Pareto frontier.

```json
{
  "optimization_mode": "pareto",
  "objectives": [
    {
      "metric": "travel_distance_km",
      "aggregation": "sum",
      "weight": 1.0
    },
    {
      "metric": "prime_time_games",
      "aggregation": "sum",
      "weight": 1.0,
      "direction": "maximize"
    }
  ],
  "pareto_config": {
    "max_solutions": 10
  }
}
```

---

## Objective Validation

Objectives are validated for:

1. **Metric existence**: Metric must be registered or standard
2. **Aggregation compatibility**: Aggregation must be valid for metric type
3. **Weight validity**: Weight must be positive number
4. **Selector validity**: Selector must reference valid entities
5. **Constraint feasibility**: Hard limits must be achievable
6. **No conflicts**: Objectives shouldn't directly contradict

**Invalid examples:**

```json
// Invalid: negative weight
{
  "metric": "travel_distance_km",
  "aggregation": "sum",
  "weight": -1.0
}

// Invalid: incompatible aggregation
{
  "metric": "travel_distance_km",
  "aggregation": "variance",
  "weight": 1.0
}
```

---

## Penalty-Based Soft Constraints

Soft constraints can be expressed as penalty objectives.

### Soft Constraint as Penalty

```json
{
  "id": "prefer_min_rest",
  "type": "soft",
  "rule": "min_rest_time",
  "selector": { "entityType": "team" },
  "params": { "min_hours": 48 },
  "penalty": {
    "model": "linear",
    "weight": 5.0
  }
}
```

### Equivalent Objective

```json
{
  "metric": "rest_violation_hours",
  "aggregation": "sum",
  "weight": 5.0,
  "params": {
    "min_hours": 48
  }
}
```

Both approaches are valid. Use soft constraints for reusable rules, objectives for custom metrics.

---

## Normalization

When combining objectives with different scales, normalize values:

```json
{
  "objectives": [
    {
      "metric": "travel_distance_km",
      "aggregation": "sum",
      "weight": 1.0,
      "normalization": {
        "method": "min_max",
        "min": 0,
        "max": 100000
      }
    },
    {
      "metric": "home_away_delta",
      "aggregation": "max",
      "weight": 1.0,
      "normalization": {
        "method": "min_max",
        "min": 0,
        "max": 10
      }
    }
  ]
}
```

**Normalization methods:**
- `min_max`: `(value - min) / (max - min)`
- `z_score`: `(value - mean) / std_dev`
- `log`: `log(value + 1)`
- `none`: No normalization (default)

---

## Reporting

Solvers MUST report objective values for transparency:

```json
{
  "objectives": [
    {
      "metric": "travel_distance_km",
      "value": 45230.5,
      "normalized_value": 0.452,
      "contribution": 0.452
    },
    {
      "metric": "home_away_delta",
      "value": 2,
      "normalized_value": 0.2,
      "contribution": 0.2
    }
  ],
  "total_score": 0.652
}
```

This allows users to understand trade-offs and validate solver behavior.

---

## Custom Metrics

Implementations MAY define custom metrics. Custom metrics MUST document:

1. **Metric name** and version
2. **Calculation method** (pseudo-code or formula)
3. **Value range** (min/max expected values)
4. **Compatible aggregations**
5. **Test cases** with expected values

**Example custom metric:**

```json
{
  "custom_metrics": [
    {
      "name": "rivalry_game_spacing",
      "version": "1.0.0",
      "description": "Days between games against rivalry opponents",
      "calculation": "min(days_between_rivalry_games)",
      "value_range": {
        "min": 0,
        "max": 180
      },
      "compatible_aggregations": ["min", "max", "average"]
    }
  ]
}
```
