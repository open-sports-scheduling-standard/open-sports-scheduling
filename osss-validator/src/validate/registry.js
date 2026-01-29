import fs from "node:fs/promises";
import path from "node:path";

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshtein(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Find closest matches using Levenshtein distance
 */
export function findClosestMatches(input, candidates, maxResults = 3, maxDistance = 5) {
  const scored = candidates
    .map(c => ({ id: c, distance: levenshtein(input.toLowerCase(), c.toLowerCase()) }))
    .filter(c => c.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);
  return scored.slice(0, maxResults).map(c => c.id);
}

export async function loadRegistry(registryDir) {
  const constraints = JSON.parse(
    await fs.readFile(path.join(registryDir, "constraints.json"), "utf-8")
  );
  const objectives = JSON.parse(
    await fs.readFile(path.join(registryDir, "objectives.json"), "utf-8")
  );

  // Registry uses ruleId for constraints and objectiveId for objectives
  const constraintList = constraints.constraints || [];
  const objectiveList = objectives.objectives || [];

  const constraintIds = new Set(constraintList.map((c) => c.ruleId || c.id));
  const objectiveIds = new Set(objectiveList.map((o) => o.objectiveId || o.id));

  // Create lookup maps for detailed info
  const constraintMap = new Map();
  for (const c of constraintList) {
    const id = c.ruleId || c.id;
    if (id) constraintMap.set(id, c);
  }

  const objectiveMap = new Map();
  for (const o of objectiveList) {
    const id = o.objectiveId || o.id;
    if (id) objectiveMap.set(id, o);
  }

  return {
    constraints,
    objectives,
    constraintIds,
    objectiveIds,
    constraintMap,
    objectiveMap,
    constraintList: [...constraintIds],
    objectiveList: [...objectiveIds]
  };
}
