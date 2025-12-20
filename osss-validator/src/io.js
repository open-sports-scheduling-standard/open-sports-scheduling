import fs from "node:fs/promises";

export async function readJson(path) {
  const raw = await fs.readFile(path, "utf-8");
  try {
    return JSON.parse(raw);
  } catch (e) {
    const err = new Error(`Invalid JSON: ${path}`);
    err.cause = e;
    throw err;
  }
}
