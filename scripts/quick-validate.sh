#!/bin/bash
# ============================================================
# Quick OSSS Validation Script
# ------------------------------------------------------------
# Fast validation for development/testing
#
# Usage:
#   ./scripts/quick-validate.sh <instance> <result>
#
# Example:
#   ./scripts/quick-validate.sh instance.json result.json
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

if [ $# -ne 2 ]; then
  echo -e "${RED}Usage: $0 <instance-file> <result-file>${NC}"
  exit 1
fi

INSTANCE=$1
RESULT=$2

echo -e "${BLUE}🚀 Quick OSSS Validation${NC}"
echo ""

# Check files exist
if [ ! -f "$INSTANCE" ]; then
  echo -e "${RED}❌ Instance not found: $INSTANCE${NC}"
  exit 1
fi

if [ ! -f "$RESULT" ]; then
  echo -e "${RED}❌ Result not found: $RESULT${NC}"
  exit 1
fi

# Run validation
echo -e "${BLUE}Validating...${NC}"

if npx osss-validate result \
  --instance "$INSTANCE" \
  --result "$RESULT" \
  --schemas ./schemas \
  --registry ./registry \
  --verbose; then

  echo ""
  echo -e "${GREEN}✅ Validation passed${NC}"

  # Show key metrics
  if command -v jq &> /dev/null; then
    PENALTY=$(jq -r '.scores.totalPenalty // "unknown"' "$RESULT")
    FEASIBLE=$(jq -r '.feasible // "unknown"' "$RESULT")
    echo ""
    echo "Key Metrics:"
    echo -e "  Feasible: ${BLUE}$FEASIBLE${NC}"
    echo -e "  Penalty:  ${BLUE}$PENALTY${NC}"
  fi

  exit 0
else
  echo ""
  echo -e "${RED}❌ Validation failed${NC}"
  exit 1
fi
