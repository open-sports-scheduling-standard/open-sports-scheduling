import fs from "node:fs/promises";
import path from "node:path";

export async function loadConstraintRegistry(registryDir) {
  const constraintsPath = path.join(registryDir, "constraints.json");
  const raw = await fs.readFile(constraintsPath, "utf-8");

  let json;
  try {
    json = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Registry file is not valid JSON: ${constraintsPath} (${err.message})`);
  }

  // Support either:
  // 1) { constraints: [...] }
  // 2) [ ... ]
  const list = Array.isArray(json) ? json : (json?.constraints ?? []);
  if (!Array.isArray(list)) {
    throw new Error(`Registry must be an array or {constraints: []}: ${constraintsPath}`);
  }

  const byId = new Map();
  for (const entry of list) {
    const id = entry?.id || entry?.ruleId;
    if (!id || typeof id !== "string") continue;
    byId.set(id, { ...entry, id });
  }

  return { constraintsPath, list, byId };
}
