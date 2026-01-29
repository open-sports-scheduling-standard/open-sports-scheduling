// src/validate/ajv.js
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

/**
 * Create an Ajv instance configured for JSON Schema Draft 2020-12.
 * This is required because OSSS schemas declare:
 *   "$schema": "https://json-schema.org/draft/2020-12/schema"
 */
export function createAjv2020() {
  const ajv = new Ajv2020({
    strict: false,          // OSSS is evolving; strict mode is painful early on
    allErrors: true,        // return all errors, not just first
    allowUnionTypes: true,  // helpful if any schemas use union-ish patterns
    validateSchema: true,
    loadSchema: undefined,  // we're doing local schema loading ourselves
  });

  addFormats(ajv);

  return ajv;
}
