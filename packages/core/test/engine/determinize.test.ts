import { describe, expect, it } from "vitest";
import { createEngine, EngineError, opponentOf, randomAnswer, seedRng, type GameSession, type PlayerId } from "../../src";
import { ALL_CARDS, ALL_SCRIPTS } from "../../src/sets";
import { deckPool, randomDeck } from "../../src/testing";
import { invariantErrors } from "../helpers";

// GameSession.determinized (engine/determinize.ts): information-set sampling for bots.
const engine = createEngine({ cards: ALL_CARDS, scripts: ALL_SCRIPTS });
const pool = deckPool(engine);
const newGame = (i: number) =>
  engine.newGame({ seed: `det-${i}`, players: [randomDeck(pool, `x${i}`), randomDeck(pool, `y${i}`)], config: { deckRestrictions: false } });

/** Play random answers until `stop` says so (or the game ends); false if it ended first. */
function advance(g: GameSession, seed: string, stop: (g: GameSession, step: number) => boolean): boolean {
  const rng = seedRng(seed);
  for (let step = 0; g.decision; step++) {
    if (step > 0 && stop(g, step)) return true;
    g.act(randomAnswer(rng, g.decision));
  }
  return false;
}

const pastSetup = (g: GameSession) => g.state.turn >= 2;
const hiddenDefs = (g: GameSession, viewer: PlayerId) => {
  const zones = g.state.players[opponentOf(viewer)].zones;
  return [...zones.hand, ...zones.deck].map((id) => g.state.cards[id]!.def);
};

describe("determinized copies", () => {
  it("show the viewer exactly what the real game shows, at main phase and mid-action decisions", () => {
    let resampled = 0;
    let midAction = 0;
    for (let i = 0; i < 10; i++) {
      const g = newGame(i);
      const rng = seedRng(`det-play-${i}`);
      let step = 0;
      while (g.decision && step < 1500) {
        const d = g.decision;
        if (pastSetup(g) && step % 3 === 0) {
          const before = JSON.stringify(g.state);
          const copy = g.determinized(d.player, `s${step}`, { checkpoints: false });
          expect(JSON.stringify(g.state), "the real game is untouched").toBe(before);
          expect(copy.view(d.player), `game ${i} step ${step} (${d.type})`).toEqual(g.view(d.player));
          expect(invariantErrors(copy)).toEqual([]);
          if (JSON.stringify(hiddenDefs(copy, d.player)) !== JSON.stringify(hiddenDefs(g, d.player))) resampled += 1;
          if (d.type !== "mainPhase") midAction += 1;
        }
        g.act(randomAnswer(rng, d));
        step += 1;
      }
    }
    expect(resampled).toBeGreaterThan(50);
    expect(midAction).toBeGreaterThan(20);
  }, 120_000);

  it("stop at the same decision after main phases the engine ended by itself", () => {
    // Nothing but ending the main phase is auto-answered, so e.g. the other player's quick window
    // can be the first decision after the checkpoint; resampling the checkpoint would then change
    // the flow (the resampled hand could have plays).
    let found = 0;
    for (let i = 0; i < 40 && found < 5; i++) {
      const g = newGame(500 + i);
      advance(g, `auto-${i}`, (s) => {
        if (!pastSetup(s) || s.decision === null || s.decision.type === "mainPhase" || s.snapshot().inputs.length > 0) return false;
        const d = s.decision;
        const copy = s.determinized(d.player, "auto", { checkpoints: false });
        expect(copy.decision).toEqual(d);
        expect(copy.view(d.player)).toEqual(s.view(d.player));
        found += 1;
        return false;
      });
    }
    expect(found).toBeGreaterThan(0);
  }, 120_000);

  it("depend only on what the viewer knows and the seed", () => {
    const g = newGame(100);
    expect(advance(g, "same-info", (s) => pastSetup(s) && s.decision?.type === "mainPhase")).toBe(true);
    const viewer = g.decision!.player;
    // Another game the viewer can't tell apart from this one: same public cards, other hidden ones.
    const other = g.determinized(viewer, "another deal");
    expect(hiddenDefs(other, viewer)).not.toEqual(hiddenDefs(g, viewer));
    expect(JSON.stringify(other.determinized(viewer, "k").state)).toBe(JSON.stringify(g.determinized(viewer, "k").state));
    expect(JSON.stringify(g.determinized(viewer, "k2").state)).not.toBe(JSON.stringify(g.determinized(viewer, "k").state));
  }, 120_000);

  it("reseed future random events", () => {
    const g = newGame(101);
    advance(g, "reseed", (s) => pastSetup(s) && s.decision?.type === "mainPhase");
    expect(g.determinized(g.decision!.player, "r").state.rng).not.toEqual(g.state.rng);
  }, 120_000);

  it("made in the middle of an action can be copied again only from the next main phase on", () => {
    let checked = 0;
    for (let i = 0; i < 20 && checked < 3; i++) {
      const g = newGame(200 + i);
      if (!advance(g, `mid-${i}`, (s) => pastSetup(s) && s.decision !== null && s.decision.type !== "mainPhase")) continue;
      const copy = g.determinized(g.decision!.player, "m");
      expect(() => copy.clone()).toThrow(EngineError);
      expect(() => copy.determinized(0, "again")).toThrow(EngineError);
      if (!advance(copy, `mid-copy-${i}`, (s) => s.decision?.type === "mainPhase")) continue;
      expect(() => copy.clone()).not.toThrow();
      checked += 1;
    }
    expect(checked).toBe(3);
  }, 120_000);

  it("play on to the end with every invariant intact", () => {
    for (let i = 0; i < 8; i++) {
      const g = newGame(300 + i);
      if (!advance(g, `play-${i}`, (s) => pastSetup(s) && s.decision?.type === "mainPhase")) continue;
      const copy = g.determinized(g.decision!.player, `p${i}`, { checkpoints: false });
      advance(copy, `copy-${i}`, () => {
        expect(invariantErrors(copy)).toEqual([]);
        return false;
      });
      expect(copy.result).not.toBeNull();
    }
  }, 120_000);

  it("are not available during setup", () => {
    const g = newGame(400);
    expect(() => g.determinized(g.decision!.player, "setup")).toThrow(EngineError);
  }, 120_000);

  it("are not made for a session without checkpoints", () => {
    const g = engine.newGame(
      { seed: "no-checkpoints", players: [randomDeck(pool, "n0"), randomDeck(pool, "n1")], config: { deckRestrictions: false } },
      { checkpoints: false },
    );
    advance(g, "nc", (s) => pastSetup(s) && s.decision?.type === "mainPhase");
    expect(() => g.determinized(0, "x")).toThrow(EngineError);
  }, 120_000);
});
