import path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Try to import a rule implementation.
 *
 * Supported locations:
 *  - src/rules/builtins/<ruleId>.js
 *  - src/rules/builtins/<ruleId with dashes>.js
 *  - src/rules/builtins/<ruleId with underscores>.js
 *
 * @param {string} ruleId
 * @param {string} rulesDirAbsolute  absolute path to src/rules
 */
export async function loadRule(ruleId, rulesDirAbsolute) {
  const builtinsDir = path.join(rulesDirAbsolute, "builtins");

  const candidates = new Set([
    `${ruleId}.js`,
    `${ruleId.replaceAll(" ", "_")}.js`,
    `${ruleId.replaceAll(" ", "-")}.js`,
    `${ruleId.replaceAll("-", "_")}.js`,
    `${ruleId.replaceAll("_", "-")}.js`,
  ]);

  for (const filename of candidates) {
    const full = path.join(builtinsDir, filename);
    try {
      const mod = await import(pathToFileURL(full).href);
      if (mod?.evaluate && typeof mod.evaluate === "function") {
        return { found: true, module: mod, path: full };
      }
      // Module exists but no evaluate()
      return { found: true, module: mod, path: full, invalid: true };
    } catch (err) {
      // Only ignore "not found"
      const msg = String(err?.message || err);
      if (
        msg.includes("ERR_MODULE_NOT_FOUND") ||
        msg.includes("Cannot find module") ||
        msg.includes("ENOENT")
      ) {
        continue;
      }
      // Real runtime error inside module -> surface it
      throw new Error(`Rule module failed to load for '${ruleId}' at ${full}: ${msg}`);
    }
  }

  return { found: false };
}
