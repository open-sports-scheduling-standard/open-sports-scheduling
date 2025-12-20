/**
 * OSSS Rule SDK Helpers
 *
 * Common utilities for rule authoring, validation, and penalty calculation.
 * Use these helpers to ensure consistent rule implementation across OSSS.
 */

/**
 * Validate rule parameters against a schema
 * @param {object} params - The rule parameters to validate
 * @param {object} schema - JSON schema definition
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateParams(params, schema) {
  const errors = [];

  if (!schema || !schema.required) {
    return { valid: true, errors: [] };
  }

  for (const field of schema.required) {
    if (!(field in params)) {
      errors.push(`Missing required parameter: ${field}`);
    }
  }

  if (schema.properties) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (key in params) {
        const value = params[key];

        if (propSchema.type === 'number' && typeof value !== 'number') {
          errors.push(`Parameter '${key}' must be a number`);
        }
        if (propSchema.type === 'integer' && (!Number.isInteger(value))) {
          errors.push(`Parameter '${key}' must be an integer`);
        }
        if (propSchema.minimum !== undefined && value < propSchema.minimum) {
          errors.push(`Parameter '${key}' must be >= ${propSchema.minimum}`);
        }
        if (propSchema.maximum !== undefined && value > propSchema.maximum) {
          errors.push(`Parameter '${key}' must be <= ${propSchema.maximum}`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Calculate linear penalty
 * @param {number} violation - Amount of violation
 * @param {number} perUnit - Penalty per unit of violation
 * @returns {number}
 */
export function linearPenalty(violation, perUnit = 1) {
  return Math.max(0, violation * perUnit);
}

/**
 * Calculate quadratic penalty
 * @param {number} violation - Amount of violation
 * @param {number} perUnit - Base penalty per unit
 * @param {number} exponent - Exponent for quadratic growth (default: 2)
 * @returns {number}
 */
export function quadraticPenalty(violation, perUnit = 1, exponent = 2) {
  return Math.max(0, perUnit * Math.pow(violation, exponent));
}

/**
 * Calculate exponential penalty
 * @param {number} violations - Number of violations
 * @param {number} base - Base penalty
 * @param {number} multiplier - Multiplier for each violation
 * @returns {number}
 */
export function exponentialPenalty(violations, base = 10, multiplier = 2) {
  return violations > 0 ? base * Math.pow(multiplier, violations - 1) : 0;
}

/**
 * Calculate flat penalty
 * @param {number} violations - Number of violations
 * @param {number} perViolation - Penalty per violation
 * @returns {number}
 */
export function flatPenalty(violations, perViolation = 100) {
  return violations * perViolation;
}

/**
 * Create a violation report for hard constraints
 * @param {string} ruleId - The constraint rule ID
 * @param {string} message - Human-readable violation message
 * @param {object} context - Additional context (team, venue, fixture, etc.)
 * @returns {object}
 */
export function createViolation(ruleId, message, context = {}) {
  return {
    ruleId,
    type: 'hard',
    message,
    context,
    timestamp: new Date().toISOString()
  };
}

/**
 * Create a penalty report for soft constraints
 * @param {string} ruleId - The constraint rule ID
 * @param {number} penalty - Penalty amount
 * @param {string} description - Description of why penalty was applied
 * @param {object} context - Additional context
 * @returns {object}
 */
export function createPenalty(ruleId, penalty, description = '', context = {}) {
  return {
    ruleId,
    type: 'soft',
    penalty: Math.max(0, penalty),
    description,
    context,
    timestamp: new Date().toISOString()
  };
}

/**
 * Parse ISO date string to Date object
 * @param {string} dateString - ISO 8601 date string
 * @returns {Date}
 */
export function parseDate(dateString) {
  return new Date(dateString);
}

/**
 * Calculate hours between two dates
 * @param {Date|string} start - Start date
 * @param {Date|string} end - End date
 * @returns {number} Hours between dates
 */
export function hoursBetween(start, end) {
  const startDate = typeof start === 'string' ? parseDate(start) : start;
  const endDate = typeof end === 'string' ? parseDate(end) : end;
  return (endDate - startDate) / (1000 * 60 * 60);
}

/**
 * Calculate days between two dates
 * @param {Date|string} start - Start date
 * @param {Date|string} end - End date
 * @returns {number} Days between dates
 */
export function daysBetween(start, end) {
  return hoursBetween(start, end) / 24;
}

/**
 * Check if two time ranges overlap
 * @param {object} range1 - {start, end}
 * @param {object} range2 - {start, end}
 * @returns {boolean}
 */
export function timeRangesOverlap(range1, range2) {
  const start1 = typeof range1.start === 'string' ? parseDate(range1.start) : range1.start;
  const end1 = typeof range1.end === 'string' ? parseDate(range1.end) : range1.end;
  const start2 = typeof range2.start === 'string' ? parseDate(range2.start) : range2.start;
  const end2 = typeof range2.end === 'string' ? parseDate(range2.end) : range2.end;

  return start1 < end2 && start2 < end1;
}

/**
 * Get fixtures for a specific team
 * @param {Array} fixtures - All fixtures
 * @param {string} teamId - Team ID
 * @returns {Array}
 */
export function getFixturesForTeam(fixtures, teamId) {
  return fixtures.filter(f => f.homeTeam === teamId || f.awayTeam === teamId);
}

/**
 * Get fixtures at a specific venue
 * @param {Array} fixtures - All fixtures
 * @param {string} venueId - Venue ID
 * @returns {Array}
 */
export function getFixturesForVenue(fixtures, venueId) {
  return fixtures.filter(f => f.venue === venueId);
}

/**
 * Sort fixtures by start time
 * @param {Array} fixtures - Fixtures to sort
 * @returns {Array} Sorted fixtures
 */
export function sortFixturesByTime(fixtures) {
  return [...fixtures].sort((a, b) => {
    const aStart = parseDate(a.startTime);
    const bStart = parseDate(b.startTime);
    return aStart - bStart;
  });
}

/**
 * Aggregate penalties
 * @param {Array} penalties - Array of penalty objects
 * @returns {number} Total penalty
 */
export function aggregatePenalties(penalties) {
  return penalties.reduce((sum, p) => sum + (p.penalty || 0), 0);
}

/**
 * Default selector matcher (matches all)
 * @param {object} selector - Selector definition
 * @param {object} entity - Entity to match against
 * @returns {boolean}
 */
export function matchesSelector(selector, entity) {
  if (!selector) return true;

  // Simple wildcard matching
  if (selector.teams === '*') return true;
  if (selector.venues === '*') return true;
  if (selector.fixtures === '*') return true;

  // Specific ID matching
  if (Array.isArray(selector.teams) && entity.teamId) {
    return selector.teams.includes(entity.teamId);
  }
  if (Array.isArray(selector.venues) && entity.venueId) {
    return selector.venues.includes(entity.venueId);
  }
  if (Array.isArray(selector.fixtures) && entity.fixtureId) {
    return selector.fixtures.includes(entity.fixtureId);
  }

  return true;
}
