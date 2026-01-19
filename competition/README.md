# OSSS Scheduling Challenge

**The premier competition for sports scheduling algorithms**

Welcome to the OSSS Scheduling Challenge - an open competition that brings together researchers, commercial vendors, and practitioners to advance the state of the art in sports scheduling optimization.

---

## Quick Start

### 1. Choose Your Track

- **Track 1 (Youth)** ⭐⭐ - Beginner-friendly, 8-16 teams
- **Track 2 (Amateur)** ⭐⭐⭐ - Intermediate, 12-24 teams
- **Track 3 (Professional)** ⭐⭐⭐⭐ - Advanced, 16-32 teams
- **Track 4 (Multi-Division)** ⭐⭐⭐⭐⭐ - Expert, 40+ teams
- **Track 5 (Esports)** ⭐⭐⭐⭐ - Global esports tournaments
- **Track 6 (Master)** ⭐⭐⭐⭐⭐⭐ - Ultimate challenge: Multi-sport global championship

[Read more about tracks →](./tracks.md)

### 2. Download Dataset

```bash
# Training dataset for practice
wget https://opensportsscheduling.org/datasets/training/track-2-amateur/sample.json

# Or generate synthetic data
osss-validate dataset-generate \
  --track amateur \
  --num-teams 16 \
  --output my-instance.json
```

### 3. Develop Your Solver

Build an algorithm that generates a valid `osss-results.json` file.

### 4. Validate & Submit

```bash
# Validate your solution
osss-validate result \
  --instance instance.json \
  --result my-result.json \
  --schemas ../schemas \
  --registry ../registry \
  --attest \
  --output attestation.json

# Submit at: https://opensportsscheduling.org/submit
```

### 5. Track Your Ranking

View the leaderboard at:
```
https://opensportsscheduling.org/competition/leaderboard
```

---

## Competition Structure

### Tracks
Six difficulty levels catering to different expertise:
- Beginners → Track 1 (Youth)
- Intermediates → Track 2 (Amateur)
- Advanced → Track 3 (Professional)
- Experts → Track 4 (Multi-Division)
- Esports Specialists → Track 5 (Global Esports)
- Ultimate Challenge → Track 6 (Master Championship - Multi-Sport Global)

**NEW: Track 6 Master** combines all previous challenges plus multi-sport coordination, hybrid online/LAN scheduling, global time zones, and sustainability goals. The most complex scheduling problem in the competition!

[Full track details →](./tracks.md)

### Divisions
- **Open**: Any approach, collaboration welcome
- **Commercial**: Vendor products
- **Academic**: Research-focused

### Timeline
- **Quarterly Releases**: January, April, July, October
- **90-Day Submission Window** per problem
- **Annual Championship**: December rankings

---

## Resources

### Documentation
- [**Competition Rules**](./rules.md) - Official rules and conduct
- [**Tracks**](./tracks.md) - Track specifications and requirements
- [**Datasets**](./datasets.md) - Dataset catalog and generation tools
- [**Leaderboard**](./leaderboard.md) - Ranking methodology
- [**Badges**](./badges.md) - Recognition and awards
- [**Testing Guide**](./TESTING-GUIDE.md) - 📋 Complete testing plan for submissions
- [**GitHub Setup**](./GITHUB-SETUP.md) - 🔧 Fork, clone, and submission workflow

### Tools
```bash
# Generate synthetic datasets
osss-validate dataset-generate --track amateur --num-teams 16

# Anonymize real-world data
osss-validate dataset-anonymize --input real.json --output anon.json --verify

# Create dataset variants
osss-validate dataset-mutate --input base.json --mutation add-teams --output mutated.json

# Validate conformance
osss-validate conformance --conformance ../conformance --schemas ../schemas --registry ../registry
```

### Datasets
- **Training**: 45+ datasets for practice
- **Competition**: 4 new problems per quarter
- **Holdout**: Secret test sets

[Browse datasets →](./datasets.md)

---

## Prizes & Recognition

### Per-Track Winners
- 🥇 **Gold Medal** - 1st place
- 🥈 **Silver Medal** - 2nd place
- 🥉 **Bronze Medal** - 3rd place
- ⭐ **Top 10** - Recognition

### Special Awards
- 🏆 **Annual Champion** - Best overall year
- 🚀 **Innovation Award** - Most novel approach
- ⚡ **Efficiency Award** - Fastest solver
- 🌟 **Open Source Award** - Best open contribution

[All badges →](./badges.md)

---

## Getting Started Guide

### For Beginners

1. Start with **Track 1 (Youth)**
2. Use training datasets
3. Implement a greedy algorithm
4. Submit and learn from feedback
5. Iterate and improve

### For Experienced Practitioners

1. Choose **Track 2 or 3**
2. Download competition dataset
3. Apply your existing solver
4. Optimize for track-specific objectives
5. Compete for top rankings

### For Researchers

1. Target **Track 3 or 4**
2. Develop novel algorithms
3. Publish open-source implementations
4. Compete for Innovation Award
5. Contribute to benchmark library

---

## Example Workflow

```bash
# Step 1: Fork and clone repository
git clone https://github.com/YOUR-USERNAME/open-sports-scheduling.git
cd open-sports-scheduling
npm install

# Step 2: Download competition instance
TRACK="track-2-amateur"
INSTANCE="amateur-2025-01"
cp "competition/instances/${TRACK}/${INSTANCE}.json" instance.json

# Step 3: Develop your solver (your code here)
./my-solver --input instance.json --output result.json

# Step 4: Validate the result
osss-validate result \
  --instance instance.json \
  --result result.json \
  --schemas ./schemas \
  --registry ./registry \
  --fix-scores \
  --output verified.json

# Step 5: Test submission locally
./scripts/test-submission.sh "submissions/${TRACK}/MySolver-${INSTANCE}.json"

# Step 6: Create submission
mkdir -p "submissions/${TRACK}"
cp verified.json "submissions/${TRACK}/MySolver-${INSTANCE}.json"

# Step 7: Submit via Pull Request
git checkout -b submission/${TRACK}-v1
git add "submissions/${TRACK}/MySolver-${INSTANCE}.json"
git commit -m "feat: ${TRACK} submission - MySolver v1.0"
git push origin submission/${TRACK}-v1
# Create PR on GitHub

# See detailed guides:
# - Testing: ./competition/TESTING-GUIDE.md
# - GitHub Setup: ./competition/GITHUB-SETUP.md
```

---

## Key Features

### 🔒 Tamper-Proof
Cryptographic attestation ensures results are authentic and unmodified.

### 📊 Transparent
All rankings use standardized, verifiable metrics.

### 🌍 Open
Anyone can participate - no entry fees, no restrictions.

### 🏅 Credible
Winners earn recognized badges and certificates.

### 📈 Progressive
Four difficulty tracks support learning and growth.

### 🔬 Research-Friendly
Open datasets, reproducible results, academic citations.

---

## Community

### Discussion
- **GitHub Discussions**: Questions, ideas, collaboration
- **Competition Forum**: Track-specific discussions
- **Discord**: Real-time chat (coming soon)

### Contributing
- Submit datasets
- Report issues
- Improve documentation
- Share solvers (open division)

### Contact
- **General**: competition@opensportsscheduling.org
- **Technical Support**: support@opensportsscheduling.org
- **Rule Clarifications**: rules@opensportsscheduling.org
- **Appeals**: appeals@opensportsscheduling.org

---

## Frequently Asked Questions

**Q: Is there an entry fee?**
A: No, the competition is completely free.

**Q: Can I submit multiple times?**
A: Yes, your best score counts.

**Q: Do I need to share my code?**
A: Not required (except for Open Source Award).

**Q: How are results verified?**
A: Cryptographic attestation + independent verification. The competition judge automatically re-scores all submissions.

**Q: How do I test my submission before submitting?**
A: Use our testing guide and scripts:
- Read: [TESTING-GUIDE.md](./TESTING-GUIDE.md)
- Run: `./scripts/test-submission.sh your-submission.json`

**Q: How do I submit to the competition?**
A: Via GitHub Pull Request. See [GITHUB-SETUP.md](./GITHUB-SETUP.md) for complete instructions.

**Q: Can commercial vendors participate?**
A: Yes! We have a dedicated Commercial Division.

**Q: Are there cash prizes?**
A: Currently recognition-based, sponsorship welcome.

**Q: What if my scores don't match the validator?**
A: The judge will use the validator's scores. Always run `osss-validate result --fix-scores` before submitting.

**Q: How do I get started?**
A: Choose a track, download a dataset, build a solver, test locally, then submit via PR!

---

## Latest News

### Q1 2025 Competition
- **Release Date**: January 15, 2025
- **Submission Deadline**: April 15, 2025
- **New Datasets**: 4 (one per track)
- **Current Participants**: Register now!

### Recent Winners
- **Track 1**: TBD (Competition launching soon)
- **Track 2**: TBD
- **Track 3**: TBD
- **Track 4**: TBD

---

## Statistics

- **Datasets Available**: 45+ training, 20+ competition
- **Tracks**: 6 (Youth, Amateur, Pro, Multi-Division, Esports, Master)
- **Difficulty Levels**: 6 (⭐⭐ to ⭐⭐⭐⭐⭐⭐)
- **Divisions**: 3 (Open, Commercial, Academic)
- **Sports Types**: Traditional sports + Esports + Hybrid
- **Quarterly Releases**: 4 per year
- **Recognition Types**: 8+ badge categories

---

## Roadmap

### 2025 Q1
- ✅ Launch competition framework
- ✅ Release initial datasets
- ✅ Open Track 1-4 submissions
- [ ] First quarterly leaderboard

### 2025 Q2
- [ ] 100+ registered teams
- [ ] Innovation Award judging
- [ ] Dataset expansion (100+ total)
- [ ] Community solver library

### 2025 Q3
- [ ] Live leaderboard updates
- [ ] API access for automation
- [ ] Mobile leaderboard app
- [ ] Prize sponsorships

### 2025 Q4
- [ ] Annual Championship
- [ ] Hall of Fame launch
- [ ] Research paper track
- [ ] Global reach (multi-language)

---

## Join the Challenge!

**Make history in sports scheduling optimization.**

1. [Choose your track](./tracks.md)
2. [Read the rules](./rules.md)
3. [Download datasets](./datasets.md)
4. Build your solver
5. Submit and compete!

**Good luck! 🏆**

---

**The OSSS Scheduling Challenge: Where algorithms compete, and sports scheduling advances.**
