export function buildIndex(instance, result) {
  const teams = new Map((instance.entities?.teams || []).map((t) => [t.id, t]));
  const venues = new Map((instance.entities?.venues || []).map((v) => [v.id, v]));
  const fixtures = new Map((instance.fixtures || []).map((f) => [f.id, f]));

  const timezone = instance.timezone;

  const assignments = (result.assignments || []).map((a) => {
    const startMs = Date.parse(a.startTime);
    const endMs = Date.parse(a.endTime);
    return {
      ...a,
      _startMs: startMs,
      _endMs: endMs,
      _local: timezone
        ? getLocalParts(startMs, timezone)
        : getLocalParts(startMs, "UTC")
    };
  });

  const fixtureToAssignment = new Map(assignments.map((a) => [a.fixtureId, a]));

  return {
    instance,
    result,
    timezone,
    teams,
    venues,
    fixtures,
    assignments,
    fixtureToAssignment
  };
}

export function overlaps(aStart, aEnd, bStart, bEnd) {
  // overlap if intervals intersect (end is open)
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Extract local weekday + HH:MM for a timestamp in a given IANA timezone.
 */
export function getLocalParts(ms, timeZone) {
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "long" }).format(
    new Date(ms)
  );

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit"
  })
    .formatToParts(new Date(ms))
    .reduce((acc, p) => {
      if (p.type === "hour") acc.hh = p.value;
      if (p.type === "minute") acc.mm = p.value;
      return acc;
    }, { hh: "00", mm: "00" });

  return { weekday, hhmm: `${parts.hh}:${parts.mm}` };
}

export function hhmmToMinutes(hhmm) {
  const m = /^(\d{2}):(\d{2})$/.exec(String(hhmm));
  if (!m) return NaN;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  return hh * 60 + mm;
}

export function clampNumber(n) {
  return Number.isFinite(n) ? n : 0;
}

export function applyPenaltyModel(penaltyDef, violationAmount) {
  const x = Number(violationAmount) || 0;
  if (x <= 0) return 0;

  switch (penaltyDef.model) {
    case "linear":
      return (penaltyDef.weight || 0) * x;

    case "quadratic":
      return (penaltyDef.weight || 0) * x * x;

    case "lexicographic":
      return (penaltyDef.weight || 1) * 1e9 * x;

    case "piecewise": {
      let remaining = x;
      let penalty = 0;

      const tiers = Array.isArray(penaltyDef.tiers)
        ? penaltyDef.tiers
        : [];

      for (const tier of tiers) {
        if (remaining <= 0) break;

        if (typeof tier.upTo === "number") {
          const used = Math.min(remaining, tier.upTo);
          penalty += used * (tier.weight || 0);
          remaining -= used;
        } else if (typeof tier.above === "number") {
          penalty += remaining * (tier.weight || 0);
          remaining = 0;
        }
      }

      return penalty;
    }

    default:
      return 0;
  }
}

