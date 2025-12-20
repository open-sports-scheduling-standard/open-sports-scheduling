import { overlaps } from "../utils.js";

export function checkNoOverlapVenue(constraint, idx) {
  const violations = [];
  const { assignments } = idx;

  const venueGames = new Map();
  for (const a of assignments) {
    const key = a.venueId; // simple: venueId only (venueResource can be added later)
    if (!venueGames.has(key)) venueGames.set(key, []);
    venueGames.get(key).push({ start: a._startMs, end: a._endMs, fixtureId: a.fixtureId });
  }

  for (const [venueId, games] of venueGames) {
    games.sort((x, y) => x.start - y.start);
    for (let i = 0; i < games.length; i++) {
      for (let j = i + 1; j < games.length; j++) {
        if (games[j].start >= games[i].end) break;
        if (overlaps(games[i].start, games[i].end, games[j].start, games[j].end)) {
          violations.push(
            `Venue '${venueId}' overlap between fixtures '${games[i].fixtureId}' and '${games[j].fixtureId}'`
          );
        }
      }
    }
  }

  return violations;
}
