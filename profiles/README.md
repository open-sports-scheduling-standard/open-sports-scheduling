# OSSS Constraint Profiles

This directory contains **first-class constraint profiles** that provide ready-to-use starting points for different types of sports leagues.

## Why Profiles?

Instead of starting from a blank page, leagues can select a profile that matches their context and immediately have a compliant, well-documented constraint set.

## Available Profiles

### 1. Baseline (`baseline.json`)
**Minimum viable constraint set for any sports league**

- **Suitable for:** Any league requiring basic feasibility
- **Focus:** Physical impossibility prevention
- **Required constraints:**
  - Team overlap prevention
  - Venue conflict prevention
  - Minimum 24-hour rest between games

Use this as the absolute minimum or as a foundation to build upon.

### 2. Youth (`youth.json`)
**Optimized for youth and junior sports**

- **Suitable for:** U8-U18, school sports, recreational youth leagues
- **Focus:** Player safety, family convenience, development, fairness
- **Key features:**
  - 72-hour minimum rest (player development priority)
  - Max 1 game per day
  - Travel distance penalties
  - Home/away balance for family equity
  - Opponent spacing for variety

### 3. Amateur (`amateur.json`)
**Balanced for community and semi-professional leagues**

- **Suitable for:** Adult recreational, community leagues, college/university sports
- **Focus:** Competitive integrity with participant flexibility
- **Key features:**
  - 48-hour minimum rest (work/study balance)
  - Venue optimization (shared facilities)
  - Travel cost minimization
  - Moderate home/away balance
  - Tournament flexibility (up to 2 games/day)

### 4. Professional (`pro.json`)
**Commercial and high-stakes optimization**

- **Suitable for:** Professional leagues, elite competitions, broadcast-driven tournaments
- **Focus:** Broadcast compliance, competitive fairness, commercial value
- **Key features:**
  - Broadcast window enforcement (hard constraint)
  - Strict home/away balance (competitive integrity)
  - High penalties for fairness violations
  - Travel management with hard caps
  - 1 game per day maximum

## How to Use Profiles

### 1. Direct Adoption
```bash
# Copy a profile as your constraint baseline
cp profiles/amateur.json my-league/constraints.json
```

### 2. As a Starting Point
Profiles are designed to be extended:
- Start with a profile that's closest to your needs
- Add league-specific constraints
- Adjust penalty weights
- Modify parameters

### 3. Profile Selection in CLI
```bash
osss init --profile amateur --timezone America/New_York
```
*(CLI support coming in Phase 1, Task 2)*

## Profile Structure

Each profile includes:

- **Required constraints:** Must be implemented (feasibility + safety)
- **Recommended constraints:** Strongly suggested (fairness + quality)
- **Rationale:** Why each constraint exists
- **Default parameters:** Sensible starting values
- **Penalty models:** Suggested soft constraint weights
- **Metadata:** Adoption guidance and focus areas

## Extending Profiles

Profiles support:
- **Selectors:** Apply constraints to specific teams, venues, or fixture types
- **Parameter overrides:** Adjust thresholds for your context
- **Additional constraints:** Add sport-specific or league-specific rules
- **Penalty tuning:** Adjust soft constraint weights based on priorities

## Adoption Impact

Profiles enable leagues to:
- ✅ Be OSSS-compliant in minutes
- ✅ Understand trade-offs transparently
- ✅ Start with expert-validated constraints
- ✅ Customize without starting from scratch
- ✅ Document scheduling policies clearly

## Version History

- **v1.0.0** (2025-01-01): Initial baseline, youth, amateur, and professional profiles

## Contributing

To propose a new profile or modifications:
1. Open an issue describing the use case
2. Follow the [CONTRIBUTING.md](../CONTRIBUTING.md) process
3. Ensure profiles include clear rationale and metadata

---

**Sports scheduling should be transparent, portable, and fair.**
