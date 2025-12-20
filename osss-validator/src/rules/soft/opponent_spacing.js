import { applyPenaltyModel, clampNumber } from "../utils.js";

export default {
  ruleId: "opponent_spacing",
  type: "soft",
  evaluate: ({ constraint, idx }) => {
    const violations = [];
    const minDays = clampNumber(constraint.params?.min_days ?? 0);
    const penaltyDef = constraint.penalty;

    if (minDays <= 0) {
      return {
        violations,
        violationCount: 0,
        violationAmount: 0,
        penalty: 0,
        explanation: "min_days <= 0 (no spacing enforced)"
      };
    }

    const minMs = minDays * 24 * 60 * 60 * 1000;

    // Build pair -> times (use sorted canonical pair id)
    const pairTimes = new Map();

    for (const a of idx.assignments) {
      const f = idx.fixtures.get(a.fixtureId);
      if (!f?.participants || f.participants.length < 2) continue;

      const t1 = f.participants[0];
      const t2 = f.participants[1];
      const key = t1 < t2 ? `${t1}::${t2}` : `${t2}::${t1}`;

      if (!pairTimes.has(key)) pairTimes.set(key, []);
      pairTimes.get(key).push({ start: a._startMs, fixtureId: a.fixtureId });
    }

    let count = 0;
    let amount = 0;

    for (const [pair, games] of pairTimes) {
      games.sort((x, y) => x.start - y.start);
      for (let i = 1; i < games.length; i++) {
        const prev = games[i - 1];
        const cur = games[i];
        const gap = cur.start - prev.start;

        if (gap < minMs) {
          const shortByDays = (minMs - gap) / (24 * 60 * 60 * 1000);
          count += 1;
          amount += shortByDays;
          violations.push(
            `Opponent spacing violation for pair '${pair}': '${prev.fixtureId}' to '${cur.fixtureId}' short by ${shortByDays.toFixed(
              2
            )} days (min ${minDays})`
          );
        }
      }
    }

    const penalty = penaltyDef ? applyPenaltyModel(penaltyDef, amount) : 0;

    return {
      violations,
      violationCount: count,
      violationAmount: amount,
      penalty,
      explanation: count === 0 ? "Opponent spacing within limits" : "Some pairs played too close together"
    };
  }
};
