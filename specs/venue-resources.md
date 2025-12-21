# OSSS Venue Resources & Availability

Real-world venues are complex: they have multiple fields/courts, limited availability, changeover requirements, and operational constraints. This specification makes venues operationally realistic.

## Overview

The venue resources system enables:
- ✅ Multiple bookable resources per venue (fields, courts, pitches)
- ✅ Fine-grained availability windows
- ✅ Changeover time between fixtures
- ✅ Preferred venue assignments
- ✅ Operational constraints (max fixtures per day, consecutive hours)
- ✅ Cost optimization

## Venue Resources

### Resource Definition

A resource is an individual bookable unit within a venue:

```json
{
  "id": "field-a",
  "name": "Main Field A",
  "type": "field",
  "surface": "grass",
  "capacity": 3000,
  "dimensions": {
    "length": 105,
    "width": 68,
    "unit": "meters"
  },
  "suitableFor": ["soccer", "football"],
  "changeoverMinutes": 30
}
```

### Resource Types

Supported types:
- `field` - Outdoor field (soccer, football, etc.)
- `court` - Court (basketball, tennis, volleyball)
- `pitch` - Pitch (rugby, cricket, etc.)
- `arena` - Indoor arena
- `track` - Running track
- `pool` - Swimming pool
- `rink` - Ice rink

### Surface Types

- `grass` - Natural grass
- `artificial_turf` - Synthetic turf
- `clay` - Clay court
- `hard_court` - Hard court (concrete, asphalt)
- `indoor` - Indoor surface
- `ice` - Ice surface
- `water` - Water (swimming)

## Availability Windows

### Basic Availability

```json
{
  "availability": [
    {
      "start": "2025-01-15T08:00:00Z",
      "end": "2025-01-15T22:00:00Z",
      "priority": 8
    }
  ]
}
```

### Recurring Availability

Weekly pattern (weekends only):
```json
{
  "start": "2025-01-01T00:00:00Z",
  "end": "2025-12-31T23:59:59Z",
  "recurring": {
    "pattern": "weekly",
    "daysOfWeek": [6, 0],
    "startTime": "08:00",
    "endTime": "22:00"
  },
  "priority": 8
}
```

Weekday evenings:
```json
{
  "start": "2025-01-01T00:00:00Z",
  "end": "2025-12-31T23:59:59Z",
  "recurring": {
    "pattern": "weekly",
    "daysOfWeek": [1, 2, 3, 4, 5],
    "startTime": "17:00",
    "endTime": "22:00"
  },
  "priority": 6
}
```

### Resource-Specific Availability

Apply to specific resources only:
```json
{
  "start": "2025-07-01T00:00:00Z",
  "end": "2025-07-15T23:59:59Z",
  "resourceIds": ["field-a"],
  "priority": 1,
  "notes": "Field A closed for maintenance"
}
```

### Availability Priority

Priority levels (1-10):
- **10**: Premium slots (broadcast-quality, primetime)
- **8-9**: Preferred slots (weekends, good times)
- **5-7**: Standard slots (weekday evenings)
- **3-4**: Off-peak slots (early morning, late night)
- **1-2**: Emergency/maintenance windows (avoid if possible)

### Availability with Cost

For cost optimization:
```json
{
  "start": "2025-01-01T00:00:00Z",
  "end": "2025-12-31T23:59:59Z",
  "recurring": {
    "pattern": "weekly",
    "daysOfWeek": [6, 0],
    "startTime": "12:00",
    "endTime": "21:00"
  },
  "priority": 10,
  "cost": 1000,
  "notes": "Premium weekend slots - $1000/hour"
}
```

## Changeover Time

Minimum time required between fixtures for setup/cleanup:

### Venue-Level Changeover
```json
{
  "changeoverMinutes": 20
}
```

### Resource-Level Changeover
```json
{
  "resources": [
    {
      "id": "field-a",
      "changeoverMinutes": 30
    }
  ]
}
```

Resource-level changeover overrides venue-level.

## Preferred Venues

Teams can have preferred venues (typically their home venue):

```json
{
  "preferredFor": ["team-1", "team-2"]
}
```

Soft constraints can penalize assignments away from preferred venues.

## Operational Constraints

### Max Fixtures Per Day
```json
{
  "operationalConstraints": {
    "maxFixturesPerDay": 8
  }
}
```

### Consecutive Hours Limit
```json
{
  "operationalConstraints": {
    "maxConsecutiveHours": 12,
    "requiredGapHours": 2
  }
}
```

Prevents venue overuse and ensures staff breaks.

## Real-World Examples

### Example 1: Multi-Sport Complex

```json
{
  "id": "sports-complex-1",
  "name": "City Sports Complex",
  "resources": [
    {
      "id": "soccer-field-1",
      "type": "field",
      "surface": "grass",
      "suitableFor": ["soccer"],
      "changeoverMinutes": 30
    },
    {
      "id": "basketball-court-1",
      "type": "court",
      "surface": "hard_court",
      "suitableFor": ["basketball", "volleyball"],
      "changeoverMinutes": 10
    },
    {
      "id": "tennis-court-1",
      "type": "court",
      "surface": "clay",
      "suitableFor": ["tennis"],
      "changeoverMinutes": 5
    }
  ],
  "availability": [
    {
      "recurring": {
        "pattern": "daily",
        "startTime": "06:00",
        "endTime": "23:00"
      },
      "priority": 7
    }
  ]
}
```

### Example 2: School Shared Facility

```json
{
  "id": "school-gym",
  "name": "Lincoln High School Gymnasium",
  "resources": [
    {
      "id": "main-court",
      "type": "court",
      "surface": "indoor",
      "suitableFor": ["basketball", "volleyball", "badminton"]
    }
  ],
  "availability": [
    {
      "recurring": {
        "pattern": "weekly",
        "daysOfWeek": [1, 2, 3, 4, 5],
        "startTime": "16:00",
        "endTime": "21:00"
      },
      "priority": 6,
      "notes": "Weekdays after school only"
    },
    {
      "recurring": {
        "pattern": "weekly",
        "daysOfWeek": [6, 0],
        "startTime": "08:00",
        "endTime": "18:00"
      },
      "priority": 8,
      "notes": "Weekends (full day)"
    }
  ],
  "changeoverMinutes": 15,
  "operationalConstraints": {
    "maxFixturesPerDay": 6
  }
}
```

### Example 3: Stadium with Maintenance Windows

```json
{
  "id": "main-stadium",
  "name": "National Stadium",
  "resources": [
    {
      "id": "main-pitch",
      "type": "pitch",
      "surface": "grass",
      "capacity": 50000
    }
  ],
  "availability": [
    {
      "start": "2025-01-01T00:00:00Z",
      "end": "2025-06-30T23:59:59Z",
      "recurring": {
        "pattern": "weekly",
        "daysOfWeek": [6, 0],
        "startTime": "14:00",
        "endTime": "22:00"
      },
      "priority": 10,
      "notes": "Season availability"
    },
    {
      "start": "2025-07-01T00:00:00Z",
      "end": "2025-07-31T23:59:59Z",
      "priority": 1,
      "notes": "Closed for pitch renovation"
    }
  ],
  "changeoverMinutes": 60,
  "operationalConstraints": {
    "maxFixturesPerDay": 1,
    "maxConsecutiveHours": 4
  }
}
```

## Constraint Rules

### venue_availability (Hard)
Fixtures must fall within venue availability windows.

### resource_availability (Hard)
Fixtures must be assigned to available resources.

### changeover_time (Hard)
Minimum changeover time must be respected between fixtures.

### preferred_venue (Soft)
Penalize fixtures not at preferred venue.

### minimize_venue_cost (Soft)
Minimize total venue rental costs across schedule.

## Implementation Notes

### Availability Resolution

1. **Check venue-level availability** - Is the venue open?
2. **Check resource-level availability** - Is the specific resource available?
3. **Check changeover** - Is there enough gap from previous fixture?
4. **Check operational limits** - Within daily/hourly limits?

### Priority Handling

- Higher priority windows should be preferred
- Solvers should optimize for high-priority slots when possible
- Validators should flag low-priority usage when high-priority slots are available

### Cost Optimization

When cost data is available:
- Soft constraint penalty based on total cost
- Enables budget-aware scheduling
- Supports cost vs. quality trade-offs

## Migration Path

### Phase 1: Basic Availability
Add simple time windows to existing venues.

### Phase 2: Resources
Split multi-field venues into individual resources.

### Phase 3: Advanced Features
Add costs, priorities, operational constraints.

## Adoption Impact

Venue resources and availability enable:
- ✅ Realistic modeling of shared facilities
- ✅ School/community center scheduling
- ✅ Maintenance window handling
- ✅ Multi-sport complex optimization
- ✅ Cost-aware scheduling
- ✅ Operational hour limits (staff, utilities)

---

**Handles real facilities, not abstractions.**
