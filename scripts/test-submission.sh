#!/bin/bash
# ============================================================
# OSSS Submission Testing Script
# ------------------------------------------------------------
# Tests a competition submission locally before creating PR
#
# Usage:
#   ./scripts/test-submission.sh <submission-file>
#
# Example:
#   ./scripts/test-submission.sh submissions/track-2-amateur/MySolver-amateur-2025-01.json
# ============================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check arguments
if [ $# -ne 1 ]; then
  echo -e "${RED}❌ Error: Missing submission file${NC}"
  echo ""
  echo "Usage: $0 <submission-file>"
  echo "Example: $0 submissions/track-2-amateur/MySolver-amateur-2025-01.json"
  exit 1
fi

SUBMISSION=$1

# Check file exists
if [ ! -f "$SUBMISSION" ]; then
  echo -e "${RED}❌ Error: File not found: $SUBMISSION${NC}"
  exit 1
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🧪 OSSS Submission Testing${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "📄 Submission: ${BLUE}$SUBMISSION${NC}"

# Parse metadata
echo ""
echo -e "${BLUE}━━━ Step 1: Parse Metadata ━━━${NC}"

if ! command -v jq &> /dev/null; then
  echo -e "${RED}❌ Error: jq is required but not installed${NC}"
  echo "Install: brew install jq (macOS) or apt-get install jq (Linux)"
  exit 1
fi

TRACK=$(jq -r '.track' "$SUBMISSION" 2>/dev/null || echo "null")
SOLVER=$(jq -r '.solver.name' "$SUBMISSION" 2>/dev/null || echo "null")
INSTANCE_ID=$(jq -r '.instanceId' "$SUBMISSION" 2>/dev/null || echo "null")
FEASIBLE=$(jq -r '.feasible' "$SUBMISSION" 2>/dev/null || echo "null")
SUBMITTED_PENALTY=$(jq -r '.scores.totalPenalty // "unknown"' "$SUBMISSION" 2>/dev/null || echo "unknown")

if [ "$TRACK" = "null" ] || [ "$SOLVER" = "null" ] || [ "$INSTANCE_ID" = "null" ]; then
  echo -e "${RED}❌ Error: Submission missing required metadata${NC}"
  echo "   Required: track, solver.name, instanceId"
  exit 1
fi

echo -e "   Track:      ${GREEN}$TRACK${NC}"
echo -e "   Solver:     ${GREEN}$SOLVER${NC}"
echo -e "   Instance:   ${GREEN}$INSTANCE_ID${NC}"
echo -e "   Feasible:   ${GREEN}$FEASIBLE${NC}"
echo -e "   Penalty:    ${GREEN}$SUBMITTED_PENALTY${NC}"

# Locate instance
INSTANCE="competition/instances/${TRACK}/${INSTANCE_ID}.json"

if [ ! -f "$INSTANCE" ]; then
  echo -e "${RED}❌ Error: Instance file not found: $INSTANCE${NC}"
  echo "   Available instances:"
  ls -1 "competition/instances/${TRACK}/" 2>/dev/null || echo "   (none)"
  exit 1
fi

echo -e "   Instance file: ${GREEN}found${NC}"

# Step 2: JSON Syntax
echo ""
echo -e "${BLUE}━━━ Step 2: JSON Syntax ━━━${NC}"

if jq empty "$SUBMISSION" 2>/dev/null; then
  echo -e "${GREEN}✅ JSON syntax valid${NC}"
else
  echo -e "${RED}❌ JSON syntax error${NC}"
  exit 1
fi

# Step 3: Schema Validation
echo ""
echo -e "${BLUE}━━━ Step 3: Schema Validation ━━━${NC}"

# Check if validator is built
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}⚠️  Installing dependencies...${NC}"
  npm install
fi

# Check submission schema exists
SUBMISSION_SCHEMA="schemas/osss-submission.schema.json"
if [ -f "$SUBMISSION_SCHEMA" ]; then
  echo -e "   Using schema: ${GREEN}$SUBMISSION_SCHEMA${NC}"

  if npx ajv validate -s "$SUBMISSION_SCHEMA" -d "$SUBMISSION" --strict=false 2>&1 | grep -q "valid"; then
    echo -e "${GREEN}✅ Submission schema valid${NC}"
  else
    echo -e "${RED}❌ Schema validation failed${NC}"
    npx ajv validate -s "$SUBMISSION_SCHEMA" -d "$SUBMISSION" --strict=false
    exit 1
  fi
else
  echo -e "${YELLOW}⚠️  Submission schema not found, skipping${NC}"
fi

# Step 4: OSSS Validator
echo ""
echo -e "${BLUE}━━━ Step 4: OSSS Constraint Validation ━━━${NC}"

if ! npx osss-validate result \
  --instance "$INSTANCE" \
  --result "$SUBMISSION" \
  --schemas ./schemas \
  --registry ./registry; then
  echo -e "${RED}❌ Validation failed${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Constraints validated${NC}"

# Step 5: Score Verification
echo ""
echo -e "${BLUE}━━━ Step 5: Score Verification ━━━${NC}"

TEMP_VERIFIED=$(mktemp)

if npx osss-validate result \
  --instance "$INSTANCE" \
  --result "$SUBMISSION" \
  --schemas ./schemas \
  --registry ./registry \
  --fix-scores \
  --output "$TEMP_VERIFIED" 2>&1; then

  VERIFIED_PENALTY=$(jq -r '.scores.totalPenalty // "unknown"' "$TEMP_VERIFIED")

  echo -e "   Submitted penalty: ${BLUE}$SUBMITTED_PENALTY${NC}"
  echo -e "   Verified penalty:  ${BLUE}$VERIFIED_PENALTY${NC}"

  if [ "$SUBMITTED_PENALTY" = "$VERIFIED_PENALTY" ]; then
    echo -e "${GREEN}✅ Scores match - ready for submission${NC}"
  else
    echo -e "${YELLOW}⚠️  Score mismatch detected${NC}"
    echo -e "${YELLOW}   The competition judge will use: $VERIFIED_PENALTY${NC}"
    echo ""
    echo -e "${YELLOW}   Recommendation: Update your submission with verified scores:${NC}"
    echo -e "${YELLOW}   cp $TEMP_VERIFIED $SUBMISSION${NC}"
  fi
else
  echo -e "${RED}❌ Score verification failed${NC}"
  rm -f "$TEMP_VERIFIED"
  exit 1
fi

rm -f "$TEMP_VERIFIED"

# Step 6: File Location Check
echo ""
echo -e "${BLUE}━━━ Step 6: File Location Check ━━━${NC}"

EXPECTED_PATH="submissions/${TRACK}/${SOLVER}-${INSTANCE_ID}.json"

if [ "$SUBMISSION" = "$EXPECTED_PATH" ]; then
  echo -e "${GREEN}✅ File in correct location${NC}"
else
  echo -e "${YELLOW}⚠️  File location mismatch${NC}"
  echo -e "   Current:  ${BLUE}$SUBMISSION${NC}"
  echo -e "   Expected: ${BLUE}$EXPECTED_PATH${NC}"
  echo ""
  echo -e "${YELLOW}   Recommendation: Move file to expected location:${NC}"
  echo -e "${YELLOW}   mkdir -p submissions/${TRACK}${NC}"
  echo -e "${YELLOW}   mv $SUBMISSION $EXPECTED_PATH${NC}"
fi

# Summary
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ All tests passed!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Next steps:"
echo "1. Review any warnings above"
echo "2. Commit your submission:"
echo -e "   ${BLUE}git add $SUBMISSION${NC}"
echo -e "   ${BLUE}git commit -m \"feat: $TRACK submission - $SOLVER\"${NC}"
echo "3. Push to your fork:"
echo -e "   ${BLUE}git push origin <your-branch>${NC}"
echo "4. Create Pull Request on GitHub"
echo ""
echo "Good luck! 🏆"
