/**
 * Selector DSL v2 for OSSS Constraints
 *
 * Supports advanced selector features:
 * - Boolean logic: allOf, anyOf, not
 * - Date ranges
 * - Competition phase
 * - Day of week
 * - Home/away filtering
 * - Division, age group
 * - Venue tags and properties
 *
 * This enables modeling real league rules without custom code.
 */

/**
 * Match a single entity against a selector
 * @param {object} entity - The entity to match (team, venue, fixture, etc.)
 * @param {object} selector - The selector criteria
 * @param {object} context - Additional context (instance, result, etc.)
 * @returns {boolean}
 */
export function matchesSelector(entity, selector, context = {}) {
  if (!selector) return true;
  if (selector === '*') return true;

  // Boolean logic operators
  if (selector.allOf) {
    return selector.allOf.every(sub => matchesSelector(entity, sub, context));
  }

  if (selector.anyOf) {
    return selector.anyOf.some(sub => matchesSelector(entity, sub, context));
  }

  if (selector.not) {
    return !matchesSelector(entity, selector.not, context);
  }

  // ID matching (simple or array)
  if (selector.id) {
    if (Array.isArray(selector.id)) {
      if (!selector.id.includes(entity.id)) return false;
    } else if (entity.id !== selector.id) {
      return false;
    }
  }

  if (selector.ids && Array.isArray(selector.ids)) {
    if (!selector.ids.includes(entity.id)) return false;
  }

  // Tag matching
  if (selector.tags) {
    const entityTags = new Set(entity.tags || []);
    const requiredTags = Array.isArray(selector.tags) ? selector.tags : [selector.tags];

    for (const tag of requiredTags) {
      if (!entityTags.has(tag)) return false;
    }
  }

  // Division matching
  if (selector.division !== undefined) {
    if (entity.division !== selector.division) return false;
  }

  // Age group matching
  if (selector.ageGroup !== undefined) {
    if (entity.ageGroup !== selector.ageGroup) return false;
  }

  // Venue property matching
  if (selector.venueType !== undefined) {
    if (entity.venueType !== selector.venueType) return false;
  }

  if (selector.capacity !== undefined) {
    if (typeof selector.capacity === 'object') {
      const cap = entity.capacity || 0;
      if (selector.capacity.min !== undefined && cap < selector.capacity.min) return false;
      if (selector.capacity.max !== undefined && cap > selector.capacity.max) return false;
    } else {
      if (entity.capacity !== selector.capacity) return false;
    }
  }

  return true;
}

/**
 * Match a fixture against temporal selectors (date, time, phase, etc.)
 * @param {object} fixture - The fixture to match
 * @param {object} selector - The selector criteria
 * @param {object} context - Additional context
 * @returns {boolean}
 */
export function matchesTemporalSelector(fixture, selector, context = {}) {
  if (!selector) return true;

  const fixtureStart = new Date(fixture.startTime);
  const fixtureEnd = new Date(fixture.endTime || fixture.startTime);

  // Date range matching
  if (selector.dateRange) {
    const { start, end } = selector.dateRange;

    if (start) {
      const rangeStart = new Date(start);
      if (fixtureStart < rangeStart) return false;
    }

    if (end) {
      const rangeEnd = new Date(end);
      if (fixtureEnd > rangeEnd) return false;
    }
  }

  // Day of week matching
  if (selector.dayOfWeek !== undefined) {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const fixtureDay = dayNames[fixtureStart.getDay()];

    const allowedDays = Array.isArray(selector.dayOfWeek) ? selector.dayOfWeek : [selector.dayOfWeek];

    if (!allowedDays.includes(fixtureDay)) return false;
  }

  // Competition phase matching
  if (selector.phase !== undefined) {
    const phases = Array.isArray(selector.phase) ? selector.phase : [selector.phase];
    if (!phases.includes(fixture.phase)) return false;
  }

  // Round matching
  if (selector.round !== undefined) {
    if (typeof selector.round === 'object') {
      if (selector.round.min !== undefined && fixture.round < selector.round.min) return false;
      if (selector.round.max !== undefined && fixture.round > selector.round.max) return false;
    } else {
      if (fixture.round !== selector.round) return false;
    }
  }

  return true;
}

/**
 * Match a team's role in a fixture (home/away)
 * @param {string} teamId - The team ID to check
 * @param {object} fixture - The fixture
 * @param {object} selector - The selector criteria
 * @returns {boolean}
 */
export function matchesTeamRole(teamId, fixture, selector) {
  if (!selector.role) return true;

  if (selector.role === 'home') {
    return fixture.homeTeam === teamId;
  }

  if (selector.role === 'away') {
    return fixture.awayTeam === teamId;
  }

  return true;
}

/**
 * Get fixtures matching a selector
 * @param {Array} fixtures - All fixtures
 * @param {object} selector - The selector criteria
 * @param {object} context - Additional context
 * @returns {Array}
 */
export function getMatchingFixtures(fixtures, selector, context = {}) {
  if (!selector) return fixtures;
  if (selector === '*') return fixtures;

  return fixtures.filter(fixture => {
    // Basic entity matching
    if (!matchesSelector(fixture, selector, context)) return false;

    // Temporal matching
    if (!matchesTemporalSelector(fixture, selector, context)) return false;

    return true;
  });
}

/**
 * Get teams matching a selector
 * @param {Array} teams - All teams
 * @param {object} selector - The selector criteria
 * @param {object} context - Additional context
 * @returns {Array}
 */
export function getMatchingTeams(teams, selector, context = {}) {
  if (!selector) return teams;
  if (selector === '*') return teams;

  return teams.filter(team => matchesSelector(team, selector, context));
}

/**
 * Get venues matching a selector
 * @param {Array} venues - All venues
 * @param {object} selector - The selector criteria
 * @param {object} context - Additional context
 * @returns {Array}
 */
export function getMatchingVenues(venues, selector, context = {}) {
  if (!selector) return venues;
  if (selector === '*') return venues;

  return venues.filter(venue => matchesSelector(venue, selector, context));
}

/**
 * Get fixtures for a team with optional selector
 * @param {Array} fixtures - All fixtures
 * @param {string} teamId - Team ID
 * @param {object} selector - Optional selector for filtering
 * @param {object} context - Additional context
 * @returns {Array}
 */
export function getTeamFixtures(fixtures, teamId, selector = null, context = {}) {
  let teamFixtures = fixtures.filter(f =>
    f.homeTeam === teamId || f.awayTeam === teamId
  );

  if (selector) {
    teamFixtures = teamFixtures.filter(f => {
      if (!matchesTemporalSelector(f, selector, context)) return false;
      if (!matchesTeamRole(teamId, f, selector)) return false;
      return true;
    });
  }

  return teamFixtures;
}

/**
 * Examples of Selector DSL v2 usage
 */
export const SELECTOR_EXAMPLES = {
  // Simple ID selection
  specificTeams: {
    ids: ['team-1', 'team-2', 'team-3']
  },

  // Tag-based selection
  youthTeams: {
    tags: ['youth', 'u18']
  },

  // Division selection
  premierDivision: {
    division: 'premier'
  },

  // Boolean logic - All of these conditions
  seniorHomeGames: {
    allOf: [
      { ageGroup: 'senior' },
      { role: 'home' }
    ]
  },

  // Boolean logic - Any of these conditions
  weekendOrEvening: {
    anyOf: [
      { dayOfWeek: ['saturday', 'sunday'] },
      { dateRange: { start: '17:00', end: '22:00' } }
    ]
  },

  // Boolean logic - Negation
  notPlayoffs: {
    not: {
      phase: 'playoffs'
    }
  },

  // Date range
  januaryFixtures: {
    dateRange: {
      start: '2025-01-01',
      end: '2025-01-31'
    }
  },

  // Day of week
  weekendGames: {
    dayOfWeek: ['saturday', 'sunday']
  },

  // Competition phase
  regularSeason: {
    phase: 'regular'
  },

  // Round range
  firstHalf: {
    round: {
      min: 1,
      max: 10
    }
  },

  // Complex combination
  youthWeekendRegularSeason: {
    allOf: [
      { tags: ['youth'] },
      { dayOfWeek: ['saturday', 'sunday'] },
      { phase: 'regular' }
    ]
  },

  // Venue capacity requirements
  largeVenues: {
    capacity: {
      min: 5000
    }
  },

  // Home games in specific venues
  homeGamesAtMainStadium: {
    allOf: [
      { role: 'home' },
      { ids: ['stadium-1', 'stadium-2'] }
    ]
  }
};
