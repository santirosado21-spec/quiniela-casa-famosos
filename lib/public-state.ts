import type { PoolState } from './store';
import { buildLeaderboard } from './scoring';

export function sanitizePublicState(state: PoolState) {
  const leaderboard = buildLeaderboard(state);
  const sanitizeRow = (row: (typeof leaderboard.rows)[number]) => ({
    id: row.user.id,
    name: row.user.name,
    score: row.score,
    exact: row.exact,
    submitted: row.submitted,
  });
  const rows = leaderboard.rows.map(sanitizeRow);
  const byId = new Map(rows.map((row) => [row.id, row]));

  return {
    contestants: state.contestants.map((contestant) => ({ ...contestant })),
    eliminations: state.eliminations.map((elimination) => ({ ...elimination })),
    leaderboard: {
      rows,
      winners: leaderboard.winners.map((row) => byId.get(row.user.id)!),
      losers: leaderboard.losers.map((row) => byId.get(row.user.id)!),
      totalUsers: leaderboard.totalUsers,
      totalPicks: leaderboard.totalPicks,
      totalEliminations: leaderboard.totalEliminations,
      remainingContestants: leaderboard.remainingContestants,
      latestElimination: leaderboard.latestElimination ? { ...leaderboard.latestElimination } : undefined,
    },
  };
}
