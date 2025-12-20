import { hhmmToMinutes, applyPenaltyModel } from "../utils.js";

export default {
  ruleId: "broadcast_window",
  type: "soft",
  evaluate: ({ constraint, idx }) => {
    const violations = [];
    const windows = constraint.params?.allowed_windows;
    const penaltyDef = constraint.penalty;

    if (!Array.isArray(windows) || windows.length === 0) {
      return {
        violations,
        violationCount: 0,
        violationAmount: 0,
        penalty: 0,
        explanation: "No allowed_windows provided"
      };
    }

    let count = 0;

    for (const a of idx.assignments) {
      // Selector support could be expanded; reference version applies to all fixture assignments.
      const { weekday, hhmm } = a._local;
      const t = hhmmToMinutes(hhmm);

      const ok = windows.some((w) => {
        if (!w?.day || !w?.start || !w?.end) return false;
        if (String(w.day) !== weekday) return false;
        const start = hhmmToMinutes(w.start);
        const end = hhmmToMinutes(w.end);
        if (!Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(t)) return false;
        return t >= start && t <= end;
      });

      if (!ok) {
        count += 1;
        violations.push(
          `Fixture '${a.fixtureId}' at ${weekday} ${hhmm} is outside allowed broadcast windows`
        );
      }
    }

    // Violation amount = count (unit: fixtures)
    const amount = count;
    const penalty = penaltyDef ? applyPenaltyModel(penaltyDef, amount) : 0;

    return {
      violations,
      violationCount: count,
      violationAmount: amount,
      penalty,
      explanation: count === 0 ? "All fixtures within broadcast windows" : "Some fixtures outside windows"
    };
  }
};
