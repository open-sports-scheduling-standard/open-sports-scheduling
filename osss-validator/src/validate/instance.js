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

  // Registry references for objectives + constraints if present
  if (Array.isArray(instance.objectives)) {
    const unknownMetrics = [];
    for (const obj of instance.objectives) {
      if (!registry.objectiveIds.has(obj.metric)) {
        unknownMetrics.push(obj.metric);
        warnings.push(formatSuggestion("Objective metric", obj.metric, registry.objectiveList));
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
      // Use rule name as registry key (your instances currently put rule == constraint id)
      if (!registry.constraintIds.has(c.rule)) {
        unknownRules.push(c.rule);
        warnings.push(formatSuggestion("Constraint rule", c.rule, registry.constraintList));
      }
      if (c.type === "soft" && !c.penalty) {
        errors.push(`Soft constraint '${c.id}' missing penalty model`);
      }
    }
    // List all available constraints if any were unknown
    if (unknownRules.length > 0) {
      warnings.push(`Available constraint rules: ${registry.constraintList.join(", ")}`);
    }
  } else {
    warnings.push("No constraints[] found on instance (allowed, but unusual).");
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
      objectiveCount: instance.objectives?.length || 0,
      constraintCount: instance.constraints?.length || 0
    }
  };
}
