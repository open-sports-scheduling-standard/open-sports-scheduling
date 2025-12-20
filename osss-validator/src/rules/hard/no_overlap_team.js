import { overlaps } from "../utils.js";

export function checkNoOverlapTeam(constraint, idx) {
  const violations = [];
  const { assignments, fixtures } = idx;

  // Build team -> list of (start,end,fixtureId)
  const teamGames = new Map();

  for (const a of assignments) {
    const f = fixtures.get(a.fixtureId);
    if (!f) continue;

    for (const teamId of f.participants || []) {
      if (!teamGames.has(teamId)) teamGames.set(teamId, []);
      teamGames.get(teamId).push({ start: a._startMs, end: a._endMs, fixtureId: a.fixtureId });
    }
  }

  for (const [teamId, games] of teamGames) {
    games.sort((x, y) => x.start - y.start);
    for (let i = 0; i < games.length; i++) {
      for (let j = i + 1; j < games.length; j++) {
        if (games[j].start >= games[i].end) break;
        if (overlaps(games[i].start, games[i].end, games[j].start, games[j].end)) {
          violations.push(
            `Team '${teamId}' overlap between fixtures '${games[i].fixtureId}' and '${games[j].fixtureId}'`
          );
        }
      }
    }
  }

  return violations;
}
