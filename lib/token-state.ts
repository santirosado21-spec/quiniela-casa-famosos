import type { PoolState } from './store';

export function getTokenSpecificState(state: PoolState, token: string) {
  const user = state.users.find((candidate) => candidate.token === token);
  if (!user) return null;
  const pick = state.picks.find((candidate) => candidate.user_id === user.id);
  return {
    contestants: state.contestants.map((contestant) => ({ ...contestant })),
    user: { id: user.id, name: user.name },
    pick: pick ? { ...pick, order_ids: [...pick.order_ids] } : null,
  };
}
