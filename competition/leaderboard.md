# OSSS Competition Leaderboard

The OSSS Competition Leaderboard provides transparent rankings of solver performance across tracks and time periods.

---

## Overview

**Public URL**: `https://opensportsscheduling.org/competition/leaderboard`

The leaderboard tracks:
- **Overall Rankings** - Best performers across all tracks
- **Track-Specific Rankings** - Track 1 (Youth), Track 2 (Amateur), Track 3 (Professional), Track 4 (Multi-Division)
- **Temporal Rankings** - Quarterly, Annual, All-Time
- **Category Leaders** - Open, Commercial, Academic divisions

---

## Ranking Methodology

### Primary Metric: Composite Score

For each submission:
```
composite_score = (feasibility × 1000) + (1 / total_penalty) × 100 + objectives_score
```

Where:
- `feasibility` = 1 if all hard constraints satisfied, 0 otherwise
- `total_penalty` = sum of soft constraint penalties
- `objectives_score` = weighted objective function value

Lower `total_penalty` and higher `objectives_score` are better.

### Tie-Breaking Rules

If composite scores are identical:
1. **Submission timestamp** - Earlier is better
2. **Soft constraint penalty** - Lower is better
3. **Computation time** - Faster is better
4. **Solution stability** - Fewer changes from baseline

---

## Leaderboard Structure

### Overall Leaderboard

| Rank | Team | Track | Score | Feasible | Penalty | Objectives | Date |
|------|------|-------|-------|----------|---------|------------|------|
| 1 | AlphaScheduler | T3 | 98.7 | ✅ | 125 | 95.2 | 2025-01-15 |
| 2 | BetaOpt | T2 | 97.3 | ✅ | 180 | 92.8 | 2025-01-14 |
| 3 | GammaAI | T1 | 96.1 | ✅ | 95 | 91.5 | 2025-01-16 |

### Track-Specific Leaderboard

Each track maintains its own ranking:

**Track 1 (Youth) - Q1 2025**

| Rank | Team | Score | Travel (km) | Fairness | Rest (hrs) | Date |
|------|------|-------|-------------|----------|------------|------|
| 1 | TeamA | 98.5 | 4,200 | 0.95 | 96 | 2025-01-15 |
| 2 | TeamB | 97.1 | 4,800 | 0.92 | 84 | 2025-01-14 |

---

## Display Modes

### Live Leaderboard
Real-time updates as submissions are validated:
- Updates within 5 minutes of submission
- Automated verification
- Instant rank changes

### Quarterly Leaderboard
Frozen at end of each quarter:
- Q1: April 15
- Q2: July 15
- Q3: October 15
- Q4: January 15

### Annual Championship
Year-end cumulative ranking:
- Best average rank across quarters
- Participation bonus points
- Innovation awards

### Hall of Fame
All-time best performances:
- Best score per track
- Fastest solver
- Most improved
- Community choice

---

## Scoring Details

### Track 1 (Youth)
```json
{
  "weights": {
    "travel": 0.40,
    "fairness": 0.30,
    "welfare": 0.30
  },
  "targetRanges": {
    "totalTravel": { "ideal": 5000, "max": 10000 },
    "homeAwayBalance": { "ideal": 0, "max": 2 },
    "avgRest": { "min": 96, "ideal": 120 }
  }
}
```

### Track 2 (Amateur)
```json
{
  "weights": {
    "cost": 0.35,
    "fairness": 0.35,
    "quality": 0.30
  },
  "targetRanges": {
    "totalTravel": { "ideal": 15000, "max": 30000 },
    "homeAwayBalance": { "ideal": 0, "max": 2 },
    "compactness": { "ideal": 120, "max": 180 }
  }
}
```

### Track 3 (Professional)
```json
{
  "weights": {
    "fairness": 0.40,
    "broadcast": 0.35,
    "travel": 0.25
  },
  "targetRanges": {
    "homeAwayBalance": { "ideal": 0, "max": 1 },
    "primetimeDistribution": { "ideal": 1, "max": 3 },
    "totalTravel": { "ideal": 50000, "max": 100000 }
  }
}
```

### Track 4 (Multi-Division)
```json
{
  "weights": {
    "venueEfficiency": 0.30,
    "fairness": 0.35,
    "quality": 0.35
  },
  "targetRanges": {
    "venueBalance": { "ideal": 2, "max": 5 },
    "homeAwayBalance": { "ideal": 0, "max": 2 },
    "totalTravel": { "varies": true }
  }
}
```

---

## Leaderboard Data Format

### JSON Export

```json
{
  "leaderboard": {
    "track": "track-2-amateur",
    "period": "2025-q1",
    "updated": "2025-01-15T10:30:00Z",
    "entries": [
      {
        "rank": 1,
        "team": {
          "name": "AlphaScheduler",
          "division": "commercial",
          "country": "USA"
        },
        "submission": {
          "submissionId": "sub-12345",
          "timestamp": "2025-01-15T10:00:00Z",
          "instanceId": "track-2-amateur-2025q1",
          "resultHash": "abc123..."
        },
        "scores": {
          "composite": 98.7,
          "feasible": true,
          "hardViolations": 0,
          "softPenalty": 125,
          "objectives": {
            "total_travel_distance": 14500,
            "home_away_balance": 1,
            "schedule_compactness": 142
          },
          "objectivesScore": 95.2
        },
        "metadata": {
          "solver": "AlphaScheduler",
          "version": "2.1.0",
          "runtime": 45.2,
          "algorithm": "hybrid-MILP"
        }
      }
    ]
  }
}
```

### CSV Export

```csv
rank,team,division,track,score,feasible,penalty,objectives,date,solver
1,AlphaScheduler,commercial,track-2,98.7,true,125,95.2,2025-01-15,AlphaScheduler-2.1.0
2,BetaOpt,academic,track-2,97.3,true,180,92.8,2025-01-14,BetaOpt-1.5.3
```

---

## Statistics & Analytics

### Performance Metrics
- Average score by track
- Score distribution
- Improvement over time
- Solver diversity

### Participation Metrics
- Number of teams
- Submissions per team
- Geographic distribution
- Division breakdown

### Quality Metrics
- Feasibility rate
- Average penalty
- Objective achievement
- Innovation index

---

## Privacy & Anonymity

### Public Information
- ✅ Team name (if not anonymous)
- ✅ Division
- ✅ Scores and rankings
- ✅ Solver name (if disclosed)
- ✅ Submission date

### Private Information
- ❌ Team members (unless disclosed)
- ❌ Contact information
- ❌ Proprietary algorithm details
- ❌ Computation resources
- ❌ Development time

### Anonymous Submissions
Teams can compete anonymously:
- Display as "Team #1234"
- No identifying information
- Full ranking participation
- Reveal identity later (optional)

---

## Verification & Trust

### Automated Verification
Every submission:
- ✅ Schema validation
- ✅ Constraint checking
- ✅ Attestation verification
- ✅ Hash integrity

### Manual Review
Random sampling:
- 10% of top-10 submissions
- 5% of all submissions
- Flagged submissions (100%)

### Community Verification
Open attestations allow:
- Independent verification
- Reproduce results
- Challenge submissions
- Report issues

---

## Badges & Recognition

Top performers earn:
- 🥇 **OSSS Gold Medal** - 1st place
- 🥈 **OSSS Silver Medal** - 2nd place
- 🥉 **OSSS Bronze Medal** - 3rd place
- ⭐ **Top 10 Finisher** - Ranks 4-10
- 🏆 **Annual Champion** - Best overall year
- 🚀 **Innovation Award** - Novel approach
- ⚡ **Efficiency Award** - Fastest solver
- 🌟 **Open Source Award** - Best open contribution

See: [badges.md](./badges.md) for details.

---

## Historical Records

### All-Time Bests

**Track 1 (Youth)**
- Best Score: 99.2 (TeamX, Q3 2025)
- Fastest: 12.3s (TeamY, Q2 2025)
- Perfect Feasibility: 15 teams

**Track 2 (Amateur)**
- Best Score: 98.9 (TeamZ, Q4 2025)
- Lowest Penalty: 42 (TeamW, Q1 2025)

**Track 3 (Professional)**
- Best Score: 97.5 (TeamV, Q3 2025)
- Best Fairness: 0.98 (TeamU, Q2 2025)

**Track 4 (Multi-Division)**
- Best Score: 96.1 (TeamT, Q4 2025)
- Best Venue Efficiency: 0.87 (TeamS, Q3 2025)

---

## API Access

### REST API

```bash
# Get current leaderboard
GET /api/v1/leaderboard?track=track-2-amateur&period=2025-q1

# Get team history
GET /api/v1/teams/{team-id}/history

# Get submission details
GET /api/v1/submissions/{submission-id}
```

### GraphQL API

```graphql
query {
  leaderboard(track: "track-2-amateur", period: "2025-q1") {
    entries {
      rank
      team {
        name
        division
      }
      scores {
        composite
        objectives
      }
    }
  }
}
```

---

## Updates & Notifications

### Real-Time Updates
- WebSocket connection
- Server-Sent Events (SSE)
- 5-minute polling

### Email Notifications
- Rank changes (opt-in)
- New submissions to your track
- Quarterly results
- Annual championship

### RSS Feed
```
https://opensportsscheduling.org/competition/leaderboard/rss
```

---

**Transparent rankings drive innovation.**
