import { describe, expect, it, vi } from 'vitest';
import { updateStateWithRetry, type PoolState } from '@/lib/store';
import { contestants } from '@/lib/contestants';

function stateWithUsers(users: PoolState['users'] = []): PoolState {
  return { contestants, users, picks: [], eliminations: [] };
}

function githubError(status: number) {
  return Object.assign(new Error(`GitHub API ${status}`), { status });
}

describe('updateStateWithRetry', () => {
  it('rereads the latest state and reapplies the mutator after a 409', async () => {
    const first = stateWithUsers();
    const concurrentUser: PoolState['users'][number] = {
      id: 'concurrent', name: 'Concurrente', token: 'token-1', created_at: '2026-01-01',
    };
    const ownUser: PoolState['users'][number] = {
      id: 'own', name: 'Propio', token: 'token-2', created_at: '2026-01-02',
    };
    const read = vi.fn()
      .mockResolvedValueOnce({ state: first, sha: 'sha-1' })
      .mockResolvedValueOnce({ state: stateWithUsers([concurrentUser]), sha: 'sha-2' });
    const written: Array<{ state: PoolState; sha?: string }> = [];
    const write = vi.fn(async (state: PoolState, sha?: string) => {
      written.push({ state, sha });
      if (written.length === 1) throw githubError(409);
    });
    const mutator = vi.fn((state: PoolState) => { state.users.push(ownUser); });

    const result = await updateStateWithRetry(read, write, mutator, 'test update');

    expect(read).toHaveBeenCalledTimes(2);
    expect(write).toHaveBeenCalledTimes(2);
    expect(mutator).toHaveBeenCalledTimes(2);
    expect(written.map(({ sha }) => sha)).toEqual(['sha-1', 'sha-2']);
    expect(written[1].state.users.map(({ id }) => id)).toEqual(['concurrent', 'own']);
    expect(result.users.map(({ id }) => id)).toEqual(['concurrent', 'own']);
    expect(first.users).toEqual([]);
  });

  it('stops after the bounded number of 409 attempts', async () => {
    const read = vi.fn()
      .mockResolvedValueOnce({ state: stateWithUsers(), sha: 'sha-1' })
      .mockResolvedValueOnce({ state: stateWithUsers(), sha: 'sha-2' })
      .mockResolvedValueOnce({ state: stateWithUsers(), sha: 'sha-3' });
    const conflict = githubError(409);
    const write = vi.fn().mockRejectedValue(conflict);
    const mutator = vi.fn();

    await expect(updateStateWithRetry(read, write, mutator, undefined, 3)).rejects.toBe(conflict);
    expect(read).toHaveBeenCalledTimes(3);
    expect(write).toHaveBeenCalledTimes(3);
    expect(mutator).toHaveBeenCalledTimes(3);
  });

  it('does not retry errors other than 409', async () => {
    const read = vi.fn().mockResolvedValue({ state: stateWithUsers(), sha: 'sha-1' });
    const failure = githubError(500);
    const write = vi.fn().mockRejectedValue(failure);
    const mutator = vi.fn();

    await expect(updateStateWithRetry(read, write, mutator)).rejects.toBe(failure);
    expect(read).toHaveBeenCalledTimes(1);
    expect(write).toHaveBeenCalledTimes(1);
    expect(mutator).toHaveBeenCalledTimes(1);
  });
});
