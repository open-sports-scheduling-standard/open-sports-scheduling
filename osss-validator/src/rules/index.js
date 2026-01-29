import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";

import { loadRule } from "./loader.js";
import { buildParamsSchemaFromRegistryEntry } from "../registry/param-schema.js";

/**
 * @param {Object} args
 * @param {Map<string, any>} args.registryById
 * @param {boolean} [args.strictMissingRules] if true: missing hard rule impl -> error
 */
export function createRuleEngine({ registryById, strictMissingRules = false } = {}) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const rulesDirAbsolute = __dirname; // src/rules

  const ajv = new Ajv({ allErrors: true, strict: false });

  /** cache param validators by ruleId */
  const paramValidatorCache = new Map();

  function getParamValidator(ruleId, registryEntry) {
    if (paramValidatorCache.has(ruleId)) return paramValidatorCache.get(ruleId);
    const schema = buildParamsSchemaFromRegistryEntry(registryEntry || {});
    const validate = ajv.compile(schema);
    paramValidatorCache.set(ruleId, validate);
    return validate;
  }

  /**
   * Evaluate one constraint entry from instance.constraints.*
   * Returns an object with optional violations and penalty.
   */
  async function evaluateConstraint(constraint, { instance, result, warn }) {
    const ruleId = constraint?.ruleId || constraint?.id;
    const type = (constraint?.type || "hard").toLowerCase() === "soft" ? "soft" : "hard";
    const selector = constraint?.selector ?? {};
    const params = constraint?.params ?? {};

    if (!ruleId) {
      return {
        ok: false,
        violations: [{ ruleId: "unknown", type, message: "Constraint missing ruleId", selector, meta: { constraint } }],
      };
    }

    const registryEntry = registryById?.get(ruleId);

    // Param validation (registry-driven, fail-open if no registry entry)
    if (registryEntry) {
      const validateParams = getParamValidator(ruleId, registryEntry);
      const ok = validateParams(params);
      if (!ok) {
        const detail = (validateParams.errors || [])
          .map((e) => `${e.instancePath || "params"} ${e.message}`)
          .join("; ");
        return {
          ok: false,
          violations: [
            {
              ruleId,
              type,
              message: `Invalid params for '${ruleId}': ${detail || "unknown param error"}`,
              selector,
              meta: { params },
            },
          ],
        };
      }
    }

    // Load implementation
    const loaded = await loadRule(ruleId, rulesDirAbsolute);
    if (!loaded.found) {
      const msg = `No rule implementation found for '${ruleId}' (type=${type}).`;

      if (type === "hard" && strictMissingRules) {
        return {
          ok: false,
          violations: [{ ruleId, type, message: msg, selector, meta: { missingRule: true } }],
        };
      }

      // Default behavior: warn but do not fail the whole validation
      warn?.(msg);
      return { ok: true, meta: { missingRule: true } };
    }

    if (loaded.invalid) {
      return {
        ok: false,
        violations: [
          {
            ruleId,
            type,
            message: `Rule module for '${ruleId}' loaded but has no exported evaluate(ctx) function`,
            selector,
            meta: { path: loaded.path },
          },
        ],
      };
    }

    // Execute
    const ctx = {
      instance,
      result,
      ruleId,
      type,
      selector,
      params,
      registryEntry,
      warn: warn || (() => {}),
    };

    const out = await loaded.module.evaluate(ctx);

    // Normalize
    const violations = Array.isArray(out?.violations) ? out.violations : [];
    const penalty = typeof out?.penalty === "number" ? out.penalty : 0;

    return {
      ok: violations.length === 0,
      violations,
      penalty,
      meta: out?.meta,
    };
  }

  return { evaluateConstraint };
}
