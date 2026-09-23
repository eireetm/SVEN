import { describe, expect, it } from "vitest";
import type { GameSession, MainAction } from "../../src";
import { scenario } from "../../src/testing";
import { act, cardsOf, doMain, leaderId, mainActions, only, stats, testEngine } from "../helpers";

const engine = testEngine();
type Evolve = Extract<MainAction, { type: "evolve" }>;
const evolves = (g: GameSession) => mainActions(g).filter((a): a is Evolve => a.type === "evolve");

describe("CR 12.2 evolve ability / CR 5.16 evolve", () => {
  it("offers one action per corresponding evolved card and payment option", () => {
    const g = scenario(engine, {
      players: [{ field: ["EVOLVER"], evolveDeck: ["EVOLVER-E", "EVOLVER-E", "EVOLVER-E2", "V1"], playPoints: 2 }, {}],
    });
    const evolver = only(g.state.players[0].zones.field);
    // Player 0 went first: 0 evolution points, and super-evolution needs 7 turns passed (12.2.4).
    expect(evolves(g).map((a) => [a.card, g.state.cards[a.evolveCard]!.def, a.useEvolutionPoint, a.superEvolve])).toEqual([
      [evolver, "EVOLVER-E", false, false],
      [evolver, "EVOLVER-E2", false, false],
    ]);
  });

  it("5.16.1.2 / 5.16.2 — takes the evolved card's information except cost; keeps state and damage", () => {
    const g = scenario(engine, {
      players: [{ field: [{ card: "EVOLVER", engaged: true, damage: 1 }], evolveDeck: ["EVOLVER-E"], playPoints: 3 }, {}],
    });
    const evolver = only(g.state.players[0].zones.field);
    const action = only(evolves(g));
    const events = doMain(g, action);
    const c = g.state.cards[evolver]!;
    expect(c.zone).toBe("field"); // still the same card object (5.16.2)
    expect(c.engaged).toBe(true);
    expect(stats(g, evolver)).toEqual({ attack: 4, defense: 3 }); // 4/4 with 1 damage kept
    const info = g.reader().info(evolver);
    expect(info.cost).toBe(2); // base card cost
    expect(info.evolved).toBe(true);
    expect(g.state.players[0].playPoints).toBe(1);
    const linked = only(g.state.players[0].zones.evolveZone);
    expect(c.evolvedWith).toBe(linked);
    expect(g.state.players[0].zones.evolveDeck).toHaveLength(0);
    expect(events).toContainEqual({ type: "evolved", card: evolver, evolveCard: linked, superEvolved: false });
  });

  it("12.2.3 — one evolution point may replace one play point", () => {
    const g = scenario(engine, {
      turn: 6, // player 1's turn; player 1 went second and has 3 evolution points
      players: [{}, { field: ["EVOLVER"], evolveDeck: ["EVOLVER-E"], playPoints: 1 }],
    });
    const options = evolves(g).map((a) => [a.useEvolutionPoint, a.superEvolve]);
    expect(options).toEqual([[true, false]]); // 1 PP alone cannot pay 2
    doMain(g, evolves(g)[0]!);
    expect(g.state.players[1].playPoints).toBe(0);
    expect(g.state.players[1].evolutionPoints).toBe(2);
  });

  it("8.3.2.1 — only one evolve ability per turn", () => {
    const g = scenario(engine, {
      players: [
        { field: ["EVOLVER", "EVOLVER"], evolveDeck: ["EVOLVER-E", "EVOLVER-E"], playPoints: 4, deck: ["V1"] },
        { deck: ["V1"] },
      ],
    });
    doMain(g, evolves(g)[0]!);
    expect(evolves(g)).toEqual([]);
    doMain(g, { type: "endMainPhase" }); // player 1's turn
    doMain(g, { type: "endMainPhase" }); // player 0's next turn
    expect(evolves(g)).toHaveLength(1);
  });

  it("12.2.5 / 5.16.4 — an evolved follower cannot evolve again", () => {
    const g = scenario(engine, {
      players: [{ field: [{ card: "EVOLVER", evolvedInto: "EVOLVER-E" }], evolveDeck: ["EVOLVER-E"], playPoints: 5 }, {}],
    });
    expect(evolves(g)).toEqual([]);
  });

  it("12.2.2 — needs a corresponding (same name) card in the evolve deck", () => {
    const g = scenario(engine, { players: [{ field: ["EVOLVER"], playPoints: 5 }, {}] });
    expect(evolves(g)).toEqual([]);
  });

  it("12.2.4 — super-evolve after 7 turns passed (first player) or 6 (second player): +1/+1", () => {
    const early = scenario(engine, {
      turn: 11, // player 0 has passed 6 turns
      players: [{ field: ["EVOLVER"], evolveDeck: ["EVOLVER-E"], playPoints: 5 }, {}],
    });
    expect(evolves(early).some((a) => a.superEvolve)).toBe(false);

    const g = scenario(engine, {
      turn: 13, // player 0 has passed 7 turns
      players: [{ field: ["EVOLVER"], evolveDeck: ["EVOLVER-E"], playPoints: 5 }, {}],
    });
    const sup = evolves(g).find((a) => a.superEvolve && !a.useEvolutionPoint)!;
    const evolver = sup.card;
    doMain(g, sup);
    expect(stats(g, evolver)).toEqual({ attack: 5, defense: 5 });
    expect(g.state.cards[evolver]!.superEvolved).toBe(true);
    expect(g.state.players[0].superEvolutionPoints).toBe(0);

    const second = scenario(engine, {
      turn: 12, // player 1 (second) has passed 6 turns
      players: [{}, { field: ["EVOLVER"], evolveDeck: ["EVOLVER-E"], playPoints: 5 }],
    });
    expect(evolves(second).some((a) => a.superEvolve)).toBe(true);
  });

  it("11.6.1 / 4.6.3 — when the follower leaves the field its evolved card returns faceup and cannot be reused", () => {
    const g = scenario(engine, {
      players: [
        { field: [{ card: "EVOLVER", evolvedInto: "EVOLVER-E" }, "EVOLVER"], playPoints: 5, deck: ["V1"] },
        { hand: ["KILL"], playPoints: 1, deck: ["V1"] },
      ],
    });
    const [evolved] = g.state.players[0].zones.field;
    doMain(g, { type: "endMainPhase" });
    doMain(g, { type: "play", card: only(cardsOf(g, 1, "hand", "KILL")) });
    act(g, { type: "selectCards", cards: [evolved!] });
    const p0 = g.state.players[0];
    expect(p0.zones.evolveZone).toHaveLength(0);
    const back = only(p0.zones.evolveDeck);
    expect(g.state.cards[back]).toMatchObject({ def: "EVOLVER-E", faceUp: true });
    doMain(g, { type: "endMainPhase" });
    expect(evolves(g)).toEqual([]); // the faceup card is not part of the evolve deck
  });

  it("12.6 — On Evolve abilities of the evolved card trigger", () => {
    const g = scenario(engine, {
      players: [{ field: ["EVOLVER"], evolveDeck: ["EVOLVER-E2"], playPoints: 2, deck: ["V5"] }, {}],
    });
    doMain(g, only(evolves(g)));
    expect(g.decision).toMatchObject({ type: "selectPending", player: 0 });
    act(g, { type: "selectPending", id: (g.decision as { options: string[] }).options[0]! });
    expect(cardsOf(g, 0, "hand", "V5")).toHaveLength(1);
  });

  it("8.4.2.1 — a follower played and evolved this turn can attack engaged followers, not the leader", () => {
    const g = scenario(engine, {
      players: [
        { hand: ["EVOLVER"], evolveDeck: ["EVOLVER-E"], playPoints: 4 },
        { field: [{ card: "V1", engaged: true }] },
      ],
    });
    doMain(g, { type: "play", card: only(cardsOf(g, 0, "hand", "EVOLVER")) });
    expect(mainActions(g).some((a) => a.type === "attack")).toBe(false);
    doMain(g, only(evolves(g)));
    const targets = mainActions(g).flatMap((a) => (a.type === "attack" ? [a.target] : []));
    expect(targets).toEqual(g.state.players[1].zones.field);
    expect(targets).not.toContain(leaderId(g, 1));
  });
});
