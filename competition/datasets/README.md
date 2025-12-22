# OSSS Competition Datasets

This directory contains sample datasets for the **Open Sports Scheduling Standard (OSSS) Competition**. Each dataset represents a real-world scheduling challenge at varying difficulty levels, designed to test scheduler implementations across different complexity dimensions.

## Competition Overview

The OSSS Competition challenges participants to build constraint-based schedulers that can produce high-quality, feasible schedules for sports leagues. Submissions are evaluated on:

1. **Constraint Satisfaction** - All hard constraints must be met
2. **Objective Optimization** - Minimize/maximize objective functions with appropriate weights
3. **Execution Time** - Faster solutions score higher (with diminishing returns)
4. **Schedule Quality** - Subjective evaluation of fairness, practicality, and robustness

## Competition Tracks

The competition is divided into four tracks, each with increasing complexity. **Multiple sample datasets are provided per track** to test scheduler robustness across different sports and scheduling scenarios:

### 🥉 Track 1: Youth (⭐⭐ Difficulty)

**Datasets:**
- `youth-track-sample-01.json` - Youth Soccer League (10 teams, 5 venues)
- `youth-track-sample-02.json` - Youth Basketball League (8 teams, shared gyms, 120h rest)

Small-scale youth leagues emphasizing player welfare and simplicity.

**Key Statistics:**
- **Teams:** 10 (5 boys U-12, 5 girls U-12)
- **Fixtures:** 40 (round-robin format)
- **Venues:** 5 community fields
- **Season:** 10 weeks (Spring 2026)
- **Hard Constraints:** 5
- **Objectives:** 3

**Complexity Factors:**
- ✅ Basic constraint set (no overlap, venue availability, rest time)
- ✅ Strict player welfare requirements (96-hour rest, 1 game per day max)
- ✅ Limited venue availability windows
- ✅ Travel minimization within local area

**Target Schedulers:**
- Entry-level implementations
- Educational tools
- Volunteer-run leagues with basic needs

---

### 🥈 Track 2: Amateur (⭐⭐⭐ Difficulty)

**Datasets:**
- `amateur-track-sample-01.json` - Amateur Hockey League (16 teams, 2 divisions, Midwest travel)
- `amateur-track-sample-02.json` - Beach Volleyball Association (12 teams, 3 conferences, weather-dependent venues)

Medium-scale regional leagues balancing cost efficiency with competitive fairness.

**Key Statistics:**
- **Teams:** 16 (8 Premier, 8 Division 1)
- **Fixtures:** 112 (round-robin within division)
- **Venues:** 8 ice rinks across Midwest region
- **Season:** 20 weeks (Fall/Winter 2025-26)
- **Hard Constraints:** 7
- **Objectives:** 4

**Complexity Factors:**
- ✅ Multi-division structure with separate round-robins
- ✅ Multi-resource venues (dual ice rinks)
- ✅ Regional travel optimization (200-400 mile trips)
- ✅ Cost-conscious scheduling (minimize ice rental conflicts)
- ✅ Venue blackout periods
- ✅ 72-hour rest requirements

**Target Schedulers:**
- Intermediate implementations
- Regional leagues with travel logistics
- Cost-sensitive organizations

---

### 🥇 Track 3: Professional (⭐⭐⭐⭐ Difficulty)

**Datasets:**
- `professional-track-sample-01.json` - Professional Basketball League (20 teams, 380 fixtures, national broadcast)
- `professional-track-sample-02.json` - Professional Baseball League (18 teams, series scheduling, doubleheaders)

Large-scale professional leagues with broadcast windows and revenue optimization.

**Key Statistics:**
- **Teams:** 20 (10 Eastern, 10 Western division)
- **Fixtures:** 380 (double round-robin, home and away)
- **Venues:** 20 professional arenas across North America
- **Season:** 28 weeks (October 2025 - April 2026)
- **Hard Constraints:** 8
- **Objectives:** 4

**Complexity Factors:**
- ✅ Large fixture set (380 games)
- ✅ Broadcast window constraints (prime time slots)
- ✅ Revenue maximization through optimal time slot allocation
- ✅ National travel logistics with time zone considerations
- ✅ Strict competitive balance requirements
- ✅ Arena availability coordination
- ✅ Holiday blackout periods
- ✅ 48-hour minimum rest for professional athletes

**Target Schedulers:**
- Advanced commercial implementations
- Professional leagues with broadcast contracts
- Revenue-focused organizations

---

### 🏆 Track 4: Multi-Division (⭐⭐⭐⭐⭐ Difficulty)

**Datasets:**
- `multi-division-track-sample-01.json` - Continental Soccer Pyramid (24 teams, 4 tiers, European travel)
- `multi-division-track-sample-02.json` - Professional Hockey System (20 teams, 3 tiers, NHL/AHL/ECHL affiliates)

Extremely complex multi-tier leagues with affiliate relationships, shared venues, and cross-border logistics.

**Key Statistics:**
- **Teams:** 24 (6 Premier, 6 Championship, 6 League One, 6 League Two)
- **Fixtures:** 140 (120 league + 20 cross-division cup fixtures)
- **Venues:** 23 stadiums across 5 European countries
- **Season:** 41 weeks (August 2025 - May 2026)
- **Hard Constraints:** 11 (including 5 with Selector DSL v2)
- **Objectives:** 6

**Complexity Factors:**
- ✅ Four-tier division structure with different formats
- ✅ Cross-division cup fixtures adding inter-tier complexity
- ✅ Shared venue coordination (e.g., Wembley used by 2 teams)
- ✅ International travel across 5 countries and time zones
- ✅ **Conditional constraints using Selector DSL v2:**
  - Tier-based rest requirements (96h for tier 1, 72h for others)
  - Shared venue separation rules
  - International travel buffers
  - Promotion zone fairness balancing
- ✅ Tier-weighted broadcast priorities
- ✅ Winter break and international match windows
- ✅ Promotion/relegation scheduling implications
- ✅ Complex travel clustering for international trips

**Target Schedulers:**
- Research-grade implementations
- Enterprise scheduler vendors
- Multi-competition federations
- State-of-the-art constraint programming systems

---

## Dataset File Structure

Each dataset JSON file follows the **OSSS v0.1.0 specification** and includes:

```json
{
  "version": "0.1.0",
  "metadata": {
    "instanceId": "...",
    "name": "...",
    "description": "...",
    "competitionDataset": true,
    "track": "youth|amateur|professional|multi-division",
    "difficultyRating": 2-5
  },
  "timeBounds": { ... },
  "teams": [ ... ],
  "fixtures": [ ... ],
  "venues": [ ... ],
  "constraints": [ ... ],
  "objectives": [ ... ]
}
```

### Key Sections

1. **metadata** - Dataset identification and competition track designation
2. **timeBounds** - Season boundaries and blackout periods
3. **teams** - Team definitions with home venues and location data
4. **fixtures** - Complete list of matches to be scheduled
5. **venues** - Venue resources and availability windows
6. **constraints** - Hard and soft constraints (weights for soft)
7. **objectives** - Optimization objectives with relative weights

---

## How to Use These Datasets

### 1. Validate Your Parser

First, ensure your scheduler can read OSSS JSON format:

```bash
osss-validate instance youth-track-sample-01.json
```

Expected output:
```
✓ Valid OSSS instance (v0.1.0)
✓ 10 teams, 40 fixtures, 5 venues
✓ 5 hard constraints, 0 soft constraints
✓ 3 objectives
```

### 2. Run Your Scheduler

Process the dataset with your scheduling engine:

```bash
my-scheduler --input youth-track-sample-01.json --output youth-solution.json --timeout 300
```

### 3. Validate Your Solution

Ensure the output meets OSSS result format requirements:

```bash
osss-validate result youth-solution.json --instance youth-track-sample-01.json
```

Expected output:
```
✓ Valid OSSS result (v0.1.0)
✓ All 40 fixtures scheduled
✓ No hard constraint violations detected
✓ Objective score: 145.2
  - minimize_travel_distance: 234.5 km
  - balance_home_away_distribution: 0.2 deviation
  - maximize_weekend_slots: 38/40 fixtures on weekends
```

### 4. Generate Attestation (Optional)

For competition submissions, generate a cryptographic attestation:

```bash
osss-validator attest youth-solution.json --instance youth-track-sample-01.json --output attestation.json
```

---

## Evaluation Criteria

Submissions are scored across four dimensions:

### 1. Feasibility (Pass/Fail - 40%)

**MANDATORY:** All hard constraints must be satisfied.

- `no_overlap_team` - No team plays multiple games simultaneously
- `no_overlap_venue` - No venue hosts multiple games simultaneously
- `min_rest_time` - Minimum rest hours between team fixtures
- `venue_availability` - Games only scheduled during venue availability windows
- `season_bounds` - All fixtures within season start/end dates
- `max_consecutive_away/home` - Consecutive game limits
- Division/tier-specific hard constraints

**Scoring:**
- ✅ Zero violations = PASS (proceed to other criteria)
- ❌ Any violation = FAIL (solution rejected)

### 2. Objective Quality (35%)

Solutions are ranked by weighted objective scores. Lower is better for minimization objectives:

**Common Objectives:**
- `minimize_total_travel` - Total distance traveled by all teams
- `balance_home_away` - Deviation from 50/50 home/away split
- `maximize_revenue` - Weighted sum of prime-time slot utilization
- `competitive_balance` - Fairness in schedule difficulty distribution

**Scoring Formula:**
```
score = Σ (weight_i × normalized_objective_i)
```

Normalization uses min-max scaling across all valid submissions.

### 3. Execution Time (15%)

Faster solutions score higher, with diminishing returns:

**Time Brackets:**
- < 10 seconds: 100%
- 10-60 seconds: 80%
- 60-300 seconds: 60%
- 300-600 seconds: 40%
- 600-1800 seconds: 20%
- \> 1800 seconds: 0%

**Note:** Time limits vary by track:
- Youth: 5 minutes (300s)
- Amateur: 10 minutes (600s)
- Professional: 30 minutes (1800s)
- Multi-Division: 60 minutes (3600s)

### 4. Schedule Quality (10%)

Expert judges evaluate practical considerations:

- **Fairness:** Are teams treated equitably?
- **Practicality:** Would this schedule work in reality?
- **Robustness:** How resilient is it to disruptions?
- **Interpretability:** Can humans understand the logic?

Judges score 1-10 across these dimensions, averaged for final quality score.

---

## Submission Guidelines

### Competition Submission Package

Each submission must include:

1. **Solution File** (required)
   - OSSS result JSON (`{track}-solution.json`)
   - Must pass `osss-validate result` checks

2. **Implementation Description** (required)
   - PDF or Markdown (max 4 pages)
   - Algorithm approach (CP, MIP, metaheuristic, hybrid, etc.)
   - Constraint handling techniques
   - Objective optimization strategies
   - Technology stack

3. **Attestation** (recommended)
   - Generated via `osss-validator attest`
   - Proves solution authenticity and reproducibility

4. **Source Code** (optional but encouraged)
   - For open-source entries
   - Must include build/run instructions

### File Naming Convention

```
{team-name}_{track}_{timestamp}.{ext}

Examples:
- university-xyz_youth_20260315.json
- acme-scheduler_professional_20260315.json
- research-lab_multi-division_20260315.pdf
```

### Submission Portal

Upload submissions to: **[competition.osss.org](https://competition.osss.org)** *(placeholder)*

---

## Leaderboard

Live leaderboards for each track are available at **[leaderboard.osss.org](https://leaderboard.osss.org)** *(placeholder)*

Rankings update hourly and show:
- Team name
- Feasibility status (✓ / ✗)
- Objective score
- Execution time
- Overall rank

---

## Dataset Versioning

All datasets in this directory are versioned:

| Dataset | Version | Release Date | Changes |
|---------|---------|--------------|---------|
| youth-track-sample-01.json | 1.0.0 | 2025-12-21 | Initial release (Soccer - 10 teams) |
| youth-track-sample-02.json | 1.0.0 | 2025-12-21 | Variant release (Basketball - 8 teams, shared gyms) |
| amateur-track-sample-01.json | 1.0.0 | 2025-12-21 | Initial release (Hockey - 16 teams, 2 divisions) |
| amateur-track-sample-02.json | 1.0.0 | 2025-12-21 | Variant release (Volleyball - 12 teams, 3 conferences) |
| professional-track-sample-01.json | 1.0.0 | 2025-12-21 | Initial release (Basketball - 20 teams) |
| professional-track-sample-02.json | 1.0.0 | 2025-12-21 | Variant release (Baseball - 18 teams, series scheduling) |
| multi-division-track-sample-01.json | 1.0.0 | 2025-12-21 | Initial release (Soccer - 24 teams, 4 tiers, Europe) |
| multi-division-track-sample-02.json | 1.0.0 | 2025-12-21 | Variant release (Hockey - 20 teams, 3 tiers, NHL/AHL/ECHL) |

**Note:** Multiple sample datasets are provided per track to test scheduler robustness across different sports and scenarios. Dataset files are immutable once released.

---

## Frequently Asked Questions

### Q: Can I use external solvers (Gurobi, OR-Tools, etc.)?

**A:** Yes! OSSS is solver-agnostic. Use any technology stack you prefer.

### Q: Are there restrictions on programming languages?

**A:** No restrictions. As long as you can read OSSS JSON and produce valid result files, any language works.

### Q: Can I submit to multiple tracks?

**A:** Absolutely. Teams are encouraged to submit to all four tracks.

### Q: What if my scheduler finds a solution but violates soft constraints?

**A:** Soft constraints are not mandatory. Violations reduce your objective score but don't disqualify the solution.

### Q: Can I use machine learning or heuristic methods?

**A:** Yes. Any approach is valid as long as it produces feasible, OSSS-compliant results.

### Q: How are ties broken?

**A:** In order of priority:
1. Objective quality score (lower is better)
2. Execution time (faster is better)
3. Schedule quality judge score
4. Timestamp (earlier submission wins)

### Q: Can I modify the datasets (add constraints, change weights)?

**A:** For competition submissions, you must use datasets unmodified. For research/practice, feel free to experiment!

### Q: Where can I ask questions or get support?

**A:** Join our community:
- GitHub Discussions: [github.com/osss-project/discussions](https://github.com/osss-project/discussions)
- Discord: [discord.gg/osss](https://discord.gg/osss) *(placeholder)*
- Email: competition@osss.org

---

## License and Usage

These datasets are released under the **Creative Commons CC0 1.0 Universal** license (public domain).

You may:
- ✅ Use datasets for research, education, or commercial purposes
- ✅ Modify datasets for experimentation
- ✅ Redistribute datasets with or without modification

We only ask that you:
- 📝 Cite the OSSS Competition when publishing results
- 🤝 Share insights and improvements with the community

**Citation:**
```bibtex
@misc{osss-competition-2026,
  title={OSSS Competition Datasets},
  author={{OSSS Competition Team}},
  year={2026},
  howpublished={\url{https://github.com/osss-project/competition}},
  note={Open Sports Scheduling Standard}
}
```

---

## Dataset Statistics Summary

| Track | Difficulty | Teams | Fixtures | Venues | Hard Constraints | Objectives | Avg. Solve Time* |
|-------|------------|-------|----------|--------|------------------|------------|------------------|
| Youth | ⭐⭐ | 10 | 40 | 5 | 5 | 3 | ~30 seconds |
| Amateur | ⭐⭐⭐ | 16 | 112 | 8 | 7 | 4 | ~3 minutes |
| Professional | ⭐⭐⭐⭐ | 20 | 380 | 20 | 8 | 4 | ~15 minutes |
| Multi-Division | ⭐⭐⭐⭐⭐ | 24 | 140 | 23 | 11 | 6 | ~25 minutes |

\* *Estimated solve time for reference CP solver on modern hardware (8-core CPU, 32GB RAM). Actual times vary significantly by approach.*

---

## Competition Timeline

- **🚀 Launch:** March 1, 2026
- **📝 Submissions Open:** March 1, 2026
- **🏁 Final Deadline:** May 31, 2026, 23:59 UTC
- **🏆 Winners Announced:** June 15, 2026

---

## Prizes

Track-specific prizes and overall grand prize to be announced. Stay tuned!

---

## Acknowledgments

These datasets were designed by the OSSS Competition Team with input from:
- Professional sports league schedulers
- Academic researchers in constraint programming
- Open-source scheduling tool developers
- Youth and amateur league administrators

Special thanks to all contributors who helped make OSSS a reality.

---

**Good luck to all participants! 🎉**

For more information about OSSS, visit:
- **Documentation:** [osss.org/docs](https://osss.org/docs)
- **Specification:** [osss.org/spec](https://osss.org/spec)
- **GitHub:** [github.com/osss-project](https://github.com/osss-project)
