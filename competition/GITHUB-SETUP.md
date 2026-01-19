# OSSS Competition - GitHub Setup Guide

**Version:** 1.0.0
**Last Updated:** 2025-01-01

Complete guide for setting up GitHub to compete in the OSSS Scheduling Challenge.

---

## Table of Contents

1. [Overview](#overview)
2. [Repository Setup](#repository-setup)
3. [Fork & Clone](#fork--clone)
4. [Branch Strategy](#branch-strategy)
5. [Submission Workflow](#submission-workflow)
6. [GitHub Actions Setup](#github-actions-setup)
7. [Pull Request Process](#pull-request-process)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The OSSS Competition uses **GitHub Pull Requests** for submissions. This enables:

- ✅ Automated validation via GitHub Actions
- ✅ Transparent judging and scoring
- ✅ Public leaderboards updated in real-time
- ✅ Verifiable badges and certificates
- ✅ Community review and discussion

---

## Repository Setup

### Prerequisites

1. **GitHub Account**
   ```bash
   # Create at: https://github.com/signup
   ```

2. **Git Installed**
   ```bash
   # Verify installation
   git --version
   # Should show: git version 2.x.x or higher
   ```

3. **Node.js Installed** (for local testing)
   ```bash
   # Verify installation
   node --version  # Should be 18.x or 20.x
   npm --version   # Should be 9.x or 10.x
   ```

---

## Fork & Clone

### Step 1: Fork the Repository

1. Go to: https://github.com/osss/open-sports-scheduling
2. Click **Fork** button (top right)
3. Select your account as the destination
4. Wait for fork to complete

### Step 2: Clone Your Fork

```bash
# Clone your fork (replace YOUR-USERNAME)
git clone https://github.com/YOUR-USERNAME/open-sports-scheduling.git
cd open-sports-scheduling

# Add upstream remote (for updates)
git remote add upstream https://github.com/osss/open-sports-scheduling.git

# Verify remotes
git remote -v
# Should show:
# origin    https://github.com/YOUR-USERNAME/open-sports-scheduling.git (fetch)
# origin    https://github.com/YOUR-USERNAME/open-sports-scheduling.git (push)
# upstream  https://github.com/osss/open-sports-scheduling.git (fetch)
# upstream  https://github.com/osss/open-sports-scheduling.git (push)
```

### Step 3: Install Dependencies

```bash
# Install OSSS validator
npm install

# Build validator
npm run build

# Test installation
npx osss-validate --version
```

### Step 4: Keep Fork Updated

```bash
# Fetch latest from upstream
git fetch upstream

# Merge updates into your main branch
git checkout main
git merge upstream/main

# Push updates to your fork
git push origin main
```

**Do this regularly** to stay current with:
- New competition instances
- Updated validation rules
- Bug fixes
- New datasets

---

## Branch Strategy

### Recommended Branching Model

```
main                    ← Your main branch (keep clean)
├── submission/track-1-v1   ← Branch for Track 1 submission
├── submission/track-2-v1   ← Branch for Track 2 submission
├── submission/track-2-v2   ← Improved Track 2 submission
└── dev/solver-improvements ← Development work
```

### Creating a Submission Branch

```bash
# Create branch for your submission
git checkout -b submission/track-2-amateur-v1

# Branch naming convention:
# submission/{track}-{version}
# Examples:
#   submission/track-1-youth-v1
#   submission/track-2-amateur-v2
#   submission/track-3-pro-v1
```

### Branch Lifecycle

1. **Create** branch for submission
2. **Develop** your solution
3. **Test** locally (see TESTING-GUIDE.md)
4. **Push** to your fork
5. **Create PR** to upstream
6. **Judge** validates automatically
7. **Merge** after approval (or iterate based on feedback)

---

## Submission Workflow

### Complete Workflow Example

```bash
# 1. Update your fork
git checkout main
git pull upstream main
git push origin main

# 2. Create submission branch
git checkout -b submission/track-2-amateur-v1

# 3. Download competition instance
TRACK="track-2-amateur"
INSTANCE="amateur-2025-01"
cp "competition/instances/${TRACK}/${INSTANCE}.json" instance.json

# 4. Run your solver
./my-solver --input instance.json --output result.json

# 5. Validate locally
osss-validate result \
  --instance instance.json \
  --result result.json \
  --schemas ./schemas \
  --registry ./registry \
  --fix-scores \
  --output verified.json

# 6. Create submission file
SOLVER="MySolver"
mkdir -p "submissions/${TRACK}"
cp verified.json "submissions/${TRACK}/${SOLVER}-${INSTANCE}.json"

# 7. Commit submission
git add "submissions/${TRACK}/${SOLVER}-${INSTANCE}.json"
git commit -m "feat: Track 2 Amateur submission - MySolver v1.0

- Algorithm: CP-SAT with custom heuristics
- Penalty: 1,234
- Runtime: 18.3s
- Track: ${TRACK}
- Instance: ${INSTANCE}"

# 8. Push to your fork
git push origin submission/track-2-amateur-v1

# 9. Create Pull Request (via GitHub UI)
# Go to: https://github.com/YOUR-USERNAME/open-sports-scheduling
# Click: "Compare & pull request"
```

### Commit Message Convention

Use this format for clarity:

```
feat: {Track Name} submission - {Solver} v{Version}

- Algorithm: {Brief description}
- Penalty: {Total penalty score}
- Runtime: {Solver runtime}
- Track: {track-id}
- Instance: {instance-id}
- Notes: {Optional notes}
```

**Example:**
```
feat: Track 2 Amateur submission - OptimaSolver v2.1

- Algorithm: Hybrid CP-SAT + Local Search
- Penalty: 845
- Runtime: 24.7s
- Track: track-2-amateur
- Instance: amateur-2025-01
- Notes: Improved travel optimization by 15%
```

---

## GitHub Actions Setup

### Understanding the Judge Workflow

The repository includes `.github/workflows/competition.yaml` which:

1. **Triggers on PR** to `main` branch
2. **Detects submission** in `submissions/` directory
3. **Validates** against schemas and constraints
4. **Re-scores** submission (anti-cheat)
5. **Updates** leaderboard (if test mode is OFF)
6. **Comments** results on PR

### Test Mode vs. Production Mode

The workflow has a toggle:

```yaml
env:
  OSSS_TEST_MODE: true  # Set to false for production
```

**Test Mode (`true`):**
- ✅ Validates your submission
- ✅ Comments on PR with results
- ❌ Does NOT update leaderboard
- ❌ Does NOT issue badges

**Production Mode (`false`):**
- ✅ Validates your submission
- ✅ Comments on PR with results
- ✅ Updates leaderboard
- ✅ Issues badges

**During development:** Keep test mode ON
**For competition:** Maintainers set to OFF

### Local GitHub Actions Testing (Optional)

Install `act` to test workflows locally:

```bash
# Install act (macOS)
brew install act

# Or (Linux)
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run workflow locally
act pull_request \
  --workflows .github/workflows/competition.yaml \
  --eventpath event.json
```

---

## Pull Request Process

### Step 1: Create Pull Request

1. Go to your fork on GitHub
2. Click **"Compare & pull request"** button
3. Fill in PR template:

```markdown
## Submission Details

**Solver:** MySolver v1.0
**Track:** Track 2 - Amateur League Optimization
**Instance:** amateur-2025-01

## Algorithm Approach

Brief description of your algorithm:
- Constraint Programming using OR-Tools CP-SAT
- Two-phase optimization: feasibility then cost minimization
- Custom branching heuristics for team assignment

## Performance

- **Total Penalty:** 1,234
- **Runtime:** 18.3 seconds
- **Memory:** 2.1 GB
- **Feasible:** Yes

## Improvements

Compared to previous submission:
- 15% reduction in travel distance
- 8% improvement in home/away balance

## Notes

Optional notes or special considerations.
```

4. Click **"Create pull request"**

### Step 2: Automated Validation

Within 1-2 minutes, GitHub Actions will:

1. **Validate** your submission
2. **Re-score** (ignore your submitted scores)
3. **Comment** results:

```markdown
## 🏟️ OSSS Submission Judged

**Solver:** `MySolver`
**Track:** `track-2-amateur`

**Result:** ✅ Feasible
**Total Penalty:** **1,234**

🔒 Scores recomputed by OSSS Validator
🧪 Test Mode: **ON (no artifacts committed)**
```

### Step 3: Review Results

**If validation passes:**
- ✅ Your PR will be marked as passing
- ✅ Leaderboard updated (production mode)
- ✅ Badges issued (production mode)
- ✅ PR can be merged

**If validation fails:**
- ❌ PR marked as failing
- ❌ Review error comments
- ❌ Fix issues and push updates
- ❌ Workflow re-runs automatically

### Step 4: Iterate or Merge

**If you need to improve:**
```bash
# Make changes to your solver
./my-solver --input instance.json --output improved-result.json

# Validate locally
osss-validate result \
  --instance instance.json \
  --result improved-result.json \
  --schemas ./schemas \
  --registry ./registry \
  --fix-scores \
  --output verified.json

# Update submission
cp verified.json "submissions/track-2-amateur/MySolver-amateur-2025-01.json"

# Commit and push
git add submissions/track-2-amateur/MySolver-amateur-2025-01.json
git commit -m "fix: Improved penalty score to 1,150"
git push origin submission/track-2-amateur-v1

# GitHub Actions will re-run automatically
```

**If satisfied:**
- Wait for maintainer review
- PR will be merged
- Leaderboard updated
- Badges issued

---

## Common Workflows

### Workflow 1: First-Time Competitor

```bash
# 1. Fork and clone
# (See Fork & Clone section)

# 2. Create submission branch
git checkout -b submission/track-1-youth-v1

# 3. Build your solver and generate result
./my-solver --input competition/instances/track-1-youth/youth-2025-01.json \
             --output result.json

# 4. Validate and create submission
osss-validate result \
  --instance competition/instances/track-1-youth/youth-2025-01.json \
  --result result.json \
  --schemas ./schemas \
  --registry ./registry \
  --fix-scores \
  --output submissions/track-1-youth/MySolver-youth-2025-01.json

# 5. Commit and push
git add submissions/track-1-youth/MySolver-youth-2025-01.json
git commit -m "feat: Track 1 Youth submission - MySolver v1.0"
git push origin submission/track-1-youth-v1

# 6. Create PR via GitHub UI
```

### Workflow 2: Multiple Track Submissions

```bash
# Submit to multiple tracks in separate PRs

# Track 1
git checkout main
git checkout -b submission/track-1-v1
# ... create submission ...
git push origin submission/track-1-v1
# Create PR #1

# Track 2
git checkout main
git checkout -b submission/track-2-v1
# ... create submission ...
git push origin submission/track-2-v1
# Create PR #2

# Track 3
git checkout main
git checkout -b submission/track-3-v1
# ... create submission ...
git push origin submission/track-3-v1
# Create PR #3
```

### Workflow 3: Improving Existing Submission

```bash
# Improve your Track 2 submission

# 1. Create new version branch
git checkout main
git checkout -b submission/track-2-v2

# 2. Run improved solver
./my-improved-solver --input instance.json --output better-result.json

# 3. Validate
osss-validate result \
  --instance instance.json \
  --result better-result.json \
  --schemas ./schemas \
  --registry ./registry \
  --fix-scores \
  --output submissions/track-2-amateur/MySolver-amateur-2025-01.json

# 4. Commit with improvement notes
git add submissions/track-2-amateur/MySolver-amateur-2025-01.json
git commit -m "feat: Track 2 Amateur v2 - 20% improvement

- Improved algorithm: added local search phase
- Previous penalty: 1,234
- New penalty: 987
- Improvement: 20%"

# 5. Push and create PR
git push origin submission/track-2-v2
```

---

## Troubleshooting

### Issue 1: Fork Out of Sync

**Problem:** Your fork is behind upstream

**Solution:**
```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

### Issue 2: Merge Conflicts

**Problem:** Your submission conflicts with upstream changes

**Solution:**
```bash
# Rebase your branch
git checkout submission/track-2-v1
git rebase main

# Resolve conflicts if any
# Then continue
git rebase --continue

# Force push (only to your fork!)
git push origin submission/track-2-v1 --force
```

### Issue 3: Workflow Not Running

**Problem:** GitHub Actions not triggering

**Checks:**
1. Verify file is in `submissions/` directory
2. Verify file ends with `.json`
3. Check workflow file exists: `.github/workflows/competition.yaml`
4. Check Actions tab for errors

### Issue 4: Multiple Files Detected

**Problem:** Judge rejects PR with "Exactly ONE submission JSON must be modified per PR"

**Solution:**
```bash
# Create separate PRs for each submission
# Only modify ONE file per branch

# If you accidentally added multiple:
git reset HEAD~1  # Undo last commit
git checkout -- unwanted-file.json  # Remove unwanted file
git add intended-file.json
git commit -m "feat: Single submission"
```

### Issue 5: PR Checks Failing

**Problem:** GitHub Actions shows red X

**Solution:**
1. Click "Details" on failed check
2. Review logs
3. Common fixes:
   ```bash
   # Schema errors
   jq . submission.json  # Validate JSON syntax

   # Missing fields
   jq 'keys' submission.json  # Check required fields

   # Hard constraints
   # Review error message and fix schedule
   ```

---

## Advanced Topics

### Using GitHub CLI

Install `gh` for faster workflow:

```bash
# Install GitHub CLI
brew install gh  # macOS
# or: https://cli.github.com/

# Authenticate
gh auth login

# Create PR from command line
git push origin submission/track-2-v1
gh pr create --title "Track 2 Amateur - MySolver v1.0" \
             --body "$(cat pr-template.md)"

# View PR status
gh pr status

# View PR checks
gh pr checks
```

### Automation Scripts

Create `scripts/submit.sh`:

```bash
#!/bin/bash
# Automated submission helper

set -e

TRACK=$1
INSTANCE=$2
SOLVER=$3
VERSION=$4

if [ -z "$TRACK" ] || [ -z "$INSTANCE" ] || [ -z "$SOLVER" ] || [ -z "$VERSION" ]; then
  echo "Usage: ./submit.sh <track> <instance> <solver> <version>"
  echo "Example: ./submit.sh track-2-amateur amateur-2025-01 MySolver v1.0"
  exit 1
fi

BRANCH="submission/${TRACK}-${VERSION}"

echo "🚀 Automated Submission"
echo "   Track: $TRACK"
echo "   Instance: $INSTANCE"
echo "   Solver: $SOLVER $VERSION"
echo ""

# 1. Create branch
git checkout main
git pull upstream main
git checkout -b "$BRANCH"

# 2. Run solver
echo "🤖 Running solver..."
./my-solver --input "competition/instances/${TRACK}/${INSTANCE}.json" \
            --output result.json

# 3. Validate
echo "✅ Validating..."
osss-validate result \
  --instance "competition/instances/${TRACK}/${INSTANCE}.json" \
  --result result.json \
  --schemas ./schemas \
  --registry ./registry \
  --fix-scores \
  --output "submissions/${TRACK}/${SOLVER}-${INSTANCE}.json"

# 4. Commit
echo "📝 Committing..."
git add "submissions/${TRACK}/${SOLVER}-${INSTANCE}.json"
git commit -m "feat: ${TRACK} submission - ${SOLVER} ${VERSION}"

# 5. Push
echo "⬆️  Pushing..."
git push origin "$BRANCH"

# 6. Create PR
echo "🎯 Creating PR..."
gh pr create --title "${TRACK} - ${SOLVER} ${VERSION}" \
             --body "Automated submission for ${TRACK}"

echo "✅ Complete! PR created."
```

**Usage:**
```bash
chmod +x scripts/submit.sh
./scripts/submit.sh track-2-amateur amateur-2025-01 MySolver v2.0
```

---

## Best Practices

1. **Keep Fork Updated**
   - Sync with upstream weekly
   - Before starting new submissions

2. **One Submission Per PR**
   - Easier to review
   - Clearer history
   - Faster validation

3. **Use Descriptive Branch Names**
   - `submission/track-2-v1` ✅
   - `my-changes` ❌

4. **Test Locally First**
   - Always validate before pushing
   - Use testing guide
   - Verify scores match

5. **Write Good PR Descriptions**
   - Describe algorithm
   - Include performance metrics
   - Note improvements

6. **Monitor GitHub Actions**
   - Check validation results
   - Review judge comments
   - Act on feedback quickly

---

## Support

### Resources
- [Testing Guide](./TESTING-GUIDE.md)
- [Competition Rules](./rules.md)
- [Track Specifications](./tracks.md)

### Getting Help
- **GitHub Discussions**: General questions
- **GitHub Issues**: Bug reports
- **Email**: competition@opensportsscheduling.org

---

**Ready to compete! Fork, code, submit, and win! 🏆**
