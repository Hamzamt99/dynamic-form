import type { Condition } from './types';

function coerce(v: any, as: Condition['compareAs']) {
  if (as === 'boolean') return v === true || v === 'true';
  if (as === 'number') return typeof v === 'number' ? v : Number(v);
  return `${v}`;
}

function getFromPath(values: Record<string, any>, token: string) {
  const m = token?.toString().match(/^\{\{\s*values\.([\w.-]+)\s*\}\}$/);
  if (!m) return token; 
  return m[1].split('.').reduce((acc, k) => (acc != null ? acc[k] : undefined), values);
}

export function evaluateCondition(values: Record<string, any>, cond?: Condition | null): boolean {
  if (!cond) return true;
  const aRaw = typeof cond.valueA === 'string' ? getFromPath(values, cond.valueA) : cond.valueA;
  const bRaw = getFromPath(values, cond.valueB);
  const as = cond.compareAs ?? 'string';
  const a = coerce(aRaw, as);
  const b = coerce(bRaw, as);
  switch (cond.comparator ?? '=') {
    case '=': return a === b;
    case '!=': return a !== b;
    case 'in': return Array.isArray(bRaw) ? bRaw.includes(aRaw) : String(b).split(',').includes(String(a));
    case 'not_in': return Array.isArray(bRaw) ? !bRaw.includes(aRaw) : !String(b).split(',').includes(String(a));
    case '>': return (a as any) > (b as any);
    case '>=': return (a as any) >= (b as any);
    case '<': return (a as any) < (b as any);
    case '<=': return (a as any) <= (b as any);
    default: return true;
  }
}
