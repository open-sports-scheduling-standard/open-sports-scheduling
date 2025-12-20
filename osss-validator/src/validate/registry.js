import fs from "node:fs/promises";
import path from "node:path";

export async function loadRegistry(registryDir) {
  const constraints = JSON.parse(
    await fs.readFile(path.join(registryDir, "constraints.json"), "utf-8")
  );
  const objectives = JSON.parse(
    await fs.readFile(path.join(registryDir, "objectives.json"), "utf-8")
  );

  const constraintIds = new Set(
    (constraints.constraints || []).map((c) => c.id)
  );
  const objectiveIds = new Set((objectives.objectives || []).map((o) => o.id));

  return { constraints, objectives, constraintIds, objectiveIds };
}
