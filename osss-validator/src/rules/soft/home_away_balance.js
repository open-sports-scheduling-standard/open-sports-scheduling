import { applyPenaltyModel, clampNumber } from "../utils.js";

export default {
  ruleId: "home_away_balance",
  type: "soft",
  evaluate: ({ constraint, idx }) => {
    const violations = [];
    const maxDelta = clampNumber(constraint.params?.max_delta ?? 0);
    const penaltyDef = constraint.penalty;

    const homeCount = new Map();
    const awayCount = new Map();

    for (const a of idx.assignments) {
      const f = idx.fixtures.get(a.fixtureId);
      if (!f) continue;

      // Determine home/away:
      // 1) explicit homeTeamId/awayTeamId if present
      // 2) else fallback: participants[0] home, participants[1] away
      const home = f.homeTeamId || f.participants?.[0];
      const away = f.awayTeamId || f.participants?.[1];

      if (home) homeCount.set(home, (homeCount.get(home) || 0) + 1);
      if (away) awayCount.set(away, (awayCount.get(away) || 0) + 1);
    }

    let count = 0;
    let amount = 0;

    // Compute per-team delta violation beyond maxDelta
    for (const [teamId] of idx.teams) {
      const h = homeCount.get(teamId) || 0;
      const aw = awayCount.get(teamId) || 0;
      const delta = Math.abs(h - aw);
      const over = Math.max(0, delta - maxDelta);

      if (over > 0) {
        count += 1;
        amount += over;
        violations.push(
          `Team '${teamId}' home/away delta=${delta} exceeds max_delta=${maxDelta} by ${over} (home=${h}, away=${aw})`
        );
      }
    }

    const penalty = penaltyDef ? applyPenaltyModel(penaltyDef, amount) : 0;

    return {
      violations,
      violationCount: count,
      violationAmount: amount,
      penalty,
      explanation: count === 0 ? "Home/away balance within limits" : "Some teams exceed home/away delta"
    };
  }
};
