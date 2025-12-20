# OSSS Rule Plugin SDK

The OSSS Rule Plugin SDK provides tools, helpers, and templates for authoring constraint rules without requiring deep system knowledge.

## Overview

This SDK enables contributors to:
- ✅ Create new constraint rules quickly
- ✅ Use standardized validation and penalty helpers
- ✅ Follow consistent patterns across all rules
- ✅ Avoid common pitfalls and errors

## Quick Start

### 1. Choose a Template

**For Hard Constraints** (must be satisfied):
```bash
cp src/rules/sdk/template-hard-rule.js src/rules/hard/my_new_rule.js
```

**For Soft Constraints** (add penalties):
```bash
cp src/rules/sdk/template-soft-rule.js src/rules/soft/my_new_rule.js
```

### 2. Implement Your Rule

Edit the template and:
1. Define your parameter schema
2. Implement the validation/calculation logic
3. Update the metadata
4. Add tests

### 3. Register Your Rule

Add your rule to the constraint registry at `registry/constraints.json`.

## SDK Components

### Helpers (`helpers.js`)

Common utilities for rule authoring:

#### Parameter Validation
```javascript
import { validateParams } from './sdk/helpers.js';

const schema = {
  required: ['min_hours'],
  properties: {
    min_hours: { type: 'number', minimum: 0 }
  }
};

const validation = validateParams(params, schema);
if (!validation.valid) {
  console.error(validation.errors);
}
```

#### Penalty Calculation
```javascript
import { linearPenalty, quadraticPenalty, exponentialPenalty, flatPenalty } from './sdk/helpers.js';

// Linear: penalty = violation * perUnit
const penalty1 = linearPenalty(5, 10);  // 50

// Quadratic: penalty = perUnit * violation^exponent
const penalty2 = quadraticPenalty(3, 10, 2);  // 90

// Exponential: penalty = base * multiplier^(violations-1)
const penalty3 = exponentialPenalty(3, 10, 2);  // 40

// Flat: penalty = violations * perViolation
const penalty4 = flatPenalty(2, 100);  // 200
```

#### Violation Reporting
```javascript
import { createViolation, createPenalty } from './sdk/helpers.js';

// Hard constraint violation
const violation = createViolation(
  'my_rule_id',
  'Team cannot play overlapping fixtures',
  { teamId: 'team-1', fixtureIds: ['fix-1', 'fix-2'] }
);

// Soft constraint penalty
const penalty = createPenalty(
  'my_rule_id',
  50,
  'Home/away imbalance of 2 games',
  { teamId: 'team-1', delta: 2 }
);
```

#### Time Utilities
```javascript
import { hoursBetween, daysBetween, timeRangesOverlap, parseDate } from './sdk/helpers.js';

const hours = hoursBetween('2025-01-01T10:00:00Z', '2025-01-02T14:00:00Z');  // 28
const days = daysBetween('2025-01-01', '2025-01-15');  // 14

const overlap = timeRangesOverlap(
  { start: '2025-01-01T10:00:00Z', end: '2025-01-01T12:00:00Z' },
  { start: '2025-01-01T11:00:00Z', end: '2025-01-01T13:00:00Z' }
);  // true
```

#### Fixture Utilities
```javascript
import { getFixturesForTeam, getFixturesForVenue, sortFixturesByTime } from './sdk/helpers.js';

const teamFixtures = getFixturesForTeam(allFixtures, 'team-1');
const venueFixtures = getFixturesForVenue(allFixtures, 'venue-1');
const sorted = sortFixturesByTime(fixtures);
```

## Rule Structure

### Hard Constraint Rules

Hard constraints **must** be satisfied for a schedule to be feasible.

```javascript
export function validate(instance, result, constraint) {
  const violations = [];

  // 1. Validate parameters
  const paramValidation = validateParams(constraint.params, PARAM_SCHEMA);
  if (!paramValidation.valid) {
    // Return parameter errors as violations
    return paramValidation.errors.map(err =>
      createViolation('rule_id', err, { constraint })
    );
  }

  // 2. Extract parameters
  const { min_hours } = constraint.params;

  // 3. Check constraint for each relevant entity
  for (const team of instance.teams) {
    const fixtures = getFixturesForTeam(result.schedule.fixtures, team.id);
    const sorted = sortFixturesByTime(fixtures);

    for (let i = 0; i < sorted.length - 1; i++) {
      const gap = hoursBetween(sorted[i].endTime, sorted[i + 1].startTime);

      if (gap < min_hours) {
        violations.push(createViolation(
          'min_rest_time',
          `Team ${team.id} has only ${gap}h rest (required: ${min_hours}h)`,
          {
            teamId: team.id,
            fixture1: sorted[i].id,
            fixture2: sorted[i + 1].id,
            actualRest: gap,
            requiredRest: min_hours
          }
        ));
      }
    }
  }

  return violations;
}
```

### Soft Constraint Rules

Soft constraints add penalties but don't make schedules infeasible.

```javascript
export function calculate(instance, result, constraint) {
  const penalties = [];

  // 1. Validate parameters
  const paramValidation = validateParams(constraint.params, PARAM_SCHEMA);
  if (!paramValidation.valid) {
    return [];  // Skip if params invalid
  }

  // 2. Extract parameters and penalty model
  const { max_delta } = constraint.params;
  const penaltyModel = constraint.penalty || DEFAULT_PENALTY;

  // 3. Calculate penalties
  for (const team of instance.teams) {
    const fixtures = getFixturesForTeam(result.schedule.fixtures, team.id);
    const homeGames = fixtures.filter(f => f.homeTeam === team.id).length;
    const awayGames = fixtures.filter(f => f.awayTeam === team.id).length;
    const delta = Math.abs(homeGames - awayGames);

    if (delta > max_delta) {
      const violation = delta - max_delta;
      const penaltyAmount = linearPenalty(violation, penaltyModel.perViolation);

      penalties.push(createPenalty(
        'home_away_balance',
        penaltyAmount,
        `Team ${team.id} has ${delta} game imbalance (max: ${max_delta})`,
        {
          teamId: team.id,
          homeGames,
          awayGames,
          delta,
          maxDelta: max_delta
        }
      ));
    }
  }

  return penalties;
}
```

## Parameter Schema

Define parameter schemas using JSON Schema:

```javascript
const PARAM_SCHEMA = {
  required: ['min_hours'],
  properties: {
    min_hours: {
      type: 'number',
      minimum: 0,
      maximum: 168,  // 1 week
      description: 'Minimum hours between fixtures'
    },
    apply_to_playoffs: {
      type: 'boolean',
      description: 'Whether to apply this rule to playoff fixtures'
    }
  }
};
```

## Penalty Models

### Linear Penalty
Best for: Distance, time, simple violations
```javascript
penalty = violation * perUnit
```

### Quadratic Penalty
Best for: Fairness violations where larger imbalances are disproportionately bad
```javascript
penalty = perUnit * violation^2
```

### Exponential Penalty
Best for: Escalating violations (each additional one is much worse)
```javascript
penalty = base * multiplier^(violations - 1)
```

### Flat Penalty
Best for: Binary violations (either violated or not)
```javascript
penalty = violations * perViolation
```

## Metadata

Always export metadata to document your rule:

```javascript
export const metadata = {
  ruleId: 'min_rest_time',
  category: 'time',
  type: 'hard',
  description: 'Minimum rest time required between fixtures',
  appliesTo: 'team',
  paramsSchema: PARAM_SCHEMA,
  defaultPenaltyModel: DEFAULT_PENALTY,  // for soft rules
  examples: [
    {
      params: { min_hours: 48 },
      description: 'Professional league standard (48h minimum rest)'
    },
    {
      params: { min_hours: 72 },
      description: 'Youth league standard (72h minimum rest)'
    }
  ],
  recommendedRanges: {
    min_hours: {
      youth: [72, 168],
      amateur: [48, 96],
      pro: [48, 72]
    }
  }
};
```

## Testing Your Rule

Create a test file in `test/rules/`:

```javascript
import { describe, it } from 'mocha';
import { expect } from 'chai';
import { validate } from '../../src/rules/hard/my_rule.js';

describe('my_rule', () => {
  it('should detect violations', () => {
    const instance = {
      teams: [{ id: 'team-1' }],
      venues: [],
      fixtures: []
    };

    const result = {
      schedule: { fixtures: [] }
    };

    const constraint = {
      ruleId: 'my_rule',
      type: 'hard',
      params: {}
    };

    const violations = validate(instance, result, constraint);
    expect(violations).to.be.an('array');
  });

  it('should pass when constraint is satisfied', () => {
    // Test passing case
  });
});
```

## Best Practices

1. **Validate parameters first** - Always check params before logic
2. **Use helpers** - Don't reinvent date math or penalty calculations
3. **Provide context** - Include relevant IDs and values in violations/penalties
4. **Write clear messages** - Violations should be human-readable
5. **Document your rule** - Complete metadata helps adoption
6. **Test edge cases** - Empty fixtures, single teams, etc.
7. **Consider selectors** - Rules should respect selector scoping
8. **Be consistent** - Follow existing rule patterns

## Common Patterns

### Pairwise Fixture Checking
```javascript
for (let i = 0; i < fixtures.length - 1; i++) {
  for (let j = i + 1; j < fixtures.length; j++) {
    // Check fixtures[i] vs fixtures[j]
  }
}
```

### Team-by-Team Analysis
```javascript
for (const team of instance.teams) {
  const fixtures = getFixturesForTeam(result.schedule.fixtures, team.id);
  // Analyze team's fixtures
}
```

### Venue Capacity Checking
```javascript
for (const venue of instance.venues) {
  const fixtures = getFixturesForVenue(result.schedule.fixtures, venue.id);
  // Check venue constraints
}
```

## Getting Help

- Check existing rules in `src/rules/hard/` and `src/rules/soft/`
- Review the constraint registry for examples
- Ask in GitHub discussions or issues

---

**Contributors can add rules without deep system knowledge.**
