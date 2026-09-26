import { describe, expect, it } from "vitest";
import {
  createEngine,
  defaultAnswer,
  enumerateAnswers,
  randomAnswer,
  seedRng,
  validateAnswer,
  type Decision,
} from "../../src";
import { ALL_CARDS, ALL_SCRIPTS } from "../../src/sets";
import { deckPool, randomDeck } from "../../src/testing";
import { invariantErrors } from "../helpers";

const selection = (candidates: string[], min: number, max: number, mandatory?: string[]): Decision => ({
  type: "selectCards",
  player: 0,
  reason: "target",
  candidates,
  candidateDefs: candidates.map(() => "X"),
  min,
  max,
  source: null,
  ...(mandatory ? { mandatory } : {}),
});

describe("legal answers (engine/runtime/answers.ts)", () => {
  it("enumerates every selection of min–max cards, the forced cards first (CR 1.3.2.3)", () => {
    const d = selection(["a", "b", "c"], 1, 2, ["b"]);
    const { answers, complete } = enumerateAnswers(d, 50);
    expect(complete).toBe(true);
    expect(answers.map((a) => (a.type === "selectCards" ? a.cards : null))).toEqual([["b"], ["b", "a"], ["b", "c"]]);
    for (const a of answers) expect(validateAnswer(d, a)).toBeNull();
  });

  it("stops at the limit and says the list is incomplete", () => {
    const d = selection(["a", "b", "c", "d", "e", "f"], 0, 6);
    expect(enumerateAnswers(d, 64).answers).toHaveLength(64);
    expect(enumerateAnswers(d, 64).complete).toBe(true);
    const cut = enumerateAnswers(d, 10);
    expect([cut.answers.length, cut.complete]).toEqual([10, false]);
  });

  it("the default answer ends the main phase, passes, declines and selects as little as allowed", () => {
    expect(defaultAnswer({ type: "mainPhase", player: 0, actions: [{ type: "play", card: "c1" }, { type: "endMainPhase" }] })).toEqual({
      type: "mainPhase",
      action: { type: "endMainPhase" },
    });
    expect(defaultAnswer({ type: "confirm", player: 0, reason: "effect", source: null })).toEqual({ type: "confirm", yes: false });
    expect(defaultAnswer(selection(["a", "b", "c"], 1, 3, ["c"]))).toEqual({ type: "selectCards", cards: ["c"] });
  });

  it("in random games every default, random and enumerated answer is legal", () => {
    const engine = createEngine({ cards: ALL_CARDS, scripts: ALL_SCRIPTS });
    const pool = deckPool(engine);
    for (let i = 0; i < 12; i++) {
      const g = engine.newGame({ seed: `answers-${i}`, players: [randomDeck(pool, `a${i}`), randomDeck(pool, `b${i}`)], config: { deckRestrictions: false } });
      const rng = seedRng(`answers-agent-${i}`);
      let steps = 0;
      while (g.decision && steps < 3000) {
        const d = g.decision;
        expect(validateAnswer(d, defaultAnswer(d)), `${d.type} default`).toBeNull();
        const { answers } = enumerateAnswers(d, 40);
        expect(new Set(answers.map((a) => JSON.stringify(a))).size).toBe(answers.length);
        for (const a of answers) expect(validateAnswer(d, a), `${d.type} enumerated`).toBeNull();
        const a = randomAnswer(rng, d);
        expect(validateAnswer(d, a), `${d.type} random`).toBeNull();
        g.act(a);
        expect(invariantErrors(g)).toEqual([]);
        steps += 1;
      }
      expect(g.result).not.toBeNull();
    }
  }, 120_000);
});
