# OSSS Core Specification

## Purpose
Defines the foundational data model and scheduling primitives for the Open Sports Scheduling Standard (OSSS). This specification establishes the common language for representing sports scheduling problems across different leagues, sports, and solver implementations.

---

## OSSS Instance

An **OSSS Instance** represents a complete scheduling problem definition.

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for this scheduling instance |
| `name` | string | Human-readable name |
| `version` | string | OSSS spec version (e.g., "0.1.0") |
| `timezone` | string | IANA timezone (e.g., "America/Toronto") |
| `season` | object | Season definition with start and end dates |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | Detailed description of the scheduling problem |
| `competition` | object | Competition metadata (league name, level, sport) |
| `metadata` | object | Custom metadata for extensions |
| `config` | object | Solver configuration hints |

### Season Object

```json
{
  "start": "2025-03-01T00:00:00-05:00",
  "end": "2025-09-30T23:59:59-04:00",
  "blackout_dates": [
    {
      "start": "2025-07-01T00:00:00-04:00",
      "end": "2025-07-07T23:59:59-04:00",
      "reason": "Independence Day break"
    }
  ],
  "key_dates": [
    {
      "date": "2025-05-15T00:00:00-04:00",
      "type": "playoff_start",
      "description": "Playoff round begins"
    }
  ]
}
```

### Complete Example

```json
{
  "id": "mlb-2025-regular",
  "name": "MLB 2025 Regular Season",
  "version": "0.1.0",
  "timezone": "America/New_York",
  "season": {
    "start": "2025-03-27T00:00:00-04:00",
    "end": "2025-09-28T23:59:59-04:00",
    "blackout_dates": [
      {
        "start": "2025-07-14T00:00:00-04:00",
        "end": "2025-07-17T23:59:59-04:00",
        "reason": "All-Star Break"
      }
    ]
  },
  "competition": {
    "sport": "baseball",
    "level": "professional",
    "league": "MLB"
  },
  "entities": { ... },
  "fixtures": [ ... ],
  "constraints": [ ... ],
  "objectives": [ ... ]
}
```

---

## Entities

All entities represent resources or participants in the scheduling problem.

### Common Entity Fields

All entities MUST include:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
| `name` | string | Yes | Human-readable name |
| `type` | string | Yes | Entity type (see below) |
| `tags` | string[] | No | Tags for grouping/selection |
| `metadata` | object | No | Custom metadata |
| `enabled` | boolean | No | Whether entity is active (default: true) |

### Team Entity

Represents a team or participant.

```json
{
  "id": "team-lakers",
  "name": "Los Angeles Lakers",
  "type": "team",
  "tags": ["western-conference", "pacific-division"],
  "home_venue": "venue-staples",
  "location": {
    "latitude": 34.043,
    "longitude": -118.267,
    "city": "Los Angeles",
    "state": "CA",
    "country": "USA"
  },
  "division": "pacific",
  "metadata": {
    "abbreviation": "LAL",
    "colors": ["purple", "gold"],
    "capacity": 18997
  }
}
```

**Additional Team Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `home_venue` | string | Default home venue ID |
| `location` | object | Geographic location for travel calculations |
| `division` | string | Division or conference identifier |
| `strength` | number | Optional strength rating for competitive balance |

---

### Venue Entity

Represents a location where fixtures can be scheduled.

```json
{
  "id": "venue-staples",
  "name": "Crypto.com Arena",
  "type": "venue",
  "tags": ["indoor", "large-capacity"],
  "location": {
    "latitude": 34.043,
    "longitude": -118.267,
    "address": "1111 S Figueroa St, Los Angeles, CA 90015"
  },
  "capacity": 18997,
  "resources": [
    {
      "id": "court-main",
      "type": "court",
      "sport": "basketball"
    }
  ],
  "availability": [
    {
      "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "start_time": "10:00",
      "end_time": "23:00"
    }
  ],
  "blackout_dates": [
    {
      "start": "2025-06-15T00:00:00-07:00",
      "end": "2025-06-20T23:59:59-07:00",
      "reason": "Concert series"
    }
  ]
}
```

**Venue Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `location` | object | Geographic location |
| `capacity` | number | Seating capacity |
| `resources` | array | Available resources (courts, fields, etc.) |
| `availability` | array | Default availability windows |
| `blackout_dates` | array | Dates venue is unavailable |
| `setup_time_minutes` | number | Setup time between events |

---

### Official Entity

Represents referees, umpires, or other officials.

```json
{
  "id": "official-smith",
  "name": "John Smith",
  "type": "official",
  "tags": ["senior-referee", "certified"],
  "certifications": ["level-3", "basketball"],
  "availability": [
    {
      "start": "2025-03-01T00:00:00-05:00",
      "end": "2025-09-30T23:59:59-04:00"
    }
  ],
  "conflicts": {
    "teams": ["team-celtics"],
    "reason": "Former player"
  },
  "max_games_per_week": 4,
  "home_location": {
    "latitude": 42.361,
    "longitude": -71.057
  }
}
```

---

### Resource Entity

Represents equipment or facilities needed for fixtures.

```json
{
  "id": "resource-broadcast-crew-a",
  "name": "Broadcast Crew A",
  "type": "broadcast_equipment",
  "tags": ["hd-capable", "mobile"],
  "capacity": 1,
  "setup_time_minutes": 120
}
```

---

## Fixtures

A **fixture** defines a required match or event that must be scheduled.

### Fixture Object

```json
{
  "id": "fixture-lakers-celtics-1",
  "participants": [
    {
      "id": "team-lakers",
      "role": "home"
    },
    {
      "id": "team-celtics",
      "role": "away"
    }
  ],
  "durationMinutes": 150,
  "sport": "basketball",
  "competition_phase": "regular_season",
  "round": 1,
  "tags": ["rivalry", "nationally-televised"],
  "required_resources": [
    {
      "type": "court",
      "quantity": 1
    },
    {
      "type": "official",
      "quantity": 3
    }
  ],
  "preferred_windows": [
    {
      "start": "2025-03-27T19:00:00-04:00",
      "end": "2025-03-27T21:00:00-04:00",
      "priority": 0.9
    }
  ],
  "metadata": {
    "tv_network": "ESPN",
    "importance": "high"
  }
}
```

### Fixture Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique fixture identifier |
| `participants` | array | Yes | List of participating entities with roles |
| `durationMinutes` | number | Yes | Expected duration in minutes |
| `sport` | string | No | Sport type |
| `competition_phase` | string | No | Phase (regular_season, playoff, etc.) |
| `round` | number | No | Round number |
| `tags` | string[] | No | Tags for selection/filtering |
| `required_resources` | array | No | Resources needed |
| `preferred_windows` | array | No | Preferred time windows |
| `locked_assignment` | object | No | Pre-assigned time/venue (immutable) |

### Participant Object

```json
{
  "id": "team-lakers",
  "role": "home"
}
```

Roles can be: `home`, `away`, `neutral`, or custom values.

---

## Assignments

An **assignment** binds a fixture to specific time and resources, forming part of a schedule solution.

### Assignment Object

```json
{
  "fixtureId": "fixture-lakers-celtics-1",
  "startTime": "2025-03-27T19:30:00-04:00",
  "endTime": "2025-03-27T22:00:00-04:00",
  "venueId": "venue-staples",
  "resources": [
    {
      "type": "official",
      "ids": ["official-smith", "official-jones", "official-davis"]
    },
    {
      "type": "broadcast_equipment",
      "ids": ["resource-broadcast-crew-a"]
    }
  ],
  "metadata": {
    "assigned_by": "solver-v2",
    "confidence": 0.95
  }
}
```

### Assignment Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fixtureId` | string | Yes | Reference to fixture |
| `startTime` | ISO-8601 | Yes | Start timestamp with timezone |
| `endTime` | ISO-8601 | Yes | End timestamp with timezone |
| `venueId` | string | Yes | Venue where fixture takes place |
| `resources` | array | No | Assigned resources (officials, equipment) |
| `locked` | boolean | No | Whether assignment is immutable |
| `metadata` | object | No | Solver-specific metadata |

---

## Time Model

### ISO-8601 Timestamps

All timestamps MUST use ISO-8601 format with explicit timezone offset.

**Valid examples:**
- `2025-03-27T19:30:00-04:00` (EDT)
- `2025-11-15T14:00:00-05:00` (EST)
- `2025-06-01T12:00:00Z` (UTC)

**Invalid examples:**
- `2025-03-27 19:30:00` (no timezone)
- `2025-03-27T19:30:00` (no timezone)
- `03/27/2025 7:30 PM` (wrong format)

### Timezone Handling

1. All instances MUST declare a primary timezone
2. All timestamps SHOULD use the instance timezone for consistency
3. Solvers MUST handle DST transitions correctly
4. Cross-timezone schedules MUST explicitly convert times

### Duration Calculation

```javascript
// Correct: account for DST
const duration = new Date(endTime) - new Date(startTime);

// Incorrect: naive subtraction
const duration = fixture.durationMinutes * 60 * 1000;
```

---

## Validation Rules

### Instance Validation
- All entity IDs MUST be unique within their type
- All fixture IDs MUST be unique
- Fixture participants MUST reference existing entities
- Season start MUST be before season end
- All timestamps MUST be within season bounds (unless explicitly allowed)

### Assignment Validation
- Assignment fixture MUST reference existing fixture
- Assignment venue MUST reference existing venue
- Assignment time window MUST fit fixture duration
- No duplicate assignments for same fixture
- Resources MUST be available (checked via constraints)

### Referential Integrity
- All references (venue, team, official IDs) MUST exist
- Dangling references MUST cause validation errors
- Circular dependencies MUST be detected

---

## Extensibility

OSSS supports extensions through:

1. **Custom entity types**: Add new entity types with `type` field
2. **Metadata fields**: Use `metadata` object for custom data
3. **Custom tags**: Tag entities/fixtures with domain-specific labels
4. **Solver hints**: Use `config` object for solver-specific parameters

Extensions SHOULD NOT break core validation rules.
