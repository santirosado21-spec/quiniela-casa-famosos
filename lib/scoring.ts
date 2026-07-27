type BasicContestant = { id: string; name: string };
type BasicUser = { id: string; name: string; email?: string; token?: string };
type BasicPick = { user_id: string; order_ids: string[]; submitted_at?: string };
type BasicElimination = { contestant_id: string; position: number; eliminated_at?: string };
type BasicState = { contestants: BasicContestant[]; users: BasicUser[]; picks: BasicPick[]; eliminations: BasicElimination[] };

export function scorePick(order: string[], actual: BasicElimination[]) {
  const byId = new Map(order.map((id, i) => [id, i + 1]));
  let exact = 0;
  const score = actual.reduce((total, e) => {
    const predicted = byId.get(e.contestant_id);
    if (!predicted) return total;
    const diff = Math.abs(predicted - e.position);
    if (diff === 0) exact += 1;
    return total + Math.max(0, 100 - diff * 12) + (diff === 0 ? 25 : 0);
  }, 0);
  return { score, exact };
}

export function buildLeaderboard(state: BasicState) {
  const contestantById = new Map(state.contestants.map((c) => [c.id, c]));
  const eliminated = [...state.eliminations].sort((a, b) => a.position - b.position);
  const rows = state.users.map((user) => {
    const pick = state.picks.find((p) => p.user_id === user.id);
    const scored = scorePick(pick?.order_ids || [], eliminated);
    const lastHit = eliminated
      .map((e) => ({ elimination: e, predicted: pick?.order_ids.indexOf(e.contestant_id) ?? -1 }))
      .filter((x) => x.predicted >= 0)
      .at(-1);
    const nextRisk = pick?.order_ids
      .map((id, idx) => ({ contestant: contestantById.get(id), predictedPosition: idx + 1 }))
      .find((item) => item.contestant && !eliminated.some((e) => e.contestant_id === item.contestant!.id));

    return {
      user,
      pick,
      score: scored.score,
      exact: scored.exact,
      submitted: Boolean(pick),
      nextRiskName: nextRisk?.contestant?.name || 'Sin pick',
      lastPredictedPosition: lastHit ? lastHit.predicted + 1 : null,
    };
  });

  rows.sort((a, b) => b.score - a.score || b.exact - a.exact || Number(b.submitted) - Number(a.submitted) || a.user.name.localeCompare(b.user.name));
  const submittedRows = rows.filter((row) => row.submitted);
  return {
    rows,
    winners: submittedRows.slice(0, 3),
    losers: [...submittedRows].reverse().slice(0, 3),
    totalUsers: state.users.length,
    totalPicks: state.picks.length,
    totalEliminations: eliminated.length,
    remainingContestants: Math.max(0, state.contestants.length - eliminated.length),
    latestElimination: eliminated.at(-1),
  };
}
