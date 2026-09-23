/**
 * Helpers for the plain-JSON data the engine works with (GameState, decisions, events).
 * Hand-written instead of structuredClone so the core needs no host (DOM/Node) API.
 */

export function cloneJson<T>(value: T): T {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) {
    const out = new Array(value.length);
    for (let i = 0; i < value.length; i++) out[i] = cloneJson(value[i]);
    return out as T;
  }
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(value)) out[key] = cloneJson((value as Record<string, unknown>)[key]);
  return out as T;
}

/** Structural equality for JSON data (key order insensitive). */
export function jsonEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== "object" || typeof b !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    const bb = b as unknown[];
    if (a.length !== bb.length) return false;
    for (let i = 0; i < a.length; i++) if (!jsonEqual(a[i], bb[i])) return false;
    return true;
  }
  const ka = Object.keys(a).filter((k) => (a as Record<string, unknown>)[k] !== undefined);
  const kb = Object.keys(b).filter((k) => (b as Record<string, unknown>)[k] !== undefined);
  if (ka.length !== kb.length) return false;
  for (const k of ka) {
    if (!jsonEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])) return false;
  }
  return true;
}
