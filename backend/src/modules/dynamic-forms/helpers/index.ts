export const safeJsonParse = <T = unknown>(json: string): T => {
  try {
    return JSON.parse(json) as T;
  } catch (e) {
    throw new Error('Invalid workflow JSON in database');
  }
};

// no need to over engineering i wont use it
export const isToken = (val?: unknown): val is string =>
  typeof val === 'string' && /\{\{.*\}\}/.test(val);

// Normalize minimal: ensure every step has an identifier
export const normalizeWorkflow = <T extends { identifier?: string }>(wf: T[]): T[] => {
  wf.forEach((s, i) => {
    if (!s.identifier) (s as any).identifier = `step_${i + 1}`;
  });
  return wf;
};
