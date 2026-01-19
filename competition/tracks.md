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

## Track 5: Global Esports Tournament ⭐⭐⭐⭐

**Target Audience**: Esports organizers, tournament platforms, global competition coordinators
**Real-World Application**: League of Legends Worlds, CS:GO Majors, Valorant Champions Tour, regional qualifiers

### Problem Characteristics

- **Teams**: 16-32 teams
- **Tournament Duration**: 4-8 weeks
- **Matches per Team**: 6-20 matches
- **Server Locations**: 4-8 global regions (NA, EU, APAC, LATAM, etc.)
- **Complexity**: High (global coordination, latency fairness, viewership optimization)

### Required Constraints

```json
{
  "required": [
    {
      "ruleId": "no_overlap_team",
      "type": "hard"
    },
    {
      "ruleId": "server_latency_fairness",
      "type": "hard",
      "params": {
        "max_ping_ms": 35,
        "max_delta_ms": 10
      }
    },
    {
      "ruleId": "min_rest_time",
      "type": "hard",
      "params": { "min_hours": 24 }
    },
    {
      "ruleId": "regional_time_balance",
      "type": "hard",
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
    },
    {
      "ruleId": "concurrent_match_viewership",
      "type": "soft",
      "params": { "max_concurrent_matches": 3 },
      "penalty": { "perViolation": 50 }
    }
  ]
}
```

### Optimization Objectives

| Objective | Weight | Target |
|-----------|--------|--------|
| regional_fairness | 45% | each team gets 33% home/neutral/away server distribution |
| viewership_maximization | 35% | minimize concurrent high-profile matches |
| player_welfare | 20% | maximize rest time, minimize consecutive days |

### Scoring Formula

```
score = 0.45 × regional_fairness_penalty + 0.35 × viewership_penalty + 0.20 × welfare_penalty
```

Lower score is better.

### Sample Instance

Available at: `competition/tracks/track-5-esports/sample-instance.json`

### Difficulty Notes

- **Global Time Zone Coordination**: Scheduling matches that are reasonable for all participating regions is extremely complex
- **Latency Fairness**: Server selection must ensure no team has systematic ping advantage
- **Viewership Optimization**: Esports revenue depends on concurrent viewership—avoid scheduling marquee matches simultaneously
- **Patch Version Consistency**: Tournaments must occur on same game version (not modeled in this track but relevant in practice)
- **Mental Fatigue**: Esports players face cognitive fatigue similar to physical athletes
- **Broadcast Windows**: Multiple language streams across regions create complex constraints

### Unique Esports Considerations

Unlike traditional sports:
- **Virtual Venues**: No physical travel, but server location creates "home field advantage" via latency
- **Global Scale**: Teams from 4+ continents competing simultaneously requires novel fairness constraints
- **Viewership as Constraint**: Revenue model means schedule quality measured partially by viewership patterns
- **Rapid Meta Changes**: Game patches can affect competitive balance, requiring version control
- **Online vs LAN**: Some matches online (latency matters), some at LAN events (latency neutral)

---

## Track 6: Master Championship (Hybrid Multi-Sport Global) ⭐⭐⭐⭐⭐⭐

**Target Audience**: Expert practitioners, research institutions, algorithm developers pushing boundaries
**Real-World Application**: Global multi-sport championships, international federations, mega-events (Olympics-style), hybrid sports/esports tournaments

### Problem Characteristics

- **Teams**: 64+ teams across multiple divisions and sports/esports
- **Tournament Duration**: 12-16 weeks (regional qualifiers + global finals)
- **Matches per Team**: 15-30 matches
- **Venues**: 40+ venues (20+ physical, 20+ virtual/servers)
- **Sports Types**: Mixed (traditional sports + esports)
- **Regions**: 6+ global regions (NA, EU, APAC, LATAM, MENA, OCE)
- **Complexity**: Extreme (global coordination, multi-sport, hybrid online/LAN, playoff structures)

### Problem Structure

This track simulates organizing a global championship combining:
- **Regional Qualifiers**: Teams compete in their region (online for esports, physical for sports)
- **Cross-Regional Group Stage**: Best teams from each region compete
- **LAN Finals**: Top teams meet at physical venue for championship
- **Parallel Competitions**: Multiple sports/games running simultaneously
- **Shared Resources**: Venues used across different competitions

### Required Constraints

```json
{
  "required": [
    {
      "ruleId": "no_overlap_team",
      "type": "hard",
      "comment": "Across ALL sports and divisions"
    },
    {
      "ruleId": "no_overlap_venue_resource",
      "type": "hard",
      "comment": "Physical and virtual venues"
    },
    {
      "ruleId": "min_rest_time",
      "type": "hard",
      "params": { "min_hours": 48 },
      "selector": { "division": "professional_sports" }
    },
    {
      "ruleId": "min_rest_time",
      "type": "hard",
      "params": { "min_hours": 24 },
      "selector": { "division": "esports" }
    },
    {
      "ruleId": "server_latency_fairness",
      "type": "hard",
      "params": { "max_ping_ms": 40, "max_delta_ms": 12 },
      "selector": { "competitionType": "esports", "phase": "online" }
    },
    {
      "ruleId": "regional_time_balance",
      "type": "hard",
      "params": {
        "regions": ["NA", "EU", "APAC", "LATAM", "MENA", "OCE"],
        "primetime_windows": {
          "NA": ["18:00-23:00 EST"],
          "EU": ["18:00-23:00 CET"],
          "APAC": ["18:00-23:00 JST"],
          "LATAM": ["18:00-23:00 BRT"],
          "MENA": ["18:00-23:00 GST"],
          "OCE": ["18:00-23:00 AEDT"]
        },
        "min_primetime_matches_per_team": 3
      }
    },
    {
      "ruleId": "cross_division_spacing",
      "type": "hard",
      "params": { "min_hours": 6 },
      "comment": "Same venue across different sports"
    },
    {
      "ruleId": "playoff_progression",
      "type": "hard",
      "params": {
        "regional_phase_deadline": "2025-08-15",
        "global_phase_start": "2025-08-20",
        "finals_date": "2025-09-15"
      }
    },
    {
      "ruleId": "broadcast_window",
      "type": "hard",
      "params": {
        "allowed_windows": [
          {
            "dayOfWeek": "saturday",
            "startTime": "12:00",
            "endTime": "22:00",
            "regions": ["global"]
          },
          {
            "dayOfWeek": "sunday",
            "startTime": "12:00",
            "endTime": "22:00",
            "regions": ["global"]
          }
        ],
        "max_concurrent_broadcasts": 4
      }
    },
    {
      "ruleId": "venue_capacity_limits",
      "type": "hard",
      "params": {
        "playoff_min_capacity": 5000,
        "finals_min_capacity": 15000
      }
    }
  ],
  "recommended": [
    {
      "ruleId": "travel_time_realistic",
      "type": "soft",
      "params": {
        "max_daily_travel_hours": 8,
        "min_arrival_before_match": 12
      },
      "penalty": { "perViolation": 200 }
    },
    {
      "ruleId": "concurrent_match_viewership",
      "type": "soft",
      "params": { "max_concurrent_high_profile": 2 },
      "penalty": { "perViolation": 150 }
    },
    {
      "ruleId": "regional_representation_balance",
      "type": "soft",
      "params": {
        "min_teams_per_region_in_finals": 2,
        "max_teams_per_region_in_finals": 8
      },
      "penalty": { "perViolation": 100 }
    }
  ]
}
```

### Optimization Objectives

| Objective | Weight | Target |
|-----------|--------|--------|
| global_fairness | 25% | balanced regional representation, time zones, venues |
| operational_efficiency | 20% | venue utilization, travel minimization, broadcast windows |
| competitive_integrity | 25% | playoff seeding fairness, rest time balance, no conflicts of interest |
| viewership_maximization | 20% | primetime coverage, concurrent match optimization, regional accessibility |
| sustainability | 10% | carbon footprint, travel reduction, venue reuse |

### Scoring Formula

```
score = 0.25 × fairness_penalty
      + 0.20 × efficiency_penalty
      + 0.25 × integrity_penalty
      + 0.20 × viewership_penalty
      + 0.10 × sustainability_penalty
```

Lower score is better.

### Sample Instance

Available at: `competition/tracks/track-6-master/master-championship-2025-01.json`

### Unique Challenges

**1. Multi-Sport Coordination**
- Schedule basketball, soccer, AND esports (LoL, CS:GO, Valorant)
- Shared venue pools in some cities
- Different rest requirements per sport
- Different match durations

**2. Hybrid Online/LAN**
- Regional qualifiers online (server latency matters)
- Cross-regional matches online
- Semifinals and finals at physical LAN venues
- Transition logistics between phases

**3. Global Time Zone Optimization**
- 6 major regions spanning 24 time zones
- Must ensure each region gets reasonable match times
- Primetime viewership across regions
- Avoid 3am matches for any region

**4. Playoff Structure Constraints**
- Regional winners must qualify
- Seeding based on regional performance
- Bracket constraints (no same-region matchups early)
- Finals at designated host city

**5. Broadcast Complexity**
- Multiple language streams
- Concurrent match limits (4 max)
- Prime broadcast slots (Saturday/Sunday 12:00-22:00 UTC)
- High-profile matchups (marquee teams) separated temporally

**6. Venue Sharing**
- Same physical venue used for basketball (morning), esports LAN (afternoon), soccer (evening)
- Setup/teardown time requirements
- Capacity requirements for different phases
- Equipment availability (esports requires specific setups)

**7. Travel Logistics**
- Physical sports teams traveling between cities
- Esports teams traveling to LAN finals
- Realistic travel time constraints
- Jet lag considerations (min 48h arrival before important matches)

**8. Sustainability Goals**
- Minimize total carbon footprint
- Prefer local venues when possible
- Batch matches by location
- Reduce redundant travel

### Difficulty Notes

- **Massive Search Space**: 64 teams × 200+ matches × 40+ venues × 16 weeks
- **Constraint Density**: 15+ hard constraints, many interacting
- **Global Coordination**: Impossible to satisfy all regional primetime preferences perfectly
- **Multi-Objective Trade-offs**: Fairness vs. efficiency vs. viewership
- **Feasibility Risk**: May be infeasible with tight constraints
- **Computational Complexity**: Expected solve time: hours to days
- **Real-World Realism**: Mirrors actual global championship logistics

### Track Requirements

To compete on Master Track, your solver must:

1. ✅ Handle multi-sport/multi-format scheduling
2. ✅ Support both physical and virtual venues
3. ✅ Optimize across 6+ global regions
4. ✅ Implement playoff bracket constraints
5. ✅ Balance 5 competing objectives simultaneously
6. ✅ Scale to 60+ teams and 200+ fixtures
7. ✅ Complete within reasonable time (< 24 hours)

### Expected Performance

**Baseline (Greedy):** ~50,000 penalty (likely infeasible)
**Good (CP-SAT):** ~8,000-12,000 penalty (feasible, some soft violations)
**Excellent (Advanced):** ~4,000-6,000 penalty (near-optimal)
**State-of-the-Art:** ~2,000-3,500 penalty (highly optimized)

### Recognition

Master Track winners receive:
- 🏆 **OSSS Master Champion Badge**
- 🌟 **Featured on Hall of Fame**
- 📜 **Certificate of Excellence**
- 🎤 **Invited to present at OSSS Summit**
- 📊 **Published case study of approach**

---

## Track Selection Guide

| If you are... | Start with... | Then try... | Ultimate Challenge... |
|---------------|---------------|-------------|----------------------|
| **New to sports scheduling** | Track 1 (Youth) | Track 2 (Amateur) | Work up gradually |
| **Commercial vendor** | Track 2 (Amateur) | Track 3 (Professional) | Track 6 (Master) |
| **Academic researcher** | Track 3 (Professional) | Track 4 (Multi-Division) | Track 6 (Master) |
| **Expert optimizer** | Track 3 (Professional) | Track 4 (Multi-Division) | Track 6 (Master) |
| **Esports tournament organizer** | Track 5 (Esports) | Track 4 (Multi-Division) | Track 6 (Master) |
| **Algorithm developer** | Track 3 (Professional) | Track 5 (Esports) | Track 6 (Master) |
| **Ready for ultimate challenge** | Track 4 or 5 | Track 6 (Master) | - |
| **Learning OSSS** | Track 1 (Youth) | All tracks | Track 6 (Master) |

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
