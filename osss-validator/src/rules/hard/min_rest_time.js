export function checkMinRestTime(constraint, idx) {
  const violations = [];
  const minHours = Number(constraint.params?.min_hours);
  if (!Number.isFinite(minHours) || minHours <= 0) return violations;

  const minMs = minHours * 60 * 60 * 1000;

  const { assignments, fixtures } = idx;

  // team -> games sorted by time
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
    for (let i = 1; i < games.length; i++) {
      const prev = games[i - 1];
      const cur = games[i];
      const rest = cur.start - prev.end;
      if (rest < minMs) {
        const restHours = rest / (60 * 60 * 1000);
        violations.push(
          `Team '${teamId}' rest violation: ${restHours.toFixed(2)}h between '${prev.fixtureId}' and '${cur.fixtureId}' (min ${minHours}h)`
        );
      }
    }
  }

  return violations;
}
