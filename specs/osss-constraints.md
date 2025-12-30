# OSSS Constraint Framework

## Overview
Constraints define the rules and preferences that govern schedule generation. They are the primary mechanism for expressing scheduling requirements, from absolute prohibitions (hard constraints) to preferences (soft constraints).

---

## Constraint Object

Each constraint MUST define:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier for this constraint |
| `type` | enum | Yes | Either `"hard"` (must be satisfied) or `"soft"` (preference) |
| `rule` | string | Yes | Registered rule name (e.g., `"min_rest_time"`) |
| `selector` | object | Yes | Defines which entities/fixtures this constraint applies to |
| `params` | object | Varies | Rule-specific parameters |
| `penalty` | object | If soft | Penalty model for soft constraints |
| `priority` | number | No | Priority level for constraint processing (default: 0) |
| `enabled` | boolean | No | Whether constraint is active (default: true) |
| `tags` | string[] | No | Metadata tags for grouping/filtering |

### Example
```json
{
  "id": "min_rest_72h",
  "type": "hard",
  "rule": "min_rest_time",
  "selector": { "entityType": "team" },
  "params": { "min_hours": 72 },
  "priority": 1,
  "enabled": true,
  "tags": ["health", "player-welfare"]
}
```

---

## Selector Model

Targets subsets of entities or fixtures. Multiple selector types can be combined using `and`/`or` logic.

### Selector Types

#### By Entity Type
```json
{
  "entityType": "team"
}
```

#### By ID
```json
{
  "entityType": "team",
  "ids": ["team-A", "team-B", "team-C"]
}
```

#### By Tag
```json
{
  "entityType": "team",
  "tags": ["division-1", "youth"]
}
```

#### By Division
```json
{
  "entityType": "team",
  "division": "premier-league"
}
```

#### By Date Range
```json
{
  "entityType": "fixture",
  "dateRange": {
    "start": "2025-03-01T00:00:00Z",
    "end": "2025-03-31T23:59:59Z"
  }
}
```

#### Compound Selectors
```json
{
  "and": [
    { "entityType": "team", "tags": ["division-1"] },
    { "entityType": "team", "ids": ["team-A", "team-B"] }
  ]
}
```

---

## Penalty Models

Soft constraints MUST define a penalty model that quantifies how "bad" a violation is.

### Linear Penalty
Penalty increases proportionally with violation amount.

```json
{
  "model": "linear",
  "weight": 1.0,
  "threshold": 0
}
```

**Formula:** `penalty = max(0, violation - threshold) * weight`

### Quadratic Penalty
Penalty increases quadratically, making large violations much worse.

```json
{
  "model": "quadratic",
  "weight": 0.5,
  "exponent": 2.0
}
```

**Formula:** `penalty = (violation ^ exponent) * weight`

### Step Penalty
Fixed penalty once threshold is crossed.

```json
{
  "model": "step",
  "weight": 100.0,
  "threshold": 5
}
```

**Formula:** `penalty = (violation > threshold) ? weight : 0`

### Piecewise Penalty
Different penalties for different ranges.

```json
{
  "model": "piecewise",
  "brackets": [
    { "max": 10, "weight": 1.0 },
    { "max": 20, "weight": 2.0 },
    { "max": null, "weight": 5.0 }
  ]
}
```

---

## Constraint Categories

### Feasibility Constraints

#### `no_overlap_team`
**Type:** Hard
**Purpose:** Ensures a team cannot play two games simultaneously.

**Parameters:** None

**Example:**
```json
{
  "id": "no_team_overlap",
  "type": "hard",
  "rule": "no_overlap_team",
  "selector": { "entityType": "team" }
}
```

**Validation:** For each team, verify no assignments overlap in time.

---

#### `no_overlap_venue_resource`
**Type:** Hard
**Purpose:** Ensures a venue or resource is only used by one fixture at a time.

**Parameters:**
- `resourceType` (optional): Specific resource type to check (e.g., "field", "court")

**Example:**
```json
{
  "id": "no_venue_overlap",
  "type": "hard",
  "rule": "no_overlap_venue_resource",
  "selector": { "entityType": "venue" },
  "params": { "resourceType": "field" }
}
```

---

### Time & Rest Constraints

#### `min_rest_time`
**Type:** Hard or Soft
**Purpose:** Enforces minimum rest period between consecutive games for a team.

**Parameters:**
- `min_hours` (required): Minimum hours of rest required

**Example:**
```json
{
  "id": "min_rest_72h",
  "type": "hard",
  "rule": "min_rest_time",
  "selector": { "entityType": "team" },
  "params": { "min_hours": 72 }
}
```

**Violation Calculation:**
```
rest_time = next_game.start - prev_game.end
violation_hours = max(0, min_hours - rest_time_hours)
```

**Use Cases:**
- Player health and safety regulations
- Youth league rest requirements
- Travel recovery time
- Competitive fairness

---

#### `max_games_per_day`
**Type:** Hard or Soft
**Purpose:** Limits number of games a team can play on the same day.

**Parameters:**
- `max_games` (required): Maximum games per day
- `timezone` (optional): Timezone for day calculation (defaults to instance timezone)

**Example:**
```json
{
  "id": "one_game_per_day",
  "type": "hard",
  "rule": "max_games_per_day",
  "selector": { "entityType": "team" },
  "params": { "max_games": 1 }
}
```

---

#### `max_games_per_week`
**Type:** Hard or Soft
**Purpose:** Limits games in any rolling 7-day period.

**Parameters:**
- `max_games` (required): Maximum games in rolling week
- `week_start_day` (optional): Day week starts on (default: "Monday")

**Example:**
```json
{
  "id": "max_3_per_week",
  "type": "soft",
  "rule": "max_games_per_week",
  "selector": { "entityType": "team", "tags": ["youth"] },
  "params": { "max_games": 3 },
  "penalty": { "model": "linear", "weight": 50.0 }
}
```

---

### Venue Constraints

#### `venue_availability`
**Type:** Hard
**Purpose:** Restricts fixtures to venue availability windows.

**Parameters:**
- `availability_windows` (required): Array of time windows when venue is available

**Example:**
```json
{
  "id": "stadium_availability",
  "type": "hard",
  "rule": "venue_availability",
  "selector": { "entityType": "venue", "ids": ["stadium-a"] },
  "params": {
    "availability_windows": [
      {
        "days": ["Saturday", "Sunday"],
        "start_time": "10:00",
        "end_time": "22:00"
      }
    ]
  }
}
```

---

#### `venue_turnaround_time`
**Type:** Hard
**Purpose:** Enforces minimum time between fixtures at same venue for setup/cleanup.

**Parameters:**
- `min_minutes` (required): Minimum minutes between fixtures

**Example:**
```json
{
  "id": "venue_turnaround",
  "type": "hard",
  "rule": "venue_turnaround_time",
  "selector": { "entityType": "venue" },
  "params": { "min_minutes": 30 }
}
```

---

### Travel Constraints

#### `max_travel_distance`
**Type:** Soft
**Purpose:** Penalizes excessive travel distance between consecutive away games.

**Parameters:**
- `max_km` (required): Maximum distance threshold
- `method` (optional): Calculation method ("haversine", "road", default: "haversine")

**Example:**
```json
{
  "id": "limit_travel",
  "type": "soft",
  "rule": "max_travel_distance",
  "selector": { "entityType": "team" },
  "params": { "max_km": 500 },
  "penalty": { "model": "quadratic", "weight": 0.1, "exponent": 2 }
}
```

---

#### `minimize_travel`
**Type:** Soft
**Purpose:** Objective to minimize total travel distance.

**Parameters:**
- `method` (optional): Calculation method (default: "haversine")
- `per_km_cost` (optional): Cost per kilometer (default: 1.0)

**Example:**
```json
{
  "id": "minimize_travel",
  "type": "soft",
  "rule": "minimize_travel",
  "selector": { "entityType": "team" },
  "penalty": { "model": "linear", "weight": 1.0 }
}
```

---

### Fairness Constraints

#### `home_away_balance`
**Type:** Soft
**Purpose:** Ensures teams have roughly equal home and away games.

**Parameters:**
- `max_delta` (optional): Maximum acceptable difference (default: 1)
- `window_size` (optional): Rolling window size in games (default: entire season)

**Example:**
```json
{
  "id": "home_away_balance",
  "type": "soft",
  "rule": "home_away_balance",
  "selector": { "entityType": "team" },
  "params": { "max_delta": 2 },
  "penalty": { "model": "quadratic", "weight": 10.0 }
}
```

**Violation Calculation:**
```
delta = abs(home_games - away_games)
violation = max(0, delta - max_delta)
```

---

#### `opponent_spacing`
**Type:** Soft
**Purpose:** Ensures minimum gap between games against the same opponent.

**Parameters:**
- `min_games_between` (required): Minimum games before re-match
- `scope` (optional): "season" or "round_robin" (default: "season")

**Example:**
```json
{
  "id": "space_rematches",
  "type": "soft",
  "rule": "opponent_spacing",
  "selector": { "entityType": "team" },
  "params": { "min_games_between": 5 },
  "penalty": { "model": "linear", "weight": 5.0 }
}
```

---

### Broadcast Constraints

#### `broadcast_window`
**Type:** Hard or Soft
**Purpose:** Requires or prefers fixtures in specific time windows for broadcasting.

**Parameters:**
- `windows` (required): Array of broadcast windows
- `min_games` (optional): Minimum games in broadcast windows
- `max_games` (optional): Maximum games in broadcast windows

**Example:**
```json
{
  "id": "prime_time_broadcast",
  "type": "soft",
  "rule": "broadcast_window",
  "selector": { "entityType": "fixture", "tags": ["featured"] },
  "params": {
    "windows": [
      {
        "days": ["Saturday", "Sunday"],
        "start_time": "19:00",
        "end_time": "21:00"
      }
    ],
    "min_games": 2
  },
  "penalty": { "model": "linear", "weight": 20.0 }
}
```

---

### Officials Constraints

#### `official_availability`
**Type:** Hard
**Purpose:** Ensures officials are only assigned when available.

**Parameters:**
- `availability_windows` (required): Time windows when official is available

**Example:**
```json
{
  "id": "referee_availability",
  "type": "hard",
  "rule": "official_availability",
  "selector": { "entityType": "official" },
  "params": {
    "availability_windows": [
      {
        "start": "2025-03-01T00:00:00Z",
        "end": "2025-03-31T23:59:59Z"
      }
    ]
  }
}
```

---

#### `conflict_of_interest`
**Type:** Hard
**Purpose:** Prevents officials from being assigned to games where they have a conflict.

**Parameters:**
- `conflicted_teams` (required): List of team IDs official cannot referee

**Example:**
```json
{
  "id": "referee_coi",
  "type": "hard",
  "rule": "conflict_of_interest",
  "selector": { "entityType": "official", "ids": ["ref-123"] },
  "params": {
    "conflicted_teams": ["team-A", "team-B"]
  }
}
```

---

## Esports-Specific Constraints

The following constraints are specifically designed for esports tournaments and competitions, addressing unique challenges like network latency, global time zones, and viewership optimization.

---

#### `server_latency_fairness`
**Type:** Hard
**Purpose:** Ensures fair network latency conditions for all teams in online esports matches.

**Parameters:**
- `max_ping_ms` (required): Maximum acceptable ping for any team in milliseconds
- `max_delta_ms` (required): Maximum acceptable ping difference between teams in milliseconds

**Example:**
```json
{
  "id": "latency_fairness",
  "type": "hard",
  "rule": "server_latency_fairness",
  "selector": { "entityType": "fixture" },
  "params": {
    "max_ping_ms": 35,
    "max_delta_ms": 10
  }
}
```

**Rationale:** Network latency creates competitive advantage similar to home field advantage in traditional sports. Ensuring fairness requires both absolute ping limits and relative delta limits between opponents.

**Recommended Ranges:**
- Competitive tournaments: max_ping_ms: 30-40ms, max_delta_ms: 5-10ms
- Regional leagues: max_ping_ms: 20-30ms, max_delta_ms: 5ms
- Casual play: max_ping_ms: 50-75ms, max_delta_ms: 15ms

---

#### `regional_time_balance`
**Type:** Hard or Soft
**Purpose:** Ensures fair distribution of match times across global regions in international esports tournaments.

**Parameters:**
- `regions` (required): Array of region identifiers (e.g., ["NA", "EU", "APAC", "LATAM"])
- `primetime_windows` (required): Map of region to primetime windows in local time
- `min_primetime_matches_per_team` (required): Minimum matches each team should play in their home region primetime

**Example:**
```json
{
  "id": "regional_fairness",
  "type": "hard",
  "rule": "regional_time_balance",
  "selector": { "entityType": "fixture" },
  "params": {
    "regions": ["NA", "EU", "APAC", "LATAM"],
    "primetime_windows": {
      "NA": ["18:00-23:00 EST"],
      "EU": ["18:00-23:00 CET"],
      "APAC": ["18:00-23:00 KST"],
      "LATAM": ["18:00-23:00 BRT"]
    },
    "min_primetime_matches_per_team": 3
  }
}
```

**Rationale:** Balancing player welfare (reasonable local times) with viewership fairness across regions. Critical for global tournaments where teams span multiple continents.

---

#### `concurrent_match_viewership`
**Type:** Soft
**Purpose:** Limits concurrent high-profile matches to maximize viewership and prevent audience fragmentation.

**Parameters:**
- `max_concurrent_matches` (required): Maximum number of matches that should occur simultaneously
- `match_priority_threshold` (optional): Priority score threshold above which matches count as 'high-profile' (0-1)

**Example:**
```json
{
  "id": "viewership_opt",
  "type": "soft",
  "rule": "concurrent_match_viewership",
  "selector": { "entityType": "fixture" },
  "params": {
    "max_concurrent_matches": 2,
    "match_priority_threshold": 0.7
  },
  "penalty": { "model": "linear", "weight": 100 }
}
```

**Rationale:** Unlike traditional sports where attendance is limited by venue capacity, esports viewers can easily switch between concurrent streams. Revenue optimization requires careful scheduling to avoid viewership cannibalization.

**Recommended Ranges:**
- Single broadcast stream: max_concurrent_matches: 1
- Multi-stream production: max_concurrent_matches: 2-4
- Group stage: max_concurrent_matches: 3-6

---

#### `server_rotation_fairness`
**Type:** Soft
**Purpose:** Ensures teams play balanced distribution across home, neutral, and away servers.

**Parameters:**
- `target_home_pct` (required): Target percentage of matches on home region server (0-1)
- `target_neutral_pct` (required): Target percentage of matches on neutral server (0-1)
- `target_away_pct` (required): Target percentage of matches on opponent region server (0-1)

**Example:**
```json
{
  "id": "server_rotation",
  "type": "soft",
  "rule": "server_rotation_fairness",
  "selector": { "entityType": "team" },
  "params": {
    "target_home_pct": 0.33,
    "target_neutral_pct": 0.34,
    "target_away_pct": 0.33
  },
  "penalty": { "model": "quadratic", "weight": 50 }
}
```

**Rationale:** Analogous to home/away balance in traditional sports. Server location affects latency, so fair distribution ensures no systematic advantage.

**Note:** Status is experimental - server location assignment may be handled at different architectural layer than scheduling.

---

## Custom Constraints

Implementations MAY support custom constraints through extension mechanisms. Custom constraints SHOULD follow the same schema structure and MUST clearly document:

1. Rule name and version
2. Required and optional parameters
3. Violation calculation method
4. Penalty model recommendations
5. Test cases

---

## Constraint Validation

All constraints MUST be validated for:
- Schema compliance
- Parameter validity
- Selector correctness
- Penalty model coherence
- Cross-constraint compatibility

Validators SHOULD report:
- Missing required fields
- Invalid parameter values
- Conflicting constraints
- Unreachable feasibility (over-constrained)
