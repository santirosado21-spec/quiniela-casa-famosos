import { contestants } from './contestants';

export type User = { id: string; name: string; email?: string; token: string; created_at: string };
export type Pick = { user_id: string; order_ids: string[]; submitted_at: string };
export type Elimination = { contestant_id: string; position: number; eliminated_at: string };
export type PoolState = { contestants: typeof contestants; users: User[]; picks: Pick[]; eliminations: Elimination[] };

const owner = process.env.GITHUB_OWNER || 'santirosado21-spec';
const repo = process.env.GITHUB_REPO || 'quiniela-casa-famosos';
const path = process.env.GITHUB_DATA_PATH || 'data/store.json';
const branch = process.env.GITHUB_BRANCH || 'main';
const token = process.env.GITHUB_TOKEN;

const initialState: PoolState = { contestants, users: [], picks: [], eliminations: [] };
let memoryState: PoolState = initialState;

class GitHubApiError extends Error {
  constructor(public readonly status: number, body: string) {
    super(`GitHub API ${status}: ${body}`);
    this.name = 'GitHubApiError';
  }
}

async function github<T>(url: string, init: RequestInit = {}): Promise<T> {
  if (!token) throw new Error('GITHUB_TOKEN no configurado');
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) throw new GitHubApiError(res.status, await res.text());
  return res.json() as Promise<T>;
}

async function readRemote(): Promise<{ state: PoolState; sha?: string }> {
  if (!token) return { state: memoryState };
  try {
    const data = await github<{ content: string; sha: string }>(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`);
    const decoded = Buffer.from(data.content, 'base64').toString('utf8');
    return { state: JSON.parse(decoded), sha: data.sha };
  } catch (error) {
    if (String(error).includes('404')) return { state: initialState };
    throw error;
  }
}

async function writeRemote(state: PoolState, sha?: string, message = 'chore: update pool data') {
  if (!token) { memoryState = state; return; }
  await github(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, branch, content: Buffer.from(JSON.stringify(state, null, 2)).toString('base64'), sha }),
  });
}

export async function getState() {
  const state = (await readRemote()).state;
  if (!state.contestants?.length) state.contestants = contestants;
  state.users ||= [];
  state.picks ||= [];
  state.eliminations ||= [];
  return state;
}

type ReadState = () => Promise<{ state: PoolState; sha?: string }>;
type WriteState = (state: PoolState, sha?: string, message?: string) => Promise<void>;

function cloneAndNormalize(state: PoolState): PoolState {
  const cloned: PoolState = JSON.parse(JSON.stringify(state));
  if (!cloned.contestants?.length) cloned.contestants = contestants;
  cloned.users ||= [];
  cloned.picks ||= [];
  cloned.eliminations ||= [];
  return cloned;
}

function isConflict(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'status' in error && error.status === 409;
}

export async function updateStateWithRetry(
  read: ReadState,
  write: WriteState,
  mutator: (state: PoolState) => PoolState | void,
  message?: string,
  maxAttempts = 3,
) {
  const attempts = Number.isFinite(maxAttempts) ? Math.max(1, Math.floor(maxAttempts)) : 3;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const { state, sha } = await read();
    const cloned = cloneAndNormalize(state);
    const next = mutator(cloned) || cloned;

    try {
      await write(next, sha, message);
      return next;
    } catch (error) {
      if (!isConflict(error) || attempt === attempts) throw error;
    }
  }

  throw new Error('No fue posible actualizar el estado');
}

export async function updateState(mutator: (state: PoolState) => PoolState | void, message?: string) {
  return updateStateWithRetry(readRemote, writeRemote, mutator, message);
}
