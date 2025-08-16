// src/components/validators.ts
import type { Section, Widget } from './types';
import { evaluateCondition } from './evaluators';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9]{7,15}$/;

export function pickLocale(obj?: { locale?: Record<string, string> } | string, fallback = 'Invalid value') {
  if (!obj) return fallback;
  if (typeof obj === 'string') return obj;
  return obj.locale?.en ?? Object.values(obj.locale ?? {})[0] ?? fallback;
}

function ruleMsg(messages: any, rule: string, fallback: string) {
  if (!messages) return fallback;
  const bucket = messages[rule];
  if (bucket?.locale) return pickLocale(bucket, fallback);
  return pickLocale(messages, fallback);
}

export function resolveToken(values: Record<string, any>, token?: string) {
  if (!token || typeof token !== 'string') return token;
  const m = token.match(/^\{\{\s*values\.([\w.-]+)\s*\}\}$/);
  if (!m) return token;
  return m[1].split('.').reduce((acc, k) => (acc != null ? acc[k] : undefined), values);
}

export function isEmpty(val: any) {
  return val === undefined || val === null || (typeof val === 'string' && val.trim() === '');
}

// src/components/validators.ts

export function validateByJson(values: Record<string, any>, node: any, val: any): string | null {
  const v = node.validation ?? {};
  const messages = v.messages || v.message;

  const required = (typeof node.mandotory === 'boolean' ? node.mandotory : node.mandatory) ?? v.required ?? false;

  if (required && isEmpty(val)) {
    return ruleMsg(messages, 'required', 'This field is required');
  }

  if (isEmpty(val)) return null;

  const kind = node.input?.kind as undefined | 'text' | 'email' | 'password' | 'number' | 'tel';

  if (kind === 'email' || v.email) {
    if (!EMAIL_RE.test(String(val))) return ruleMsg(messages, 'email', 'Please enter a valid email');
  }

  if (kind === 'tel' || v.phone) {
    if (!PHONE_RE.test(String(val))) return ruleMsg(messages, 'phone', 'Please enter a valid phone number');
  }

  if (kind === 'number' || typeof v.min === 'number' || typeof v.max === 'number') {
    const num = Number(val);
    if (Number.isNaN(num)) return pickLocale(messages, 'Must be a number');
    if (typeof v.min === 'number' && num < v.min) return ruleMsg(messages, 'min', `Must be ≥ ${v.min}`);
    if (typeof v.max === 'number' && num > v.max) return ruleMsg(messages, 'max', `Must be ≤ ${v.max}`);
  }

  if (typeof v.minLength === 'number' && String(val).length < v.minLength) {
    return ruleMsg(messages, 'minLength', `Must be at least ${v.minLength} characters`);
  }
  if (typeof v.maxLength === 'number' && String(val).length > v.maxLength) {
    return ruleMsg(messages, 'maxLength', `Must be at most ${v.maxLength} characters`);
  }

  if (v.pattern) {
    try {
      const re = new RegExp(v.pattern, v.patternFlags);
      if (!re.test(String(val))) return ruleMsg(messages, 'pattern', 'Invalid format');
    } catch { /* ignore bad regex */ }
  }

  if (v.equalTo) {
    const other = resolveToken(values, v.equalTo);
    if (String(val) !== String(other)) return ruleMsg(messages, 'equalTo', 'Values do not match');
  }

  return null;
}



export function collectVisibleFieldNodes(nodes: (Section | Widget)[], values: Record<string, any>): any[] {
  const out: any[] = [];
  const visit = (n: any) => {
    if (n?.condition && !evaluateCondition(values, n.condition)) return;

    if (n?.type === 'section' || n?.type === 'mediaSection' || n?.type === 'videoSection') {
      (n.childs ?? []).forEach(visit);
      return;
    }
    if (n?.type === 'input' || n?.type === 'listCellOptions' || n?.type === 'checkbox') {
      out.push(n);
    }
  };
  (nodes ?? []).forEach(visit);
  return out;
}

export function isGating(node: any): boolean {
  const flag = (typeof node?.mandotory === 'boolean' ? node.mandotory : node?.mandatory);
  return !!(flag ?? node?.validation?.required);
}