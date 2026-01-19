# Sport Sample Datasets

This directory contains minimal sample datasets for all sport configurations supported by SCORE.

## Overview

Each sample follows the OSSS (Open Sports Scheduling Standard) format and includes:
- Basic metadata (sport name, type, track, difficulty)
- Minimal teams (typically 6-8 teams)
- At least one venue with resources
- Sample fixtures demonstrating the sport
- Core hard constraints (no overlap, rest time requirements)

These samples serve as templates for creating full competition datasets for each sport.

## Sport Samples by Category

### Rugby (3 configurations)
1. `rugby-union-legacy.json` - Rugby Union (Legacy)
2. `rugby-union-15s.json` - Rugby Union 15s
3. `rugby-union-7s.json` - Rugby Union 7s

### Soccer (3 configurations)
4. `soccer-legacy.json` - Soccer (Legacy)
5. `soccer-11-a-side.json` - Soccer 11-a-side
6. `soccer-futsal.json` - Futsal

### Cricket (4 configurations)
7. `cricket-legacy.json` - Cricket (Legacy)
8. `cricket-test.json` - Test Cricket
9. `cricket-odi.json` - One Day International (ODI)
10. `cricket-t20.json` - Twenty20 (T20)

### Hockey (3 configurations)
11. `field-hockey-legacy.json` - Field Hockey (Legacy)
12. `field-hockey.json` - Field Hockey
13. `ice-hockey.json` - Ice Hockey

### American Football (1 configuration)
14. `american-football.json` - American Football

### Badminton (1 configuration)
15. `badminton-singles.json` - Singles Badminton

### Baseball (1 configuration)
16. `baseball.json` - Baseball

### Basketball (2 configurations)
17. `basketball-3x3.json` - 3x3 Basketball
18. `basketball-5-on-5.json` - Basketball 5-on-5

### Bowling (1 configuration)
19. `bowling-ten-pin.json` - Ten Pin Bowling

### Boxing (1 configuration)
20. `boxing.json` - Boxing

### Sport Climbing (1 configuration)
21. `sport-climbing.json` - Sport Climbing

### Gaelic Football (1 configuration)
22. `gaelic-football.json` - Gaelic Football

### Go-Kart Racing (1 configuration)
23. `go-kart-racing.json` - Go-Kart Racing

### Handball (1 configuration)
24. `handball-team.json` - Team Handball

### Hurling (1 configuration)
25. `hurling.json` - Hurling

### Judo (1 configuration)
26. `judo.json` - Judo

### Lacrosse (1 configuration)
27. `lacrosse-field.json` - Field Lacrosse

### Mixed Martial Arts (1 configuration)
28. `mixed-martial-arts.json` - Mixed Martial Arts

### Netball (1 configuration)
29. `netball.json` - Netball

### Pickleball (1 configuration)
30. `pickleball-singles.json` - Singles Pickleball

### Racquetball (1 configuration)
31. `racquetball-singles.json` - Singles Racquetball

### Skateboarding (1 configuration)
32. `skateboarding.json` - Skateboarding

### Squash (1 configuration)
33. `squash-singles.json` - Singles Squash

### Surfing (1 configuration)
34. `surfing-shortboard.json` - Shortboard Surfing

### Table Tennis (1 configuration)
35. `table-tennis-singles.json` - Singles Table Tennis

### Taekwondo (1 configuration)
36. `taekwondo.json` - Taekwondo

### Tennis (2 configurations)
37. `tennis-singles.json` - Singles Tennis
38. `tennis-doubles.json` - Doubles Tennis

### Track & Field (1 configuration)
39. `track-100m-sprint.json` - Track 100m Sprint

### Ultimate Frisbee (1 configuration)
40. `ultimate-frisbee.json` - Ultimate Frisbee

### Volleyball (2 configurations)
41. `volleyball-beach.json` - Beach Volleyball
42. `volleyball-indoor.json` - Indoor Volleyball

### Water Polo (1 configuration)
43. `water-polo.json` - Water Polo

### Wrestling (1 configuration)
44. `wrestling-freestyle.json` - Freestyle Wrestling

## Total: 44 Sport Configurations

## Sample Structure

Each sample JSON file contains:

```json
{
  "osssVersion": "0.1.0",
  "instance": {
    "metadata": {
      "name": "...",
      "track": "youth|amateur|professional",
      "sport": "...",
      "sportType": "...",
      "season": "...",
      "timezone": "...",
      "difficulty": "⭐⭐ to ⭐⭐⭐⭐⭐",
      "estimatedComplexity": "low|moderate|high|very_high",
      "competitionDataset": true
    },
    "teams": [...],
    "venues": [...],
    "fixtures": [...],
    "constraints": [...]
  }
}
```

## Sport-Specific Characteristics

### Duration Ranges (minutes)
- **Cricket Test**: 2400 mins (5 days)
- **American Football**: 210 mins
- **Baseball**: 180 mins
- **Cricket ODI**: 480 mins
- **Cricket T20**: 210 mins
- **Basketball/Ice Hockey**: 120-150 mins
- **Soccer/Rugby 15s**: 90-105 mins
- **Futsal**: 50 mins
- **Rugby 7s**: 30 mins
- **Individual Sports**: 15-60 mins

### Rest Time Requirements (hours)
- **Combat Sports (Boxing, MMA)**: 720-1440 hrs (30-60 days)
- **American Football**: 168 hrs (7 days)
- **Rugby/Cricket**: 96-168 hrs (4-7 days)
- **Soccer/Hockey**: 48-96 hrs (2-4 days)
- **Basketball/Volleyball**: 48-72 hrs (2-3 days)
- **Individual Sports**: 2-6 hrs (same day possible)

### Venue Types
- **Physical Stadiums**: Soccer, American Football, Rugby
- **Arenas**: Basketball, Ice Hockey, Boxing
- **Courts**: Tennis, Badminton, Volleyball, Squash
- **Fields**: Cricket, Field Hockey, Lacrosse
- **Specialized**: Bowling alleys, Climbing walls, Swimming pools
- **Outdoor/Weather-dependent**: Surfing, Go-Kart Racing

## Usage

These samples can be used to:
1. **Test OSSS validators** - Ensure compatibility with all sport types
2. **Generate competition datasets** - Use as templates for full competitions
3. **Benchmark schedulers** - Test algorithms across diverse sports
4. **Documentation** - Demonstrate sport-specific constraints and characteristics

## Validation

All samples can be validated using:

```bash
osss-validate instance sport-samples/[sport-name].json \
  --schemas ../../schemas \
  --registry ../../registry
```

## License

These datasets are released under the **Creative Commons CC0 1.0 Universal** license (public domain).

---

**Generated for the OSSS Competition**
*Open Sports Scheduling Standard - Supporting 44+ sport configurations*
