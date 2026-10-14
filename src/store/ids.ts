let counter = 0;

/** Unique enough id for local data (no crypto API needed, works on Hermes and the web). */
export function newId(): string {
  counter += 1;
  return `${Date.now().toString(36)}-${counter.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
