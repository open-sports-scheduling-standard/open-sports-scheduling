/**
 * Parse a date string safely, returning NaN for invalid dates
 */
export function safeParseDate(dateStr) {
  if (!dateStr) return NaN;
  const ms = Date.parse(dateStr);
  return Number.isFinite(ms) ? ms : NaN;
}

/**
 * Calculate fixture end time based on start time and duration
 */
export function calculateEndTime(assignment, fixture, defaultDuration) {
  // If endTime is provided and valid, use it
  if (assignment.endTime) {
    const endMs = safeParseDate(assignment.endTime);
    if (Number.isFinite(endMs)) return endMs;
  }

  // Calculate from startTime + duration
  const startMs = safeParseDate(assignment.startTime);
  if (!Number.isFinite(startMs)) return NaN;

  const durationMinutes = fixture?.durationMinutes || defaultDuration || 90;
  return startMs + durationMinutes * 60 * 1000;
}

/**
 * Calculate distance between two geographic points using Haversine formula
 * Returns distance in kilometers
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function buildIndex(instance, result) {
  const teams = new Map((instance.entities?.teams || []).map((t) => [t.id, t]));
  const venues = new Map((instance.entities?.venues || []).map((v) => [v.id, v]));
  const officials = new Map((instance.entities?.officials || []).map((o) => [o.id, o]));
  const resources = new Map((instance.entities?.resources || []).map((r) => [r.id, r]));
  const fixtures = new Map((instance.fixtures || []).map((f) => [f.id, f]));

  const timezone = instance.timezone || "UTC";
  const defaultDuration = instance.defaultFixtureDuration || 90;

  // Track parsing errors for reporting
  const parseErrors = [];

  const assignments = (result.assignments || []).map((a) => {
    const startMs = safeParseDate(a.startTime);
    const fixture = fixtures.get(a.fixtureId);

    // Calculate endTime with fallback
    const endMs = calculateEndTime(a, fixture, defaultDuration);

    // Track invalid date parsing
    if (!Number.isFinite(startMs)) {
      parseErrors.push(`Assignment for fixture '${a.fixtureId}' has invalid startTime: '${a.startTime}'`);
    }

    // Track missing fixtures
    if (!fixture) {
      parseErrors.push(`Assignment references non-existent fixture: '${a.fixtureId}'`);
    }

    return {
      ...a,
      _startMs: startMs,
      _endMs: endMs,
      _durationMs: Number.isFinite(startMs) && Number.isFinite(endMs) ? endMs - startMs : NaN,
      _valid: Number.isFinite(startMs) && Number.isFinite(endMs),
      _local: Number.isFinite(startMs)
        ? getLocalParts(startMs, timezone)
        : { weekday: "Unknown", hhmm: "00:00" }
    };
  });

  const fixtureToAssignment = new Map(assignments.map((a) => [a.fixtureId, a]));

  // Check for fixtures without assignments
  const unassignedFixtures = [];
  for (const [fixtureId] of fixtures) {
    if (!fixtureToAssignment.has(fixtureId)) {
      const fixture = fixtures.get(fixtureId);
      // Skip conditional fixtures (they may not need assignment)
      if (!fixture?.conditional) {
        unassignedFixtures.push(fixtureId);
      }
    }
  }

  return {
    instance,
    result,
    timezone,
    defaultDuration,
    teams,
    venues,
    officials,
    resources,
    fixtures,
    assignments,
    fixtureToAssignment,
    parseErrors,
    unassignedFixtures
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

/**
 * Apply penalty model to calculate total penalty for a violation amount
 * Supports: linear, quadratic, exponential, logarithmic, step, flat, piecewise, lexicographic
 */
export function applyPenaltyModel(penaltyDef, violationAmount) {
  if (!penaltyDef) return 0;

  const x = Number(violationAmount) || 0;
  if (x <= 0) return 0;

  const weight = Number(penaltyDef.weight) || 0;
  const perViolation = Number(penaltyDef.perViolation) || 0;
  const exponent = Number(penaltyDef.exponent) || 2;
  const base = Number(penaltyDef.base) || Math.E;

  switch (penaltyDef.model || 'linear') {
    case "linear":
      // penalty = weight * x + perViolation * count
      return weight * x + perViolation;

    case "quadratic":
      // penalty = weight * x^exponent (default exponent=2)
      return weight * Math.pow(x, exponent);

    case "exponential":
      // penalty = weight * (base^x - 1)
      return weight * (Math.pow(base, x) - 1);

    case "logarithmic":
      // penalty = weight * ln(1 + x)
      return weight * Math.log(1 + x);

    case "step":
      // penalty = weight if x > 0, else 0 (binary penalty)
      return x > 0 ? weight : 0;

    case "flat":
      // penalty = weight per violation (same as step)
      return weight;

    case "lexicographic":
      // penalty = weight * 1e9 * x (ensures priority over lower-ranked constraints)
      return (weight || 1) * 1e9 * x;

    case "piecewise": {
      let remaining = x;
      let penalty = 0;

      const tiers = Array.isArray(penaltyDef.tiers) ? penaltyDef.tiers : [];

      // Sort tiers by upTo to ensure proper ordering
      const sortedTiers = [...tiers].sort((a, b) => (a.upTo || Infinity) - (b.upTo || Infinity));

      for (const tier of sortedTiers) {
        if (remaining <= 0) break;

        // Validate tier has positive upTo
        if (typeof tier.upTo === "number" && tier.upTo > 0) {
          const used = Math.min(remaining, tier.upTo);
          penalty += used * (tier.weight || 0);
          remaining -= used;
        } else if (typeof tier.above === "number") {
          // Handle remaining violations at final tier rate
          penalty += remaining * (tier.weight || 0);
          remaining = 0;
        }
      }

      // If there's remaining and no catch-all tier, apply base weight
      if (remaining > 0) {
        penalty += remaining * weight;
      }

      return penalty;
    }

    default:
      // Unknown model - fall back to linear
      return weight * x;
  }
}

/**
 * Get penalty model description for reporting
 */
export function describePenaltyModel(penaltyDef) {
  if (!penaltyDef) return "no penalty";

  const model = penaltyDef.model || "linear";
  const weight = penaltyDef.weight || 0;

  switch (model) {
    case "linear":
      return `${weight} per unit`;
    case "quadratic":
      return `${weight} * x^${penaltyDef.exponent || 2}`;
    case "exponential":
      return `${weight} * ${penaltyDef.base || 'e'}^x`;
    case "step":
    case "flat":
      return `${weight} per violation`;
    case "lexicographic":
      return `priority rank (weight=${weight})`;
    case "piecewise":
      return `tiered (${(penaltyDef.tiers || []).length} tiers)`;
    default:
      return `${model} (weight=${weight})`;
  }
}

