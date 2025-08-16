export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001/api';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  listWorkflows: () => get<{ message: string; data: { workflow_id: string; updated_at: string }[] }>('/dynamic-forms'),
  getWorkflow: (id: string) => get<{ message: string; data: import('@/components/types').Workflow }>('/dynamic-forms/' + id),
};
