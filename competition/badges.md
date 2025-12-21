# OSSS Badges & Recognition

OSSS badges provide credibility signals for solvers, validators, and contributors. They indicate compliance, performance, and community standing.

---

## Badge Types

### 1. Conformance Badges

#### OSSS Conformant
**Criteria**: Validator passes all conformance tests
**Badge**: ![OSSS Conformant](https://img.shields.io/badge/OSSS-Conformant%20v1.0-brightgreen)
**Markdown**:
```markdown
[![OSSS Conformant](https://img.shields.io/badge/OSSS-Conformant%20v1.0-brightgreen)](https://opensportsscheduling.org/conformance)
```

**Requirements**:
- ✅ Pass all must-pass tests
- ✅ Correctly reject all must-fail tests
- ✅ Schema validation
- ✅ Registry compliance

**Verification**: Automated via `osss-validate conformance`

#### OSSS Verified Scores
**Criteria**: Results validated with attestation
**Badge**: ![OSSS Verified](https://img.shields.io/badge/OSSS-Verified%20Scores-blue)

**Requirements**:
- ✅ Cryptographic attestation
- ✅ Hash integrity
- ✅ Independent verification possible

### 2. Competition Badges

#### Track Winner Badges

**Gold Medal (1st Place)**
**Badge**: ![OSSS Gold](https://img.shields.io/badge/OSSS-Gold%20Medal%20🥇-gold)

**Silver Medal (2nd Place)**
**Badge**: ![OSSS Silver](https://img.shields.io/badge/OSSS-Silver%20Medal%20🥈-silver)

**Bronze Medal (3rd Place)**
**Badge**: ![OSSS Bronze](https://img.shields.io/badge/OSSS-Bronze%20Medal%20🥉-cd7f32)

**Top 10 Finisher**
**Badge**: ![OSSS Top 10](https://img.shields.io/badge/OSSS-Top%2010%20⭐-yellow)

#### Special Recognition

**Annual Champion 🏆**
**Criteria**: Best overall performance across all quarters
**Badge**: ![OSSS Champion](https://img.shields.io/badge/OSSS-Annual%20Champion%202025%20🏆-red)

**Innovation Award 🚀**
**Criteria**: Most novel approach (judged by committee)
**Badge**: ![OSSS Innovation](https://img.shields.io/badge/OSSS-Innovation%20Award%20🚀-purple)

**Efficiency Award ⚡**
**Criteria**: Fastest solver (runtime)
**Badge**: ![OSSS Efficiency](https://img.shields.io/badge/OSSS-Efficiency%20Award%20⚡-orange)

**Open Source Award 🌟**
**Criteria**: Best open-source contribution
**Badge**: ![OSSS Open Source](https://img.shields.io/badge/OSSS-Open%20Source%20Award%20🌟-green)

### 3. Participation Badges

**Participant**
**Badge**: ![OSSS Participant](https://img.shields.io/badge/OSSS-Participant%202025-lightblue)
**Criteria**: Valid submission to any track

**Multi-Track Participant**
**Badge**: ![OSSS Multi-Track](https://img.shields.io/badge/OSSS-Multi--Track%20Participant-teal)
**Criteria**: Submissions to 3+ tracks

**Consistent Competitor**
**Badge**: ![OSSS Consistent](https://img.shields.io/badge/OSSS-Consistent%20Competitor-navy)
**Criteria**: Submissions in 4 consecutive quarters

### 4. Performance Level Badges

**Elite Solver**
**Criteria**: Top 5% across any track
**Badge**: ![OSSS Elite](https://img.shields.io/badge/OSSS-Elite%20Solver-darkred)

**Expert Solver**
**Criteria**: Top 10% across any track
**Badge**: ![OSSS Expert](https://img.shields.io/badge/OSSS-Expert%20Solver-red)

**Advanced Solver**
**Criteria**: Top 25% across any track
**Badge**: ![OSSS Advanced](https://img.shields.io/badge/OSSS-Advanced%20Solver-orange)

### 5. Community Badges

**Dataset Contributor**
**Criteria**: Contributed 5+ datasets
**Badge**: ![OSSS Contributor](https://img.shields.io/badge/OSSS-Dataset%20Contributor-green)

**Documentation Helper**
**Criteria**: Significant documentation improvements
**Badge**: ![OSSS Docs](https://img.shields.io/badge/OSSS-Documentation%20Helper-blue)

**Bug Hunter**
**Criteria**: Reported and verified 10+ issues
**Badge**: ![OSSS Bug Hunter](https://img.shields.io/badge/OSSS-Bug%20Hunter-red)

**Code Contributor**
**Criteria**: Merged PR to core repository
**Badge**: ![OSSS Code](https://img.shields.io/badge/OSSS-Code%20Contributor-purple)

---

## Badge Levels

Some badges have progressive levels:

### OSSS Solver (Progressive)

**Level 1: Solver** - 1+ feasible submission
![Level 1](https://img.shields.io/badge/OSSS-Solver%20L1-lightgray)

**Level 2: Solver** - 5+ feasible submissions
![Level 2](https://img.shields.io/badge/OSSS-Solver%20L2-gray)

**Level 3: Solver** - 20+ feasible submissions
![Level 3](https://img.shields.io/badge/OSSS-Solver%20L3-darkgray)

**Level 4: Master** - 50+ feasible submissions + top-10 finish
![Level 4](https://img.shields.io/badge/OSSS-Master%20Solver-gold)

**Level 5: Grandmaster** - 100+ submissions + multiple wins
![Level 5](https://img.shields.io/badge/OSSS-Grandmaster-red)

---

## Badge Display

### On GitHub README

```markdown
# MyScheduler

[![OSSS Conformant](https://img.shields.io/badge/OSSS-Conformant%20v1.0-brightgreen)](https://opensportsscheduling.org/conformance)
[![OSSS Gold Medal](https://img.shields.io/badge/OSSS-Gold%20Medal%20🥇-gold)](https://opensportsscheduling.org/competition/leaderboard)
[![OSSS Verified](https://img.shields.io/badge/OSSS-Verified%20Scores-blue)](https://opensportsscheduling.org/attestation)

A sports scheduling solver optimized for...
```

### On Solver Websites

HTML embed:
```html
<img src="https://img.shields.io/badge/OSSS-Conformant%20v1.0-brightgreen" alt="OSSS Conformant">
<img src="https://img.shields.io/badge/OSSS-Gold%20Medal%20🥇-gold" alt="OSSS Gold Medal">
```

### On Competition Profiles

Automatically displayed on:
- Leaderboard entries
- Team profiles
- Solver pages
- Hall of Fame

---

## Earning Badges

### Automatic Awards
Immediately upon meeting criteria:
- Conformance badges
- Participation badges
- Performance level badges
- Competition medals

### Committee Awards
Judged annually:
- Innovation Award
- Open Source Award
- Community Choice Award

### Verification Process
1. Criteria met
2. Automated verification (where applicable)
3. Badge issued
4. Certificate generated
5. Public announcement

---

## Badge Verification

Each badge is verifiable:

```bash
osss-validate verify-badge \
  --team "AlphaScheduler" \
  --badge "gold-medal" \
  --track "track-2-amateur" \
  --period "2025-q1"
```

Returns:
```json
{
  "valid": true,
  "badge": {
    "type": "gold-medal",
    "awardedTo": "AlphaScheduler",
    "track": "track-2-amateur",
    "period": "2025-q1",
    "date": "2025-04-15",
    "rank": 1,
    "score": 98.7,
    "verificationHash": "abc123..."
  }
}
```

---

## Badge Registry

All badges recorded in public registry:

```
https://opensportsscheduling.org/badges/registry.json
```

Structure:
```json
{
  "version": "1.0.0",
  "updated": "2025-01-15T10:00:00Z",
  "badges": [
    {
      "badgeId": "badge-12345",
      "type": "gold-medal",
      "recipient": {
        "team": "AlphaScheduler",
        "division": "commercial"
      },
      "awarded": {
        "track": "track-2-amateur",
        "period": "2025-q1",
        "date": "2025-04-15",
        "rank": 1,
        "score": 98.7
      },
      "verification": {
        "attestationHash": "abc123...",
        "submissionId": "sub-12345"
      }
    }
  ]
}
```

---

## Certificate Generation

Winners receive digital certificates:

```bash
osss-validate generate-certificate \
  --team "AlphaScheduler" \
  --badge "gold-medal" \
  --track "track-2-amateur" \
  --output certificate.pdf
```

Certificate includes:
- Badge graphic
- Team name
- Competition details
- Score breakdown
- Verification QR code
- Digital signature

---

## Badge Revocation

Badges can be revoked for:
- ❌ Violation of rules
- ❌ Attestation fraud
- ❌ Plagiarism
- ❌ Code of conduct violations

Revocation process:
1. Investigation
2. Evidence review
3. Team notification
4. Appeal period (14 days)
5. Final decision
6. Public record update

---

## Hall of Fame

### Permanent Recognition

**OSSS Legends** - Multiple annual championships
**OSSS Innovators** - Multiple innovation awards
**OSSS Contributors** - Outstanding community service

Displayed at:
```
https://opensportsscheduling.org/hall-of-fame
```

---

## Badge Usage Guidelines

### Allowed
✅ Display on solver websites
✅ Include in README files
✅ Marketing materials (if accurate)
✅ Academic publications
✅ Professional profiles

### Prohibited
❌ Misrepresent badge level
❌ Display revoked badges
❌ Claim badges not earned
❌ Alter badge graphics
❌ Use for unrelated products

---

## Future Badges

Planned badges:
- **Perfect Score** - 100.0 composite score
- **Speed Demon** - Sub-second runtime
- **Consistency King** - Lowest score variance
- **Generalist** - Top-10 in all tracks
- **Specialist** - #1 in same track 4 quarters

---

## Badge API

### Get Team Badges

```bash
GET /api/v1/teams/{team-id}/badges
```

Response:
```json
{
  "team": "AlphaScheduler",
  "badges": [
    {
      "type": "gold-medal",
      "track": "track-2-amateur",
      "period": "2025-q1",
      "date": "2025-04-15"
    },
    {
      "type": "osss-conformant",
      "version": "1.0",
      "date": "2025-01-01"
    }
  ],
  "badgeCount": 12,
  "level": "master"
}
```

---

## Badge Widgets

### Dynamic Badge

```html
<img src="https://opensportsscheduling.org/api/v1/teams/AlphaScheduler/badge.svg" alt="Latest Badge">
```

Auto-updates with latest achievement.

### Badge Wall

```html
<iframe src="https://opensportsscheduling.org/widgets/badges/AlphaScheduler" width="600" height="200"></iframe>
```

Shows all badges earned.

---

**Recognition drives excellence.**
