# OSSS Sport-Specific Examples

This directory contains realistic examples demonstrating the Open Sports Scheduling Standard (OSSS) across diverse sports.

## Overview

Each sport example includes:
- **osss-instance.json** - Problem definition (teams, venues, fixtures, constraints, objectives)
- **osss-results.json** - Sample solution with scheduled fixtures and scores

## Available Sport Examples

### Traditional Team Sports

#### Rugby Union 15s
**Directory:** `rugby-union-15s/`
**Example:** Six Nations Championship 2026
- 6 teams (England, France, Ireland, Italy, Scotland, Wales)
- Round-robin format
- International travel optimization
- Weekend broadcast windows
- 7-day minimum rest requirement

#### Cricket T20
**Directory:** `cricket-t20/`
**Example:** Indian Premier League (IPL) 2026
- 8 franchise teams
- Prime time evening slots (4pm, 8pm)
- Broadcast viewership optimization
- 48-hour minimum rest
- Weather and venue considerations

#### American Football
**Directory:** `american-football/`
**Example:** NFL 2026 - NFC East Division
- 4 teams (Dallas, NY Giants, Philadelphia, Washington)
- Division schedule format
- 7-day mandatory rest between games
- Sunday broadcast windows (1pm, 4:25pm, 8:20pm)
- Thanksgiving Day tradition constraints
- No 3 consecutive road games

#### Ice Hockey
**Directory:** `ice-hockey/`
**Example:** NHL 2025-2026 Original Six Rivalry
- 4 teams (Toronto, Montreal, Boston, Detroit)
- 48-hour minimum rest
- "Hockey Night in Canada" Saturday tradition
- Max 3 games in 4 days constraint
- Travel optimization across US/Canada border

### Court/Arena Sports

#### Basketball 5-on-5
**Directory:** `basketball-5on5/`
**Example:** Turkish Airlines EuroLeague 2025-2026
- 4 teams (Real Madrid, Barcelona, Anadolu Efes, Olympiacos)
- Double round-robin format
- Thursday/Friday EuroLeague game days
- 72-hour minimum rest
- European travel logistics
- Domestic league coordination

#### Volleyball - Indoor
**Directory:** `volleyball-indoor/`
**Example:** FIVB World Championship 2026
- 4 national teams (Poland, Brazil, USA, Italy)
- Pool play to knockout format
- 24-hour minimum rest
- Evening match slots (5pm, 8:30pm)
- Venue capacity optimization
- Championship final venue requirement

#### Tennis - Singles
**Directory:** `tennis-singles/`
**Example:** Wimbledon Championships 2026
- 8 players (seeded tournament)
- Single elimination format
- 48-hour minimum rest between rounds
- Centre Court final requirement
- Grass court surface
- Weather contingency (roofed courts)
- Afternoon start times (1pm, 2pm)

### Weather-Dependent Sports

#### Surfing - Shortboard
**Directory:** `surfing/`
**Example:** WSL Championship Tour - Pipeline Pro 2026
- 6 professional surfers
- **Waiting period format** (13-day window)
- Wave height requirements (6-20 ft)
- Tide conditions constraints
- Optimal wind direction (offshore)
- Daylight hours only (7am-6pm)
- Wave quality maximization
- **Most weather-dependent example**

### Existing Examples (Pre-existing)

#### Youth League
**Directory:** `youth-league/`
- Basic weekend-only schedule
- Minimal constraints
- Good for beginners

#### Amateur League
**Directory:** `amateur-league/`
- Multi-division structure
- Regional travel considerations

#### Professional League
**Directory:** `pro-league/`
- Complex broadcast constraints
- Revenue optimization

#### Esports Tournament
**Directory:** `esports-tournament/`
- Virtual venues (servers)
- Latency constraints
- Global time zone coordination

## Sport-Specific Scheduling Challenges

### Rest Time Requirements
- **American Football**: 168 hours (7 days)
- **Ice Hockey**: 48 hours minimum
- **Basketball**: 72 hours
- **Cricket T20**: 48 hours
- **Tennis**: 48 hours
- **Volleyball**: 24 hours
- **Surfing**: 3 hours (flexible due to weather)

### Broadcast Optimization
- **American Football**: Sunday slots (high value)
- **Cricket T20**: Evening primetime (4pm, 8pm IST)
- **Ice Hockey**: Saturday Night Hockey tradition
- **Basketball**: Thursday/Friday EuroLeague nights
- **Tennis**: Traditional afternoon starts

### Unique Constraints

#### Rugby Union 15s
- Home venue requirements
- International travel coordination
- Rest fairness across teams

#### American Football
- Thanksgiving Day games
- No Thursday games without 10-day rest
- Max 2 consecutive road games
- Prime time game limits

#### Cricket T20
- Dew factor (evening matches)
- Stadium availability (shared venues)
- Back-to-back away game limits

#### Surfing
- **Wave height range** (6-20 ft)
- **Swell direction** (NW/NNW optimal)
- **Wind conditions** (offshore preferred)
- **Tide requirements** (mid/high tide)
- **Waiting period** flexibility (1-13 days)
- **Daylight constraints**

#### Tennis (Wimbledon)
- Grass court maintenance
- Rain delays (roofed court priority)
- Centre Court for finals
- Traditional start times
- Best-of-5 sets duration

## Using These Examples

### 1. Validation
```bash
osss-validate instance examples/rugby-union-15s/osss-instance.json \
  --schemas ./schemas \
  --registry ./registry
```

### 2. Result Verification
```bash
osss-validate result examples/rugby-union-15s/osss-results.json \
  --instance examples/rugby-union-15s/osss-instance.json \
  --schemas ./schemas
```

### 3. As Templates
Copy and modify any example to create your own sport-specific schedules:
```bash
cp -r examples/cricket-t20 examples/my-cricket-league
# Edit JSON files with your specific data
```

### 4. Learning OSSS
Each example demonstrates different aspects of the standard:
- **Rugby Union 15s**: Home venue constraints, international travel
- **American Football**: Complex broadcast windows, specific date constraints
- **Cricket T20**: Franchise model, prime time optimization
- **Basketball**: Multi-country scheduling, domestic league coordination
- **Tennis**: Tournament brackets, court allocation, weather contingency
- **Surfing**: Weather-dependent scheduling, waiting periods, natural conditions
- **Ice Hockey**: Cross-border logistics, back-to-back game limits

## Difficulty Levels

### Beginner (⭐⭐)
- Youth League
- Amateur League

### Intermediate (⭐⭐⭐)
- Tennis Singles
- Volleyball Indoor
- Rugby Union 15s

### Advanced (⭐⭐⭐⭐)
- Cricket T20
- Basketball EuroLeague
- Ice Hockey NHL
- American Football NFL

### Expert (⭐⭐⭐⭐⭐)
- Surfing (weather-dependent)
- Professional League (multi-objective)
- Esports Tournament (global coordination)

## Sport Categories Represented

1. **Traditional Team Sports**: Rugby, Cricket, American Football, Ice Hockey
2. **Court/Arena Sports**: Basketball, Volleyball, Tennis
3. **Weather-Dependent**: Surfing (extreme), Tennis (moderate)
4. **Franchise Leagues**: Cricket IPL, Basketball EuroLeague
5. **International Competitions**: Rugby Six Nations, Volleyball World Championship, Tennis Wimbledon
6. **Professional Leagues**: NFL, NHL, WSL

## Key Insights from Examples

### Broadcast Optimization
- American Football: Sunday is king (3 time slots)
- Cricket T20: Evening prime time drives scheduling
- Ice Hockey: Saturday night tradition valued
- Tennis: Traditional afternoon starts preserved

### Travel Logistics
- Rugby Six Nations: 6 countries, ferry/flight complexity
- Basketball EuroLeague: 4+ countries, time zone coordination
- American Football: Minimize cross-country flights
- Ice Hockey: US/Canada border crossings

### Player Welfare
- Longer rest for contact sports (American Football: 7 days)
- Moderate rest for court sports (Basketball: 3 days)
- Flexible for individual sports (Tennis: 2 days)
- High-intensity sports (Ice Hockey: 2 days but max 3 in 4)

### Weather Integration
- Surfing: Fully dependent (waiting periods)
- Tennis: Moderate (roofed courts as backup)
- Cricket: Minimal (rare rain delays)
- Indoor sports: No weather dependency

## Contributing New Examples

To add a new sport example:

1. Create directory: `examples/[sport-name]/`
2. Add `osss-instance.json` with realistic data
3. Add `osss-results.json` with valid solution
4. Include sport-specific constraints
5. Document unique scheduling challenges
6. Update this README

## License

These examples are released under CC0 1.0 Universal (public domain).

---

**OSSS Examples - Demonstrating scheduling complexity across sports**
*From predictable indoor leagues to weather-dependent surfing competitions*
