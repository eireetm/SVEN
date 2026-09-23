import { describe, expect, it } from "vitest";
import { nextUint32, randomInt, seedRng, shuffleInPlace } from "../src/rng/rng";

describe("rng", () => {
  it("is fully determined by the seed", () => {
    const a = seedRng("seed");
    const b = seedRng("seed");
    const xs = Array.from({ length: 20 }, () => nextUint32(a));
    const ys = Array.from({ length: 20 }, () => nextUint32(b));
    expect(xs).toEqual(ys);
    expect(a).toEqual(b);
  });

  it("different seeds give different streams", () => {
    expect(nextUint32(seedRng(1))).not.toBe(nextUint32(seedRng(2)));
  });

  it("state is plain JSON (four unsigned 32-bit integers)", () => {
    const s = seedRng("x");
    for (let i = 0; i < 100; i++) nextUint32(s);
    expect(JSON.parse(JSON.stringify(s))).toEqual(s);
    for (const v of s) expect(Number.isInteger(v) && v >= 0 && v < 2 ** 32).toBe(true);
  });

  it("randomInt stays in range and covers it", () => {
    const s = seedRng("range");
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i++) {
      const v = randomInt(s, 6);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(6);
      seen.add(v);
    }
    expect(seen.size).toBe(6);
    expect(() => randomInt(s, 0)).toThrow();
  });

  it("CR 5.9 — shuffling permutes the cards", () => {
    const s = seedRng("shuffle");
    const deck = Array.from({ length: 40 }, (_, i) => i);
    shuffleInPlace(s, deck);
    expect([...deck].sort((a, b) => a - b)).toEqual(Array.from({ length: 40 }, (_, i) => i));
    expect(deck).not.toEqual(Array.from({ length: 40 }, (_, i) => i));
  });
});
