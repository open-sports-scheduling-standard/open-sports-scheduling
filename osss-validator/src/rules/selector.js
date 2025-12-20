/**
 * Selector resolution for OSSS constraints
 *
 * Supported selector fields:
 * - entityType: team | venue | fixture | official
 * - ids: [string]
 * - tags: [string]
 */

export function resolveSelector({ selector, idx }) {
  if (!selector || !selector.entityType) {
    // No selector = apply to everything
    return {
      assignments: idx.assignments,
      fixtures: idx.fixtures,
      teams: idx.teams,
      venues: idx.venues,
      officials: idx.officials
    };
  }

  const { entityType, ids = [], tags = [] } = selector;

  const idSet = new Set(ids);
  const tagSet = new Set(tags);

  function matchesEntity(entity) {
    if (!entity) return false;
    if (idSet.size && !idSet.has(entity.id)) return false;
    if (tagSet.size) {
      const entityTags = new Set(entity.tags || []);
      for (const t of tagSet) {
        if (!entityTags.has(t)) return false;
      }
    }
    return true;
  }

  switch (entityType) {
    case "team": {
      const teams = new Map(
        [...idx.teams].filter(([_, t]) => matchesEntity(t))
      );

      const fixtures = new Map(
        [...idx.fixtures].filter(([_, f]) =>
          f.participants?.some((pid) => teams.has(pid))
        )
      );

      const assignments = idx.assignments.filter((a) =>
        fixtures.has(a.fixtureId)
      );

      return { assignments, fixtures, teams, venues: idx.venues };
    }

    case "venue": {
      const venues = new Map(
        [...idx.venues].filter(([_, v]) => matchesEntity(v))
      );

      const assignments = idx.assignments.filter((a) =>
        venues.has(a.venueId)
      );

      const fixtures = new Map(
        assignments.map((a) => [a.fixtureId, idx.fixtures.get(a.fixtureId)])
      );

      return { assignments, fixtures, teams: idx.teams, venues };
    }

    case "fixture": {
      const fixtures = new Map(
        [...idx.fixtures].filter(([_, f]) => matchesEntity(f))
      );

      const assignments = idx.assignments.filter((a) =>
        fixtures.has(a.fixtureId)
      );

      return { assignments, fixtures, teams: idx.teams, venues: idx.venues };
    }

    default:
      // Unknown entityType → fallback to full scope
      return {
        assignments: idx.assignments,
        fixtures: idx.fixtures,
        teams: idx.teams,
        venues: idx.venues
      };
  }
}
