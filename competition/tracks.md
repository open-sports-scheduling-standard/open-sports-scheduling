# OSSS Competition Tracks

Competition tracks are designed to cover different difficulty levels and real-world scenarios. Each track has specific characteristics, constraints, and objectives.

---

## Track 1: Youth League Optimization ⭐⭐

**Target Audience**: Beginners, students, newcomers to sports scheduling
**Real-World Application**: U8-U18 recreational leagues, school sports

### Problem Characteristics

- **Teams**: 8-16 teams
- **Season Length**: 10-20 weeks
- **Fixtures per Team**: 10-15 games
- **Venues**: 3-6 shared facilities
- **Complexity**: Low to moderate

### Required Constraints

```json
{
  "required": [
    {
      "ruleId": "no_overlap_team",
      "type": "hard"
    },
    {
      "ruleId": "no_overlap_venue_resource",
      "type": "hard"
    },
    {
      "ruleId": "min_rest_time",
      "type": "hard",
      "params": { "min_hours": 72 }
    },
    {
      "ruleId": "max_games_per_day",
      "type": "hard",
      "params": { "max_games": 1 }
    },
    {
      "ruleId": "venue_availability",
      "type": "hard"
    }
  ]
}
```

### Optimization Objectives

| Objective | Weight | Target |
|-----------|--------|--------|
| total_travel_distance | 40% | < 5000 km |
| home_away_balance | 30% | max delta = 1 |
| rest_time_average | 30% | > 96 hours |

### Scoring Formula

```
score = 0.4 × travel_penalty + 0.3 × fairness_penalty + 0.3 × welfare_penalty
```

Lower score is better.

### Sample Instance

Available at: `competition/tracks/track-1-youth/sample-instance.json`

### Difficulty Notes

- Generous rest periods make feasibility easier
- Limited fixtures reduce complexity
- Focus is on basic optimization
- Good entry point for learning

---

## Track 2: Amateur League Optimization ⭐⭐⭐

**Target Audience**: Intermediate participants, commercial vendors
**Real-World Application**: Community leagues, semi-pro sports, college athletics

### Problem Characteristics

- **Teams**: 12-24 teams
- **Season Length**: 16-30 weeks
- **Fixtures per Team**: 20-35 games
- **Venues**: 5-12 shared facilities
- **Complexity**: Moderate

### Required Constraints

```json
{
  "required": [
    {
      "ruleId": "no_overlap_team",
      "type": "hard"
    },
    {
      "ruleId": "no_overlap_venue_resource",
      "type": "hard"
    },
    {
      "ruleId": "min_rest_time",
      "type": "hard",
      "params": { "min_hours": 48 }
    },
    {
      "ruleId": "venue_availability",
      "type": "hard"
    }
  ],
  "recommended": [
    {
      "ruleId": "home_away_balance",
      "type": "soft",
      "params": { "max_delta": 2 },
      "penalty": { "perViolation": 15 }
    },
    {
      "ruleId": "minimize_travel",
      "type": "soft",
      "penalty": { "perKm": 2 }
    },
    {
      "ruleId": "opponent_spacing",
      "type": "soft",
      "params": { "min_days": 14 },
      "penalty": { "perViolation": 8 }
    }
  ]
}
```

### Optimization Objectives

| Objective | Weight | Target |
|-----------|--------|--------|
| total_travel_distance | 35% | < 15000 km |
| home_away_balance | 35% | max delta = 2 |
| schedule_compactness | 30% | < 180 days |

### Scoring Formula

```
score = 0.35 × travel_penalty + 0.35 × fairness_penalty + 0.30 × quality_penalty
```

### Sample Instance

Available at: `competition/tracks/track-2-amateur/sample-instance.json`

### Difficulty Notes

- Tighter rest periods increase constraint density
- More fixtures create scheduling challenges
- Venue sharing introduces complexity
- Balance between multiple objectives

---

## Track 3: Professional League Optimization ⭐⭐⭐⭐

**Target Audience**: Advanced practitioners, research teams, commercial vendors
**Real-World Application**: Professional sports leagues, elite competitions

### Problem Characteristics

- **Teams**: 16-32 teams
- **Season Length**: 30-40 weeks
- **Fixtures per Team**: 30-60 games
- **Venues**: 16-32 (often team-specific)
- **Complexity**: High

### Required Constraints

```json
{
  "required": [
    {
      "ruleId": "no_overlap_team",
      "type": "hard"
    },
    {
      "ruleId": "no_overlap_venue_resource",
      "type": "hard"
    },
    {
      "ruleId": "min_rest_time",
      "type": "hard",
      "params": { "min_hours": 48 }
    },
    {
      "ruleId": "broadcast_window",
      "type": "hard",
      "params": {
        "allowed_windows": [
          {
            "dayOfWeek": "saturday",
            "startTime": "19:00",
            "endTime": "21:00"
          },
          {
            "dayOfWeek": "sunday",
            "startTime": "14:00",
            "endTime": "16:00"
          }
        ]
      }
    },
    {
      "ruleId": "venue_availability",
      "type": "hard"
    }
  ],
  "recommended": [
    {
      "ruleId": "home_away_balance",
      "type": "soft",
      "params": { "max_delta": 1 },
      "penalty": { "perViolation": 100 }
    },
    {
      "ruleId": "opponent_spacing",
      "type": "soft",
      "params": { "min_days": 7 },
      "penalty": { "perViolation": 50 }
    },
    {
      "ruleId": "home_streak_length",
      "type": "soft",
      "params": { "max_streak": 3 },
      "penalty": { "perViolation": 75 }
    }
  ]
}
```

### Optimization Objectives

| Objective | Weight | Target |
|-----------|--------|--------|
| home_away_balance | 40% | max delta = 0 |
| primetime_distribution | 35% | std dev < 2 |
| total_travel_distance | 25% | < 50000 km |

### Scoring Formula

```
score = 0.40 × fairness_penalty + 0.35 × broadcast_penalty + 0.25 × travel_penalty
```

### Sample Instance

Available at: `competition/tracks/track-3-professional/sample-instance.json`

### Difficulty Notes

- Broadcast windows severely constrain feasibility
- High fairness requirements
- Large number of fixtures
- Multiple competing objectives
- Common infeasibility issues

---

## Track 4: Multi-Division Coordination ⭐⭐⭐⭐⭐

**Target Audience**: Expert practitioners, research institutions
**Real-World Application**: Federations, multi-tier league systems, regional coordination

### Problem Characteristics

- **Teams**: 40-60 across 3-4 divisions
- **Season Length**: 30-40 weeks
- **Fixtures per Team**: 25-50 games
- **Venues**: 20-40 shared across divisions
- **Complexity**: Very high

### Required Constraints

```json
{
  "required": [
    {
      "ruleId": "no_overlap_team",
      "type": "hard",
      "selector": "*"
    },
    {
      "ruleId": "no_overlap_venue_resource",
      "type": "hard",
      "selector": "*"
    },
    {
      "ruleId": "min_rest_time",
      "type": "hard",
      "params": { "min_hours": 48 },
      "selector": { "division": "premier" }
    },
    {
      "ruleId": "min_rest_time",
      "type": "hard",
      "params": { "min_hours": 72 },
      "selector": { "division": "youth" }
    },
    {
      "ruleId": "venue_availability",
      "type": "hard"
    },
    {
      "ruleId": "cross_division_spacing",
      "type": "hard",
      "params": { "min_hours": 4 }
    }
  ]
}
```

### Optimization Objectives

| Objective | Weight | Target |
|-----------|--------|--------|
| venue_balance | 30% | std dev < 3 |
| home_away_balance | 35% | max delta ≤ 2 |
| total_travel_distance | 35% | varies by division |

### Scoring Formula

```
score = 0.30 × venue_penalty + 0.35 × fairness_penalty + 0.35 × travel_penalty
```

### Sample Instance

Available at: `competition/tracks/track-4-multi-division/sample-instance.json`

### Difficulty Notes

- Cross-division resource conflicts
- Division-specific constraint variants
- Massive search space
- Scalability critical
- Selector DSL v2 essential

---

## Track Selection Guide

| If you are... | Start with... | Then try... |
|---------------|---------------|-------------|
| **New to sports scheduling** | Track 1 (Youth) | Track 2 (Amateur) |
| **Commercial vendor** | Track 2 (Amateur) | Track 3 (Professional) |
| **Academic researcher** | Track 3 (Professional) | Track 4 (Multi-Division) |
| **Expert optimizer** | Track 3 (Professional) | Track 4 (Multi-Division) |
| **Learning OSSS** | Track 1 (Youth) | All tracks |

---

## Baseline Performance

Provided for each track:
- **Naive baseline**: Simple greedy algorithm
- **Reference solution**: Baseline solver performance
- **State-of-the-art**: Current best known result

Participants aim to beat these benchmarks.

---

## Adding New Tracks

Tracks evolve based on:
- Community feedback
- New real-world scenarios
- Research advances
- Technology changes

Proposals welcome via GitHub issues.

---

**Choose your challenge level and compete!**
