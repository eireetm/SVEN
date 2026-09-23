import { describe, expect, it } from "vitest";
import type { GameSession, MainAction } from "../../../src";
import { scenario } from "../../../src/testing";
import { bp01Engine, doMain, only, stats } from "../../helpers";

// BP01-174 Goliath (Neutral follower, 3: 3/4) — "{[evolve]}{[cost02]}: Evolve this follower."
// Evolved card: BP01-175 Goliath (Evolved), 5/6, no text.
const engine = bp01Engine();
const evolves = (g: GameSession) =>
  (g.decision?.type === "mainPhase" ? g.decision.actions : []).filter(
    (a): a is Extract<MainAction, { type: "evolve" }> => a.type === "evolve",
  );

describe("BP01-174 Goliath", () => {
  it("evolves for 2 play points into a 5/6 (CR 12.2, 5.16.1.2)", () => {
    const g = scenario(engine, {
      players: [{ field: ["BP01-174"], evolveDeck: ["BP01-175"], playPoints: 2 }, {}],
    });
    const goliath = only(g.state.players[0].zones.field);
    doMain(g, only(evolves(g)));
    expect(g.state.players[0].playPoints).toBe(0);
    expect(stats(g, goliath)).toEqual({ attack: 5, defense: 6 });
    expect(g.reader().info(goliath).cost).toBe(3);
  });

  it("CR 12.2.3 — can evolve with 1 play point and 1 evolution point", () => {
    const g = scenario(engine, {
      turn: 6,
      players: [{}, { field: ["BP01-174"], evolveDeck: ["BP01-175"], playPoints: 1 }],
    });
    doMain(g, only(evolves(g)));
    expect(g.state.players[1]).toMatchObject({ playPoints: 0, evolutionPoints: 2 });
  });

  it("CR 5.16.1.1.1 — a Goblin (Evolved) does not correspond to Goliath", () => {
    const g = scenario(engine, {
      players: [{ field: ["BP01-174"], evolveDeck: ["BP01-172"], playPoints: 5 }, {}],
    });
    expect(evolves(g)).toEqual([]);
  });
});
