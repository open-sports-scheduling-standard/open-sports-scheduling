import path from "node:path";
import fs from "node:fs/promises";
import { buildAjv, formatAjvErrors } from "./schema.js";
import { loadRegistry } from "./registry.js";
import { buildIndex } from "../rules/utils.js";
import { loadRulePlugins } from "../rules/loader.js";
import { resolveSelector } from "../rules/selector.js";

function nearlyEqual(a, b, eps = 1e-6) {
  return Math.abs((Number(a) || 0) - (Number(b) || 0)) <= eps;
}

export async function validateResult({
  instance,
  result,
  schemasDir,
  registryDir,
  fixScores = false,
  outPath = null
}) {
  const warnings = [];
  const errors = [];
  const hardViolations = [];

  /* ------------------------------------------------------------------ */
  /* Schema validation                                                    */
  /* ------------------------------------------------------------------ */

  const ajv = await buildAjv(schemasDir);
  const registry = await loadRegistry(registryDir);

  const resultsSchema =
    ajv.getSchema("https://opensportsscheduling.org/schemas/osss-results.schema.json") ||
    ajv.getSchema("osss-results.schema.json");

  if (!resultsSchema) {
    return {
      valid: false,
      exitCode: 1,
      summary: "Schema missing: osss-results",
      warnings,
      errors: ["Could not load osss-results schema"]
    };
  }

  const schemaOk = resultsSchema(result);
  if (!schemaOk) {
    return {
      valid: false,
      exitCode: 1,
      summary: "Result schema validation failed",
      warnings,
      errors: formatAjvErrors(resultsSchema.errors)
    };
  }

  /* ------------------------------------------------------------------ */
  /* Basic structural checks                                              */
  /* ------------------------------------------------------------------ */

  const feasibleFlag = !!result.feasible;
  if (!feasibleFlag) warnings.push("Result feasible=false (solver reports infeasible).");

  // Every fixture must be assigned exactly once
  const fixtureIds = new Set((instance.fixtures || []).map((f) => f.id));
  const assignedCount = new Map();

  for (const a of result.assignments || []) {
    assignedCount.set(a.fixtureId, (assignedCount.get(a.fixtureId) || 0) + 1);
  }

  for (const fid of fixtureIds) {
    const n = assignedCount.get(fid) || 0;
    if (n !== 1) {
      errors.push(`Fixture '${fid}' must be assigned exactly once, found ${n}`);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Load rule plugins + build index                                      */
  /* ------------------------------------------------------------------ */

  const rulesRootDir = path.join(process.cwd(), "src", "rules");
  const plugins = await loadRulePlugins(rulesRootDir);
  const idx = buildIndex(instance, result);

  /* ------------------------------------------------------------------ */
  /* Constraint bookkeeping                                              */
  /* ------------------------------------------------------------------ */

  const instanceConstraints = instance.constraints || [];
  const softConstraints = instanceConstraints.filter((c) => c.type === "soft");
  const hardConstraints = instanceConstraints.filter((c) => c.type === "hard");

  const reportedScores = new Map(
    (result.scores?.byConstraint || []).map((cs) => [cs.constraintId, cs])
  );

  // Require all soft constraints to be reported (prevents hiding)
  for (const c of softConstraints) {
    if (!reportedScores.has(c.id)) {
      errors.push(`Missing soft constraint score entry in results: '${c.id}'`);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Score consistency check (reported)                                   */
  /* ------------------------------------------------------------------ */

  const reportedByConstraint = result.scores?.byConstraint || [];
  const reportedTotal = Number(result.scores?.totalPenalty) || 0;
  const sumReported = reportedByConstraint.reduce(
    (acc, cs) => acc + (Number(cs.penalty) || 0),
    0
  );

  if (!nearlyEqual(reportedTotal, sumReported)) {
    errors.push(
      `Scoring inconsistency: totalPenalty=${reportedTotal} but sum(byConstraint.penalty)=${sumReported}`
    );
  }

  /* ------------------------------------------------------------------ */
  /* HARD constraint evaluation (selector-aware)                          */
  /* ------------------------------------------------------------------ */

  for (const c of hardConstraints) {
    const plugin = plugins.byRuleId.get(c.rule);

    if (!plugin) {
      if (!registry.constraintIds.has(c.rule)) {
        warnings.push(`Unknown hard rule (not in registry): ${c.rule}`);
      } else {
        warnings.push(`Hard rule '${c.rule}' not implemented in validator`);
      }
      continue;
    }

    const scopedIdx = resolveSelector({ selector: c.selector, idx });
    const res = plugin.evaluate({ constraint: c, idx: scopedIdx });

    if (res?.violations?.length) {
      hardViolations.push(...res.violations);
    }
  }

  /* ------------------------------------------------------------------ */
  /* SOFT constraint re-scoring (authoritative)                           */
  /* ------------------------------------------------------------------ */

  const rewrittenScores = [];
  let rewrittenTotalPenalty = 0;

  for (const c of softConstraints) {
    if (!c.penalty) {
      errors.push(`Soft constraint '${c.id}' missing penalty model`);
      continue;
    }

    const plugin = plugins.byRuleId.get(c.rule);
    if (!plugin) {
      warnings.push(`Soft rule '${c.rule}' not implemented in validator`);
      continue;
    }

    const scopedIdx = resolveSelector({ selector: c.selector, idx });
    const expected = plugin.evaluate({ constraint: c, idx: scopedIdx });

    const expPenalty = Number(expected?.penalty) || 0;
    const expViolations = Number(expected?.violationCount) || 0;

    rewrittenScores.push({
      constraintId: c.id,
      violations: expViolations,
      penalty: expPenalty,
      explanation: expected?.explanation
    });

    rewrittenTotalPenalty += expPenalty;

    if (!fixScores) {
      const reported = reportedScores.get(c.id);
      if (!reported) continue;

      if (!nearlyEqual(reported.penalty, expPenalty)) {
        errors.push(
          `Soft re-score mismatch for '${c.id}': reported=${reported.penalty}, expected=${expPenalty}`
        );
      }
      if (Number(reported.violations) !== expViolations) {
        errors.push(
          `Soft re-score mismatch for '${c.id}': reported violations=${reported.violations}, expected=${expViolations}`
        );
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* Optional --fix-scores rewrite                                        */
  /* ------------------------------------------------------------------ */

  if (fixScores) {
    result.scores.byConstraint = rewrittenScores;
    result.scores.totalPenalty = rewrittenTotalPenalty;
    result.scores._validatedBy = "osss-validator";
    result.scores._validatedAt = new Date().toISOString();

    if (outPath) {
      await fs.writeFile(outPath, JSON.stringify(result, null, 2), "utf-8");
    }
  }

  /* ------------------------------------------------------------------ */
  /* Exit code logic                                                      */
  /* ------------------------------------------------------------------ */

  let exitCode = 0;
  if (errors.length) exitCode = 4;
  else if (!feasibleFlag) exitCode = 2;
  else if (hardViolations.length) exitCode = 3;

  const valid = exitCode === 0;

  return {
    valid,
    exitCode,
    summary: valid
      ? "Result is valid and feasible"
      : "Result validation completed with issues",
    warnings,
    errors,
    details: {
      feasible: feasibleFlag,
      totalPenalty: fixScores ? rewrittenTotalPenalty : reportedTotal,
      hardViolations
    }
  };
}
