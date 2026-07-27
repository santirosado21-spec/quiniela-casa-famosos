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
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
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
export async function updateState(mutator: (state: PoolState) => PoolState | void, message?: string) {
  const { state, sha } = await readRemote();
  if (!state.contestants?.length) state.contestants = contestants;
  state.users ||= [];
  state.picks ||= [];
  state.eliminations ||= [];
  const cloned: PoolState = JSON.parse(JSON.stringify(state));
  const next = mutator(cloned) || cloned;
  await writeRemote(next, sha, message);
  return next;
}
