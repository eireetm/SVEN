/**
 * Deterministic PRNG whose whole state lives inside GameState (never Math.random).
 * sfc32 generator seeded by the cyrb128 string hash. Same seed + same inputs => same game,
 * which is what replays, network sync and bot simulations rely on.
 */

/** Four unsigned 32-bit integers. */
export type RngState = [number, number, number, number];

/** cyrb128 — hash an arbitrary seed into a 128-bit starting state. */
export function seedRng(seed: string | number): RngState {
  const str = String(seed);
  let h1 = 1779033703;
  let h2 = 3144134277;
  let h3 = 1013904242;
  let h4 = 2773480762;
  for (let i = 0; i < str.length; i++) {
    const k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  h1 ^= h2 ^ h3 ^ h4;
  h2 ^= h1;
  h3 ^= h1;
  h4 ^= h1;
  const state: RngState = [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
  // Discard the first outputs so that similar seeds diverge quickly.
  for (let i = 0; i < 16; i++) nextUint32(state);
  return state;
}

/** sfc32 step. Mutates `s` in place and returns an unsigned 32-bit integer. */
export function nextUint32(s: RngState): number {
  let [a, b, c, d] = s;
  const t = (((a + b) | 0) + d) | 0;
  d = (d + 1) | 0;
  a = b ^ (b >>> 9);
  b = (c + (c << 3)) | 0;
  c = (c << 21) | (c >>> 11);
  c = (c + t) | 0;
  s[0] = a >>> 0;
  s[1] = b >>> 0;
  s[2] = c >>> 0;
  s[3] = d >>> 0;
  return t >>> 0;
}

const TWO_32 = 0x1_0000_0000;

/** Uniform integer in [0, n) without modulo bias. */
export function randomInt(s: RngState, n: number): number {
  if (!Number.isInteger(n) || n <= 0 || n > TWO_32) throw new RangeError(`randomInt: bad range ${n}`);
  const limit = TWO_32 - (TWO_32 % n);
  let x = nextUint32(s);
  while (x >= limit) x = nextUint32(s);
  return x % n;
}

/** Fisher–Yates shuffle in place (CR 5.9.1). */
export function shuffleInPlace<T>(s: RngState, items: T[]): void {
  for (let i = items.length - 1; i > 0; i--) {
    const j = randomInt(s, i + 1);
    const tmp = items[i]!;
    items[i] = items[j]!;
    items[j] = tmp;
  }
}
