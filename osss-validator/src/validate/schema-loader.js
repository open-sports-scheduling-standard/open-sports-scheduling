// src/validate/schema-loader.js
import fs from "node:fs/promises";
import path from "node:path";
import { createAjv2020 } from "./ajv.js";

/**
 * Recursively list files under a directory.
 */
async function listFilesRecursive(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await listFilesRecursive(full)));
    } else {
      out.push(full);
    }
  }
  return out;
}

function looksLikeJsonSchema(obj) {
  return obj && typeof obj === "object" && (
    obj.$schema ||
    obj.$id ||
    obj.type ||
    obj.properties ||
    obj.allOf ||
    obj.anyOf ||
    obj.oneOf
  );
}

function normalizeId(schema, fallbackId) {
  // Ajv prefers $id. If absent, set one so refs can work.
  if (!schema.$id) schema.$id = fallbackId;
  return schema;
}

/**
 * Load and register all schemas in schemasDir into Ajv2020.
 * Returns { ajv, getSchemaByFileName, getSchemaById }
 */
export async function loadSchemas({ schemasDir }) {
  const ajv = createAjv2020();

  const files = await listFilesRecursive(schemasDir);
  const jsonFiles = files.filter((f) => f.toLowerCase().endsWith(".json"));

  const byFileName = new Map();
  const byId = new Map();

  for (const f of jsonFiles) {
    const raw = await fs.readFile(f, "utf-8");
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Not valid JSON; ignore
      continue;
    }

    if (!looksLikeJsonSchema(parsed)) continue;

    // Use a stable fallback $id based on relative path
    const rel = path.relative(schemasDir, f).replaceAll(path.sep, "/");
    const fallbackId = `osss://schemas/${rel}`;

    normalizeId(parsed, fallbackId);

    // Register schema
    ajv.addSchema(parsed);

    byFileName.set(path.basename(f), parsed);
    byId.set(parsed.$id, parsed);
  }

  function getSchemaByFileName(fileName) {
    return byFileName.get(fileName) || null;
  }

  function getSchemaById(id) {
    return byId.get(id) || null;
  }

  return { ajv, getSchemaByFileName, getSchemaById };
}
