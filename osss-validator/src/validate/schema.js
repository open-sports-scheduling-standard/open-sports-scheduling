import fs from "node:fs/promises";
import path from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";

export async function buildAjv(schemasDir) {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);

  const files = [
    "osss-core.schema.json",
    "osss-constraints.schema.json",
    "osss-objectives.schema.json",
    "osss-results.schema.json"
  ];

  for (const f of files) {
    const p = path.join(schemasDir, f);
    const raw = await fs.readFile(p, "utf-8");
    const schema = JSON.parse(raw);
    ajv.addSchema(schema, schema.$id || f);
  }

  return ajv;
}

export function formatAjvErrors(errors) {
  if (!errors?.length) return [];
  return errors.map((e) => {
    const at = e.instancePath || "(root)";
    return `${at} ${e.message || "is invalid"}`;
  });
}
