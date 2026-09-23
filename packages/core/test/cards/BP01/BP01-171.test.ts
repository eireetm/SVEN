import { describe, expect, it } from "vitest";
import type { GameSession, MainAction } from "../../../src";
import { scenario } from "../../../src/testing";
import { bp01Engine, doMain, only, stats } from "../../helpers";

// BP01-171 Goblin (Neutral follower, 1: 2/2) — "{[evolve]}{[cost04]}: Evolve this follower."
// Evolved card: BP01-172 Goblin (Evolved), 4/4, no text.
const engine = bp01Engine();
const evolves = (g: GameSession) =>
  (g.decision?.type === "mainPhase" ? g.decision.actions : []).filter(
    (a): a is Extract<MainAction, { type: "evolve" }> => a.type === "evolve",
  );

describe("BP01-171 Goblin", () => {
  it("evolves for 4 play points into a 4/4 (CR 12.2, 5.16.1.2)", () => {
    const g = scenario(engine, {
      players: [{ field: ["BP01-171"], evolveDeck: ["BP01-172"], playPoints: 4 }, {}],
    });
    const goblin = only(g.state.players[0].zones.field);
    expect(stats(g, goblin)).toEqual({ attack: 2, defense: 2 });
    doMain(g, only(evolves(g)));
    expect(g.state.players[0].playPoints).toBe(0);
    expect(stats(g, goblin)).toEqual({ attack: 4, defense: 4 });
    expect(g.reader().info(goblin)).toMatchObject({ name: "Goblin", cost: 1, evolved: true });
  });

  it("cannot evolve with only 3 play points and no evolution point", () => {
    const g = scenario(engine, {
      players: [{ field: ["BP01-171"], evolveDeck: ["BP01-172"], playPoints: 3, evolutionPoints: 0 }, {}],
    });
    expect(evolves(g)).toEqual([]);
  });

  it("CR 12.2.3 — 3 play points and 1 evolution point", () => {
    const g = scenario(engine, {
      players: [{ field: ["BP01-171"], evolveDeck: ["BP01-172"], playPoints: 3, evolutionPoints: 1 }, {}],
    });
    const action = only(evolves(g));
    expect(action.useEvolutionPoint).toBe(true);
    doMain(g, action);
    expect(g.state.players[0]).toMatchObject({ playPoints: 0, evolutionPoints: 0 });
  });

  it("an alternate-art evolved printing works the same (definitions are shared)", () => {
    const g = scenario(engine, {
      players: [{ field: ["BP01-171"], evolveDeck: ["BP01-172"], playPoints: 4 }, {}],
    });
    expect(engine.db.ofPrinting("BP01-172").printings).toEqual(["BP01-172"]);
    expect(evolves(g)).toHaveLength(1);
  });
});
