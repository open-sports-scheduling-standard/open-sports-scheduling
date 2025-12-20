import { buildAjv, formatAjvErrors } from "./schema.js";
import { loadRegistry } from "./registry.js";

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
    for (const obj of instance.objectives) {
      if (!registry.objectiveIds.has(obj.metric)) {
        warnings.push(`Objective metric not found in registry: ${obj.metric}`);
      }
    }
  }

  if (Array.isArray(instance.constraints)) {
    for (const c of instance.constraints) {
      // Use rule name as registry key (your instances currently put rule == constraint id)
      if (!registry.constraintIds.has(c.rule)) {
        warnings.push(`Constraint rule not found in registry: ${c.rule}`);
      }
      if (c.type === "soft" && !c.penalty) {
        errors.push(`Soft constraint '${c.id}' missing penalty model`);
      }
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
