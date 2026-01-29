// src/validate/schema.js
//
// Ajv + schema loading for OSSS
// IMPORTANT: OSSS schemas use JSON Schema Draft 2020-12
//   "$schema": "https://json-schema.org/draft/2020-12/schema"
// So we MUST use Ajv's 2020 build.

import fs from "node:fs/promises";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

/**
 * Format Ajv errors into human-readable strings.
 * @param {import("ajv").ErrorObject[] | null | undefined} errors
 */
export function formatAjvErrors(errors) {
  if (!Array.isArray(errors) || errors.length === 0) return [];
  return errors.map((e) => {
    const loc = e.instancePath || "(root)";
    const msg = e.message || "schema error";
    // Keep it compact, avoid dumping huge params
    return `${loc} ${msg}`;
  });
}

async function listJsonFilesRecursive(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...(await listJsonFilesRecursive(full)));
    } else if (ent.isFile() && ent.name.toLowerCase().endsWith(".json")) {
      out.push(full);
    }
  }
  return out;
}

function looksLikeSchema(obj) {
  return (
    obj &&
    typeof obj === "object" &&
    (obj.$schema || obj.$id || obj.type || obj.properties || obj.anyOf || obj.oneOf || obj.allOf)
  );
}

/**
 * Create and build Ajv with all schemas in schemasDir loaded.
 * This returns an Ajv instance where you can do:
 *   ajv.getSchema("<$id>") OR ajv.getSchema("<filename>")
 *
 * @param {string} schemasDir
 */
export async function buildAjv(schemasDir) {
  const ajv = new Ajv2020({
    strict: false,
    allErrors: true,
    validateSchema: true,
    allowUnionTypes: true,
  });

  // Adds formats like date-time, uri, email, etc.
  addFormats(ajv);

  // Load & register all schema JSON files
  const files = await listJsonFilesRecursive(schemasDir);

  // 1) Read/parse/collect first (so we can add in a stable order)
  const schemas = [];
  for (const file of files) {
    const raw = await fs.readFile(file, "utf-8");
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      continue;
    }
    if (!looksLikeSchema(parsed)) continue;

    // Ensure it has an $id so Ajv can reference it reliably.
    // Also add a secondary key using the basename (handy for your code)
    const base = path.basename(file);
    if (!parsed.$id) {
      // Stable internal fallback ID
      parsed.$id = `osss://schemas/${base}`;
    }

    schemas.push({ file, base, schema: parsed });
  }

  // 2) Add schemas to Ajv (also add alias by filename)
  for (const { base, schema } of schemas) {
    // Add by $id
    ajv.addSchema(schema);

    // Also add an alias by filename to support:
    // ajv.getSchema("osss-core.schema.json")
    // Ajv stores by key; providing a second key is allowed.
    ajv.addSchema(schema, base);
  }

  return ajv;
}
