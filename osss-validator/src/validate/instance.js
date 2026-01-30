import { buildAjv, formatAjvErrors } from "./schema.js";
import { loadRegistry, findClosestMatches } from "./registry.js";

/**
 * Format a suggestion message for unknown identifiers
 */
function formatSuggestion(type, unknown, availableIds) {
  const matches = findClosestMatches(unknown, availableIds, 3, 5);

  if (matches.length === 1) {
    return `${type} '${unknown}' not found in registry. Did you mean '${matches[0]}'?`;
  } else if (matches.length > 1) {
    return `${type} '${unknown}' not found in registry. Closest matches: ${matches.map(m => `'${m}'`).join(", ")}`;
  } else {
    return `${type} '${unknown}' not found in registry. No close matches found.`;
  }
}

/**
 * Validate cross-references between entities
 */
function validateCrossReferences(instance, warnings, errors) {
  const teamIds = new Set((instance.entities?.teams || []).map(t => t.id));
  const venueIds = new Set((instance.entities?.venues || []).map(v => v.id));
  const officialIds = new Set((instance.entities?.officials || []).map(o => o.id));
  const phaseIds = new Set((instance.season?.phases || []).map(p => p.id));

  // Validate team homeVenueId references
  for (const team of instance.entities?.teams || []) {
    if (team.homeVenueId && !venueIds.has(team.homeVenueId)) {
      errors.push(`Team '${team.id}' references non-existent venue '${team.homeVenueId}'`);
    }
  }

  // Validate fixture participants reference existing teams
  for (const fixture of instance.fixtures || []) {
    for (const p of fixture.participants || []) {
      const participantId = typeof p === 'string' ? p : p.id;
      // Skip conditional/placeholder IDs (e.g., "winner-A1", "TBD", "top-6")
      if (participantId && !participantId.includes('winner') &&
          !participantId.includes('loser') && !participantId.includes('TBD') &&
          !participantId.includes('top-') && !participantId.includes('bottom-') &&
          !participantId.match(/^\d+(st|nd|rd|th)-/)) {
        if (!teamIds.has(participantId)) {
          warnings.push(`Fixture '${fixture.id}' references unknown team '${participantId}'`);
        }
      }
    }

    // Validate phase references
    if (fixture.phase && phaseIds.size > 0 && !phaseIds.has(fixture.phase)) {
      warnings.push(`Fixture '${fixture.id}' references unknown phase '${fixture.phase}'`);
    }

    // Validate locked venue references
    if (fixture.lockedVenueId && !venueIds.has(fixture.lockedVenueId)) {
      errors.push(`Fixture '${fixture.id}' locked to non-existent venue '${fixture.lockedVenueId}'`);
    }
  }

  // Validate constraint selectors
  for (const c of instance.constraints || []) {
    if (c.selector?.ids) {
      for (const id of c.selector.ids) {
        const entityType = c.selector.entityType || 'team';
        const validIds = entityType === 'team' ? teamIds :
                        entityType === 'venue' ? venueIds :
                        entityType === 'official' ? officialIds : new Set();
        if (validIds.size > 0 && !validIds.has(id)) {
          warnings.push(`Constraint '${c.id}' selector references unknown ${entityType} '${id}'`);
        }
      }
    }
  }
}

export async function validateInstance({ instance, schemasDir, registryDir }) {
  const warnings = [];
  const errors = [];

  const ajv = await buildAjv(schemasDir);
  const registry = await loadRegistry(registryDir);

  // Core schema validation (instance must satisfy osss-core)
  const coreSchema = ajv.getSchema("https://opensportsscheduling.org/schemas/osss-core.schema.json")
    || ajv.getSchema("osss-core.schema.json");

  if (!coreSchema) {
    return {
      valid: false,
      exitCode: 1,
      summary: "Schema missing: osss-core",
      warnings,
      errors: ["Could not load osss-core schema"]
    };
  }

  const coreOk = coreSchema(instance);
  if (!coreOk) errors.push(...formatAjvErrors(coreSchema.errors));

  // Cross-reference validation
  validateCrossReferences(instance, warnings, errors);

  // Registry references for objectives + constraints if present
  if (Array.isArray(instance.objectives)) {
    const unknownMetrics = [];
    for (const obj of instance.objectives) {
      // v2: use metricId, fallback to metric for v1 compatibility
      const metricId = obj.metricId || obj.metric;
      if (metricId && !registry.objectiveIds.has(metricId)) {
        unknownMetrics.push(metricId);
        warnings.push(formatSuggestion("Objective metric", metricId, registry.objectiveList));
      }
    }
    // List all available objectives if any were unknown
    if (unknownMetrics.length > 0) {
      warnings.push(`Available objective metrics: ${registry.objectiveList.join(", ")}`);
    }
  }

  if (Array.isArray(instance.constraints)) {
    const unknownRules = [];
    for (const c of instance.constraints) {
      // v2: use ruleId, fallback to rule for v1 compatibility
      const ruleId = c.ruleId || c.rule;
      if (ruleId && !registry.constraintIds.has(ruleId)) {
        unknownRules.push(ruleId);
        warnings.push(formatSuggestion("Constraint rule", ruleId, registry.constraintList));
      }
      if (c.type === "soft" && !c.penalty) {
        errors.push(`Soft constraint '${c.id}' missing penalty`);
      }
    }
    // List all available constraints if any were unknown
    if (unknownRules.length > 0) {
      warnings.push(`Available constraint rules: ${registry.constraintList.join(", ")}`);
    }
  } else {
    warnings.push("No constraints[] found on instance (allowed, but unusual).");
  }

  // Sport-specific validation hints
  if (instance.sport) {
    const sportConstraints = {
      esports: ['server_latency_fairness', 'regional_time_balance'],
      surfing: ['weather_conditions', 'tide_conditions', 'wave_quality'],
      american_football: ['min_rest_time', 'broadcast_window'],
      ice_hockey: ['max_games_in_period', 'min_rest_time']
    };
    const recommended = sportConstraints[instance.sport];
    if (recommended) {
      const definedRules = new Set((instance.constraints || []).map(c => c.ruleId || c.rule));
      for (const rec of recommended) {
        if (!definedRules.has(rec)) {
          warnings.push(`Consider adding '${rec}' constraint for ${instance.sport}`);
        }
      }
    }
  }

  const valid = errors.length === 0;
  return {
    valid,
    exitCode: valid ? 0 : 1,
    summary: valid ? "Instance is valid" : "Instance validation failed",
    warnings,
    errors,
    details: {
      instanceId: instance.id,
      sport: instance.sport,
      teamCount: instance.entities?.teams?.length || 0,
      venueCount: instance.entities?.venues?.length || 0,
      fixtureCount: instance.fixtures?.length || 0,
      objectiveCount: instance.objectives?.length || 0,
      constraintCount: instance.constraints?.length || 0
    }
  };
}
