// src/validate/result.js
import path from "node:path";
import { loadSchemas } from "./schema-loader.js";

function formatAjvErrors(errors = []) {
  return errors.map((e) => {
    const loc = e.instancePath || "(root)";
    const msg = e.message || "schema error";
    const extra = e.params ? ` (${JSON.stringify(e.params)})` : "";
    return `${loc} ${msg}${extra}`;
  });
}

/**
 * Attempt to find the results schema in a flexible way.
 * This avoids hard-coding one filename while OSSS evolves.
 */
function findResultsSchema({ getSchemaByFileName, getSchemaById }) {
  const candidatesByName = [
    "osss-results.schema.json",
    "osss-result.schema.json",
    "results.schema.json",
    "result.schema.json",
  ];

  for (const name of candidatesByName) {
    const s = getSchemaByFileName(name);
    if (s) return s;
  }

  // Fallback: scan for an $id that contains "result"
  // (We can't iterate internal maps here, so we rely on common IDs if you set them.)
  const commonIds = [
    "osss://schemas/osss-results.schema.json",
    "osss://schemas/osss-result.schema.json",
    "https://open-sports-scheduling-standard.org/schemas/osss-results.schema.json",
    "https://open-sports-scheduling-standard.org/schemas/osss-result.schema.json",
  ];
  for (const id of commonIds) {
    const s = getSchemaById(id);
    if (s) return s;
  }

  return null;
}

/**
 * Attempt to normalize a solver-output result into canonical schema form.
 * Many solvers output results in alternative structures (e.g., schedule.fixtures
 * instead of assignments, or nested feasibility flags). This function attempts
 * to map common alternative layouts to the canonical schema.
 *
 * Returns { normalized, warnings } where warnings lists format deviations.
 */
function normalizeResult(result) {
  const warnings = [];
  const normalized = { ...result };

  // Normalize feasible: try multiple locations
  if (normalized.feasible === undefined) {
    if (result?.details?.feasible !== undefined) {
      normalized.feasible = result.details.feasible;
      warnings.push("Result uses 'details.feasible' instead of top-level 'feasible'");
    } else if (result?.schedule?.feasible !== undefined) {
      normalized.feasible = result.schedule.feasible;
      warnings.push("Result uses 'schedule.feasible' instead of top-level 'feasible'");
    } else {
      // If there are assignments/schedule, assume feasible
      const hasData = result?.assignments || result?.schedule?.fixtures;
      normalized.feasible = Boolean(hasData);
      if (hasData) {
        warnings.push("Result missing 'feasible' field, inferred true from presence of schedule data");
      }
    }
  }

  // Normalize assignments: map from alternative fixture array locations
  if (!Array.isArray(normalized.assignments)) {
    const altFixtures = result?.schedule?.fixtures || result?.scheduledFixtures || result?.fixtures;
    if (Array.isArray(altFixtures)) {
      const sourceKey = result?.schedule?.fixtures ? "schedule.fixtures"
        : result?.scheduledFixtures ? "scheduledFixtures"
        : "fixtures";
      normalized.assignments = altFixtures.map(f => ({
        fixtureId: f.fixtureId || f.id,
        startTime: f.startTime || f.dateTime,
        endTime: f.endTime || undefined,
        venueId: f.venueId || f.venue,
        ...(f.officialIds ? { officialIds: f.officialIds } : {}),
      }));
      warnings.push(`Result uses '${sourceKey}' format instead of 'assignments' array (${normalized.assignments.length} fixtures mapped)`);
    }
  }

  // Normalize scores: try multiple locations
  if (!normalized.scores) {
    if (result?.score) {
      normalized.scores = result.score;
      warnings.push("Result uses 'score' instead of 'scores'");
    } else if (result?.scoring) {
      normalized.scores = result.scoring;
      warnings.push("Result uses 'scoring' instead of 'scores'");
    } else {
      // Construct minimal scores from available data
      const totalPenalty =
        typeof result?.totalPenalty === "number" ? result.totalPenalty
        : typeof result?.schedule?.totalPenalty === "number" ? result.schedule.totalPenalty
        : typeof result?.details?.totalPenalty === "number" ? result.details.totalPenalty
        : 0;

      const byConstraint = result?.constraintResults || result?.schedule?.constraintResults || [];

      normalized.scores = {
        totalPenalty,
        byConstraint: Array.isArray(byConstraint) ? byConstraint.map(c => ({
          constraintId: c.constraintId || c.id || c.ruleId,
          violations: c.violations ?? 0,
          penalty: c.penalty ?? 0,
          ...(c.explanation ? { explanation: c.explanation } : {}),
        })) : []
      };
      warnings.push("Result missing 'scores' object, constructed from available data");
    }
  }

  return { normalized, warnings };
}

/**
 * Validate an OSSS results file against the OSSS results schema.
 *
 * @param {object} args
 * @param {object} args.instance - parsed osss-instance.json
 * @param {object} args.result   - parsed osss-results.json
 * @param {string} args.schemasDir
 * @param {string} args.registryDir  - kept for future rule evaluation (not required for schema validation)
 */
export async function validateResult({ instance, result, schemasDir, registryDir }) {
  try {
    const { ajv, getSchemaByFileName, getSchemaById } = await loadSchemas({ schemasDir });

    const resultsSchema = findResultsSchema({ getSchemaByFileName, getSchemaById });

    if (!resultsSchema) {
      return {
        valid: false,
        exitCode: 1,
        summary: "Could not locate OSSS results schema in schemas directory",
        warnings: [],
        errors: [
          `No results schema found. Expected one of: osss-results.schema.json / osss-result.schema.json (or a schema with a stable $id).`,
          `Schemas dir: ${schemasDir}`,
        ],
        details: { feasible: false, totalPenalty: Number.POSITIVE_INFINITY },
      };
    }

    const validate = ajv.getSchema(resultsSchema.$id) || ajv.compile(resultsSchema);

    // First try strict validation
    let ok = validate(result);
    let normalizeWarnings = [];
    let validatedResult = result;

    // If strict validation fails, try normalizing the result format
    if (!ok) {
      const { normalized, warnings: nw } = normalizeResult(result);
      normalizeWarnings = nw;
      validatedResult = normalized;

      // Re-validate with the normalized version
      ok = validate(normalized);
    }

    if (!ok) {
      return {
        valid: false,
        exitCode: 1,
        summary: "Result JSON failed schema validation",
        warnings: normalizeWarnings,
        errors: formatAjvErrors(validate.errors),
        details: { feasible: false, totalPenalty: null },
      };
    }

    // Extract feasibility and penalty from the validated result
    const feasible = Boolean(validatedResult?.feasible ?? validatedResult?.details?.feasible ?? true);

    const totalPenalty =
      typeof validatedResult?.scores?.totalPenalty === "number"
        ? validatedResult.scores.totalPenalty
        : typeof validatedResult?.totalPenalty === "number"
          ? validatedResult.totalPenalty
          : typeof validatedResult?.score?.totalPenalty === "number"
            ? validatedResult.score.totalPenalty
            : typeof validatedResult?.details?.totalPenalty === "number"
              ? validatedResult.details.totalPenalty
              : 0;

    return {
      valid: true,
      exitCode: 0,
      summary: normalizeWarnings.length > 0
        ? "Result valid (after normalization from alternative format)"
        : "Result JSON is schema-valid",
      warnings: normalizeWarnings,
      errors: [],
      details: {
        feasible,
        totalPenalty,
      },
    };
  } catch (err) {
    return {
      valid: false,
      exitCode: 2,
      summary: "Fatal error while validating result",
      warnings: [],
      errors: [err?.message || String(err)],
      details: { feasible: false, totalPenalty: Number.POSITIVE_INFINITY },
    };
  }
}
