# osss-validator

Reference validator CLI for the [Open Sports Scheduling Standard (OSSS)](https://github.com/open-sports-scheduling).

## What it does

- Validates OSSS instances against JSON Schema (osss-core)
- Validates solver results against the results schema
- Checks registry references (constraint rule IDs, objective metrics)
- **Smart suggestions**: when a constraint or objective isn't found, suggests closest matches ("Did you mean X?") and lists all available IDs
- **Result format normalization**: accepts solver outputs in multiple formats (`assignments`, `schedule.fixtures`, `scheduledFixtures`) and normalizes them
- Checks hard constraints: `no_overlap_team`, `no_overlap_venue_resource`, `min_rest_time`
- Produces human-readable or JSON output with standard exit codes

## Install

```bash
cd osss-validator
npm install
npm link          # makes `osss-validate` available globally
```

All examples below assume you run commands from the **repository root** (`open-sports-scheduling/`).

## Quick start

```bash
# Validate the youth-league instance
osss-validate instance \
  --instance ./examples/youth-league/osss-instance.json \
  --schemas ./schemas \
  --registry ./registry
# => ✔ Instance is valid

# Validate everything in examples/ at once
osss-validate bundle \
  --examples ./examples \
  --schemas ./schemas \
  --registry ./registry
# => ✔ Bundle validation succeeded
```

## Commands

### `instance` — Validate an OSSS instance

Checks the instance against the osss-core schema and verifies all constraint rules and objective metrics exist in the registry.

```bash
osss-validate instance \
  --instance ./examples/youth-league/osss-instance.json \
  --schemas ./schemas \
  --registry ./registry
```

**Esports tournament:**
```bash
osss-validate instance \
  --instance ./examples/esports-tournament/osss-instance.json \
  --schemas ./schemas \
  --registry ./registry
```

**Pro league (basketball with officials, blackouts, priorities):**
```bash
osss-validate instance \
  --instance ./examples/pro-league/osss-instance.json \
  --schemas ./schemas \
  --registry ./registry
```

**Other sports:**
```bash
# American football
osss-validate instance \
  --instance ./examples/american-football/osss-instance.json \
  --schemas ./schemas \
  --registry ./registry

# Cricket T20
osss-validate instance \
  --instance ./examples/cricket-t20/osss-instance.json \
  --schemas ./schemas \
  --registry ./registry

# Ice hockey
osss-validate instance \
  --instance ./examples/ice-hockey/osss-instance.json \
  --schemas ./schemas \
  --registry ./registry

# Surfing (weather/tide/wave constraints)
osss-validate instance \
  --instance ./examples/surfing/osss-instance.json \
  --schemas ./schemas \
  --registry ./registry

# Tennis singles (venue assignment, roofed venue priority)
osss-validate instance \
  --instance ./examples/tennis-singles/osss-instance.json \
  --schemas ./schemas \
  --registry ./registry

# Volleyball indoor
osss-validate instance \
  --instance ./examples/volleyball-indoor/osss-instance.json \
  --schemas ./schemas \
  --registry ./registry

# Rugby union 15s
osss-validate instance \
  --instance ./examples/rugby-union-15s/osss-instance.json \
  --schemas ./schemas \
  --registry ./registry

# Scottish Premiership (split-season with dynamic re-grouping)
osss-validate instance \
  --instance ./examples/scottish-premiership/osss-instance.json \
  --schemas ./schemas \
  --registry ./registry
```

**Complex/RobinX-Hard examples (designed to challenge traditional solvers):**
```bash
# Complex multi-phase tournament (16 teams, group stage + knockout)
osss-validate instance \
  --instance ./examples/complex-multi-phase/osss-instance.json \
  --schemas ./schemas \
  --registry ./registry

# Venue sharing conflict (8 teams, 3 shared venues, overlapping blackouts)
osss-validate instance \
  --instance ./examples/venue-sharing-conflict/osss-instance.json \
  --schemas ./schemas \
  --registry ./registry

# Carry-over fairness league (10 teams, NP-hard carry-over + break constraints)
osss-validate instance \
  --instance ./examples/carry-over-fairness/osss-instance.json \
  --schemas ./schemas \
  --registry ./registry
```

### `result` — Validate a solver result

Validates a solver's result file against the results schema. Automatically normalizes alternative result formats (e.g., `schedule.fixtures` instead of `assignments`).

```bash
osss-validate result \
  --instance ./examples/youth-league/osss-instance.json \
  --result ./examples/youth-league/osss-results.json \
  --schemas ./schemas \
  --registry ./registry
```

**Esports result (alternative format, auto-normalized):**
```bash
osss-validate result \
  --instance ./examples/esports-tournament/osss-instance.json \
  --result ./examples/esports-tournament/osss-results.json \
  --schemas ./schemas \
  --registry ./registry
# => ✔ Result valid (after normalization from alternative format)
#    Warnings:
#    - Result uses 'schedule.fixtures' format instead of 'assignments' array (6 fixtures mapped)
```

**American football result:**
```bash
osss-validate result \
  --instance ./examples/american-football/osss-instance.json \
  --result ./examples/american-football/osss-results.json \
  --schemas ./schemas \
  --registry ./registry
```

### `compare` — Rank multiple solver results

Compare and rank solver outputs for the same instance. Results are sorted by: valid+feasible first, then lowest total penalty.

```bash
osss-validate compare \
  --instance ./examples/amateur-league/osss-instance.json \
  --results ./out/solverA.json ./out/solverB.json ./out/solverC.json \
  --schemas ./schemas \
  --registry ./registry
```

### `bundle` — Validate all examples at once

Walks every subdirectory in the examples folder and validates each instance (and result, if present).

```bash
osss-validate bundle \
  --examples ./examples \
  --schemas ./schemas \
  --registry ./registry
```

Require every example to have a result file:
```bash
osss-validate bundle \
  --examples ./examples \
  --schemas ./schemas \
  --registry ./registry \
  --require-results
```

### `explain` — Human-readable violation report

```bash
osss-validate explain \
  --instance ./examples/youth-league/osss-instance.json \
  --result ./examples/youth-league/osss-results.json \
  --schemas ./schemas \
  --registry ./registry
# => 📋 OSSS Validation Explanation
#    Feasible: ✅ Yes
#    Total Penalty: 0
#    ✅ Validation passed
```

### `doctor` — Health check your setup

Verifies that instance, schema, and registry files exist and are readable.

```bash
osss-validate doctor \
  --instance ./examples/youth-league/osss-instance.json \
  --schemas ./schemas \
  --registry ./registry
# => ✅ Found Instance file
#    ✅ Valid Instance JSON
#    ✅ Found Schemas directory
#    ✅ Found Registry directory
#    ✅ Found Constraints registry
#    ✅ All checks passed!
```

### `conformance` — Run conformance test suite

Run must-pass and must-fail test suites to verify conformance.

```bash
osss-validate conformance \
  --conformance ./conformance \
  --schemas ./schemas \
  --registry ./registry

# Run only must-pass tests
osss-validate conformance \
  --conformance ./conformance \
  --schemas ./schemas \
  --registry ./registry \
  --type must-pass
```

### `init` — Scaffold a new OSSS project

```bash
osss-validate init --profile youth --timezone America/Toronto --output ./my-league
```

### `add` — Add a constraint to an instance

```bash
osss-validate add \
  --instance ./my-league/osss-instance.json \
  --constraint min_rest_time \
  --type hard \
  --params '{"min_hours": 72}'
```

### `dataset-generate` — Generate synthetic instances

```bash
osss-validate dataset-generate \
  --track amateur \
  --num-teams 16 \
  --num-venues 8 \
  --season-weeks 20 \
  --complexity moderate \
  --seed 42 \
  --output ./generated-instance.json
```

### `dataset-anonymize` — Anonymize real-world data

```bash
osss-validate dataset-anonymize \
  --input ./real-data/osss-instance.json \
  --output ./anonymized-instance.json \
  --verify
```

### `dataset-mutate` — Create variants of existing instances

```bash
osss-validate dataset-mutate \
  --input ./examples/amateur-league/osss-instance.json \
  --mutation add-teams \
  --num-teams 4 \
  --output ./mutated-instance.json
```

## Smart suggestions

When a constraint rule or objective metric isn't found in the registry, the validator suggests close matches using fuzzy matching:

```
Warnings:
- Constraint rule 'no_overlp_team' not found in registry. Did you mean 'no_overlap_team'?
- Constraint rule 'home_away_balence' not found in registry. Did you mean 'home_away_balance'?
- Available constraint rules: no_overlap_team, no_overlap_venue_resource, min_rest_time, ...

- Objective metric 'total_travel_distanc' not found in registry. Did you mean 'total_travel_distance'?
- Available objective metrics: total_travel_distance, max_team_travel, travel_balance, ...
```

## Result format normalization

The validator accepts solver results in several formats and normalizes them automatically:

| Solver writes | Canonical form | Auto-mapped? |
|---|---|---|
| `schedule.fixtures[{fixtureId, dateTime, venueId}]` | `assignments[{fixtureId, startTime, venueId}]` | Yes |
| `scheduledFixtures[{fixtureId, venue, startTime}]` | `assignments[{fixtureId, startTime, venueId}]` | Yes |
| `score.totalPenalty` | `scores.totalPenalty` | Yes |
| top-level `feasible` missing | inferred from presence of schedule data | Yes |

When normalization is applied, warnings explain what was mapped.

## JSON output

Add `--format json` to any command for machine-readable output:

```bash
osss-validate instance \
  --instance ./examples/youth-league/osss-instance.json \
  --schemas ./schemas \
  --registry ./registry \
  --format json
```

```json
{
  "valid": true,
  "exitCode": 0,
  "summary": "Instance is valid",
  "warnings": [],
  "errors": [],
  "details": {
    "instanceId": "youth-league-2025",
    "objectiveCount": 1,
    "constraintCount": 3
  }
}
```

## Exit codes

| Code | Meaning |
|------|---------|
| 0 | Valid (and feasible, where applicable) |
| 1 | Schema or registry error |
| 2 | Result says `feasible: false` |
| 3 | Hard constraint violation detected |
| 4 | Scoring inconsistency |
| 5 | Unexpected runtime error |

## Running without `npm link`

If you prefer not to install globally, run from the `osss-validator/` directory:

```bash
cd osss-validator

node ./bin/osss-validate.js instance \
  --instance ../examples/youth-league/osss-instance.json \
  --schemas ../schemas \
  --registry ../registry

node ./bin/osss-validate.js bundle \
  --examples ../examples \
  --schemas ../schemas \
  --registry ../registry
```

## Registry

The validator checks constraint rules and objective metrics against the canonical registry files:

- `registry/constraints.json` — all recognized constraint rule IDs
- `registry/objectives.json` — all recognized objective metric IDs

### Available constraint rules

| Rule ID | Category | Type |
|---------|----------|------|
| `no_overlap_team` | feasibility | hard |
| `no_overlap_venue_resource` | feasibility | hard |
| `min_rest_time` | time | hard/soft |
| `max_games_per_day` | time | hard/soft |
| `max_games_in_period` | time | hard/soft |
| `back_to_back_games` | time | hard/soft |
| `time_window` | time | hard/soft |
| `venue_availability` | venue | hard |
| `buffer_time` | venue | hard |
| `venue_assignment` | venue | hard/soft |
| `preferred_venue` | venue | soft |
| `roofed_venue_priority` | venue | soft |
| `max_travel_distance` | travel | hard/soft |
| `minimize_travel` | travel | soft |
| `home_away_balance` | fairness | soft |
| `max_consecutive_away` | fairness | hard/soft |
| `max_consecutive_home` | fairness | soft |
| `opponent_spacing` | fairness | soft |
| `broadcast_window` | broadcast | hard/soft |
| `specific_date_fixture` | special | hard |
| `weather_conditions` | environmental | hard |
| `tide_conditions` | environmental | hard |
| `wave_quality` | environmental | hard |
| `server_latency_fairness` | esports | hard |
| `regional_time_balance` | esports | hard/soft |
| `concurrent_match_viewership` | esports | soft |
| `server_rotation_fairness` | esports | soft |
| `phase_split` | structure | hard |
| `max_rematches_in_phase` | structure | hard/soft |
| `home_away_asymmetry_tolerance` | fairness | soft |
| `conditional_fixture` | structure | hard |
| `no_venue_overlap` | venue | hard |
| `carry_over_effects` | fairness | hard/soft |
| `break_pattern` | fairness | hard/soft |
| `travel_pattern` | travel | soft |
| `complementary_pattern` | broadcast | soft |
| `rest_balance` | fairness | soft |
| `phase_ordering` | structure | hard |
| `round_distribution` | time | soft |
| `simultaneous_games` | fairness | hard |
| `no_simultaneous_group_games` | broadcast | soft |
| `specific_venue_fixture` | venue | hard |
| `phase_constraint` | structure | soft |

### Available objective metrics

| Metric ID | Category | Goal |
|-----------|----------|------|
| `total_travel_distance` | travel | minimize |
| `max_team_travel` | travel | minimize |
| `travel_balance` | fairness | minimize |
| `home_away_balance` | fairness | minimize |
| `home_streak_length` | quality | minimize |
| `rest_time_average` | player welfare | maximize |
| `min_rest_time` | player welfare | maximize |
| `rest_fairness` | fairness | minimize |
| `back_to_back_games` | player welfare | minimize |
| `competitive_balance` | fairness | maximize |
| `venue_utilization` | efficiency | maximize |
| `venue_balance` | efficiency | minimize |
| `schedule_compactness` | efficiency | minimize |
| `schedule_stability` | operational | minimize |
| `opponent_variety` | quality | maximize |
| `primetime_distribution` | commercial | balance |
| `broadcast_revenue` | commercial | maximize |
| `broadcast_coverage` | commercial | maximize |
| `broadcast_window_alignment` | commercial | maximize |
| `weekend_game_distribution` | commercial | maximize |
| `weekend_fixture_count` | commercial | maximize |
| `attendance` | commercial | maximize |
| `wave_quality_score` | environmental | maximize |
| `waiting_period_efficiency` | efficiency | maximize |
| `regional_fairness` | esports | balance |
| `server_latency_balance` | esports | minimize |
| `viewership_maximization` | esports | minimize |
| `regional_primetime_coverage` | esports | balance |
| `mental_fatigue_index` | esports | minimize |
| `cross_region_balance` | esports | balance |
| `carry_over_variance` | fairness | minimize |
| `total_breaks` | fairness | minimize |
| `travel_clustering` | travel | maximize |
| `priority_satisfaction` | efficiency | maximize |

## Tests

```bash
cd osss-validator
npm test                    # run all tests (60 tests)
npm run test:watch          # watch mode
npm run test:coverage       # with coverage report
```

## Project layout

```
open-sports-scheduling/
  registry/
    constraints.json          # canonical constraint definitions
    objectives.json           # canonical objective definitions
  schemas/
    osss-core.schema.json     # instance schema
    osss-results.schema.json  # result schema
    ...
  examples/
    youth-league/             # minimal 2-team example
    amateur-league/           # 3-team regional league
    pro-league/               # full-featured professional league
    esports-tournament/       # esports with latency/server constraints
    american-football/        # NFL-style scheduling
    basketball-5on5/          # EuroLeague-style
    cricket-t20/              # IPL-style T20 league
    ice-hockey/               # NHL-style dense schedule
    rugby-union-15s/          # Six Nations-style
    surfing/                  # weather-dependent waiting period format
    tennis-singles/           # multi-court tournament
    volleyball-indoor/        # indoor league
    scottish-premiership/     # split-season with dynamic re-grouping
    complex-multi-phase/      # RobinX-hard: multi-phase tournament
    venue-sharing-conflict/   # RobinX-hard: venue contention problem
    carry-over-fairness/      # RobinX-hard: NP-hard fairness constraints
  osss-validator/
    bin/osss-validate.js      # CLI entry point
    src/
      index.js                # command definitions
      validate/
        instance.js           # instance validation + smart suggestions
        result.js             # result validation + format normalization
        registry.js           # registry loader + fuzzy matching
        schema.js             # AJV schema setup
      rules/
        hard/                 # hard constraint implementations
        soft/                 # soft constraint implementations
    test/
      integration/            # end-to-end tests
      rules/                  # unit tests per constraint
```

## Notes

This is a reference implementation with conservative rule semantics.
Extend `src/rules/hard/` and `src/rules/soft/` to add constraint implementations as they are standardized.
