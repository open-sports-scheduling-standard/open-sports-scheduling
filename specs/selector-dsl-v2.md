# OSSS Selector DSL v2

The Selector DSL (Domain-Specific Language) enables precise targeting of constraints to specific entities, time periods, and contexts without requiring custom code.

## Overview

Selectors answer the question: **"Which entities does this constraint apply to?"**

Selector DSL v2 adds:
- ✅ Boolean logic (allOf, anyOf, not)
- ✅ Date and time ranges
- ✅ Competition phases
- ✅ Day-of-week filtering
- ✅ Home/away role selection
- ✅ Division and age group matching
- ✅ Venue property filtering

## Basic Selectors

### Wildcard (All Entities)
```json
{
  "selector": "*"
}
```
Applies to all entities of the relevant type.

### ID Selection
```json
{
  "selector": {
    "ids": ["team-1", "team-2", "team-3"]
  }
}
```
Applies only to specific entities.

### Tag-Based Selection
```json
{
  "selector": {
    "tags": ["youth", "competitive"]
  }
}
```
Applies to entities with ALL specified tags.

## Boolean Logic

### allOf (AND)
All conditions must be true:
```json
{
  "selector": {
    "allOf": [
      { "division": "premier" },
      { "ageGroup": "senior" }
    ]
  }
}
```

### anyOf (OR)
At least one condition must be true:
```json
{
  "selector": {
    "anyOf": [
      { "tags": ["priority-a"] },
      { "tags": ["priority-b"] }
    ]
  }
}
```

### not (NEGATION)
Inverts a condition:
```json
{
  "selector": {
    "not": {
      "phase": "playoffs"
    }
  }
}
```

### Complex Combinations
```json
{
  "selector": {
    "allOf": [
      {
        "anyOf": [
          { "division": "premier" },
          { "division": "championship" }
        ]
      },
      {
        "not": {
          "tags": ["exempt"]
        }
      }
    ]
  }
}
```

## Temporal Selectors

### Date Range
```json
{
  "selector": {
    "dateRange": {
      "start": "2025-01-01T00:00:00Z",
      "end": "2025-03-31T23:59:59Z"
    }
  }
}
```

### Day of Week
```json
{
  "selector": {
    "dayOfWeek": ["saturday", "sunday"]
  }
}
```

Valid values: `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday`

### Competition Phase
```json
{
  "selector": {
    "phase": "regular"
  }
}
```

Common phases: `preseason`, `regular`, `playoffs`, `finals`, `postseason`

### Round Range
```json
{
  "selector": {
    "round": {
      "min": 1,
      "max": 10
    }
  }
}
```

## Team-Specific Selectors

### Division
```json
{
  "selector": {
    "division": "premier"
  }
}
```

### Age Group
```json
{
  "selector": {
    "ageGroup": "u18"
  }
}
```

### Home/Away Role
```json
{
  "selector": {
    "role": "home"
  }
}
```

Values: `home`, `away`

## Venue Selectors

### Venue Type
```json
{
  "selector": {
    "venueType": "stadium"
  }
}
```

### Capacity Range
```json
{
  "selector": {
    "capacity": {
      "min": 5000,
      "max": 20000
    }
  }
}
```

## Real-World Examples

### Example 1: Youth Weekend Games Only
```json
{
  "ruleId": "min_rest_time",
  "type": "hard",
  "params": {
    "min_hours": 72
  },
  "selector": {
    "allOf": [
      { "tags": ["youth"] },
      { "dayOfWeek": ["saturday", "sunday"] }
    ]
  }
}
```

### Example 2: Professional Playoff Travel Limits
```json
{
  "ruleId": "max_travel_distance",
  "type": "hard",
  "params": {
    "max_km": 1000
  },
  "selector": {
    "allOf": [
      { "division": "premier" },
      { "phase": "playoffs" }
    ]
  }
}
```

### Example 3: No Back-to-Back Home Games (First Half)
```json
{
  "ruleId": "opponent_spacing",
  "type": "soft",
  "params": {
    "min_days": 7
  },
  "selector": {
    "allOf": [
      { "role": "home" },
      { "round": { "min": 1, "max": 19 } }
    ]
  }
}
```

### Example 4: Broadcast Windows (Primetime Only)
```json
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
  },
  "selector": {
    "tags": ["televised"]
  }
}
```

### Example 5: Large Venue Requirements for Derbies
```json
{
  "ruleId": "venue_capacity_minimum",
  "type": "hard",
  "params": {
    "min_capacity": 20000
  },
  "selector": {
    "tags": ["derby", "rivalry"]
  }
}
```

### Example 6: Different Rest Rules by Division
```json
{
  "constraints": {
    "required": [
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
      }
    ]
  }
}
```

## Selector Scope

Selectors apply differently based on constraint type:

| Constraint Type | Selector Applies To |
|----------------|---------------------|
| Team constraints | Teams, then their fixtures |
| Venue constraints | Venues, then fixtures at those venues |
| Fixture constraints | Fixtures directly |
| Global constraints | All relevant entities |

## Performance Considerations

1. **Specificity**: More specific selectors (IDs) are faster than complex boolean logic
2. **Temporal first**: Date/time filtering should happen early
3. **Tag indexing**: Systems should index tags for fast lookup
4. **Caching**: Selector results can be cached per constraint evaluation

## Validation

Selectors are validated for:
- ✅ Correct structure (no unknown fields)
- ✅ Valid boolean logic (no circular references)
- ✅ Date format compliance (ISO 8601)
- ✅ Day-of-week values
- ✅ Numeric ranges (min <= max)

## Migration from v1

### v1 Simple Selector
```json
{
  "selector": {
    "teams": "*"
  }
}
```

### v2 Equivalent
```json
{
  "selector": "*"
}
```

### v1 ID List
```json
{
  "selector": {
    "teams": ["team-1", "team-2"]
  }
}
```

### v2 Equivalent
```json
{
  "selector": {
    "ids": ["team-1", "team-2"]
  }
}
```

## Adoption Impact

Selector DSL v2 enables leagues to:
- ✅ Model complex rules without custom code
- ✅ Apply different constraints to different contexts
- ✅ Implement phase-specific rules (regular vs playoffs)
- ✅ Handle multi-division leagues with varying requirements
- ✅ Support broadcast and commercial constraints precisely

---

**Models real league rules without custom code.**
