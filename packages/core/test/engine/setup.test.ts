import { describe, expect, it } from "vitest";
import { DeckError, type DeckList, type GameSession, type PlayerId } from "../../src";
import { act, bp01Engine, testEngine } from "../helpers";

const mixed = (): string[] => [
  ...Array<string>(10).fill("V1"),
  ...Array<string>(10).fill("V2"),
  ...Array<string>(10).fill("V3"),
  ...Array<string>(10).fill("V5"),
];

function newGame(seed: string | number, firstPlayer: PlayerId | null = 0): GameSession {
  const deck: DeckList = { main: mixed(), evolve: ["EVOLVER-E"] };
  return testEngine().newGame({
    seed,
    players: [deck, deck],
    config: { deckRestrictions: false, firstPlayer, autoResolve: [] },
  });
}

const keep = { type: "mulligan", redraw: false } as const;
const defs = (g: GameSession, ids: readonly string[]) => ids.map((id) => g.state.cards[id]!.def);

describe("CR 6.2 before starting a game", () => {
  it("6.2.1.6 — a randomly picked player decides who goes first", () => {
    const g1 = newGame("order", null);
    const d = g1.decision!;
    expect(d.type).toBe("chooseTurnOrder");
    act(g1, { type: "chooseTurnOrder", goFirst: false });
    expect(g1.state.firstPlayer).toBe(d.player === 0 ? 1 : 0);

    const g2 = newGame("order", null);
    act(g2, { type: "chooseTurnOrder", goFirst: true });
    expect(g2.state.firstPlayer).toBe(d.player);
  });

  it("6.2.1.4 / 6.2.1.7 — decks are shuffled and each player draws four", () => {
    const g = newGame("draw");
    expect(g.state.players[0].zones.hand).toHaveLength(4);
    expect(g.state.players[1].zones.hand).toHaveLength(4);
    expect(g.state.players[0].zones.deck).toHaveLength(36);
    // Shuffled: the deck is not in list order (10 V1, 10 V2, ...).
    expect(defs(g, g.state.players[0].zones.deck).slice(0, 10)).not.toEqual(Array(10).fill("V1"));
  });

  it("6.2.1.8 — the first player decides first, then the second player", () => {
    const g = newGame("mull", 1);
    expect(g.decision).toMatchObject({ type: "mulligan", player: 1 });
    act(g, keep);
    expect(g.decision).toMatchObject({ type: "mulligan", player: 0 });
  });

  it("6.2.1.8 — redrawing puts the hand on the bottom in the chosen order and draws four", () => {
    const g = newGame("redraw");
    const p = g.state.players[0];
    const hand = [...p.zones.hand];
    const nextFour = defs(g, p.zones.deck.slice(0, 4));
    const order = [...hand].reverse();
    const orderDefs = defs(g, order);
    act(g, { type: "mulligan", redraw: true, bottomOrder: order });
    expect(defs(g, p.zones.deck.slice(-4))).toEqual(orderDefs);
    expect(defs(g, p.zones.hand)).toEqual(nextFour);
    expect(p.zones.deck).toHaveLength(36);
  });

  it("6.2.1.8 — bottomOrder must be a permutation of the hand", () => {
    const g = newGame("bad-order");
    const hand = g.state.players[0].zones.hand;
    expect(() => g.act({ type: "mulligan", redraw: true, bottomOrder: hand.slice(1) })).toThrow(/permutation/);
    expect(() => g.act({ type: "mulligan", redraw: false, bottomOrder: [...hand] })).toThrow();
  });

  it("6.2.1.9–6.2.1.12, 6.2.1.14 — starting values, then the first player's first turn", () => {
    const g = newGame("start", 1);
    act(g, keep);
    act(g, keep);
    const [p0, p1] = g.state.players;
    expect(g.state.turn).toBe(1);
    expect(g.state.activePlayer).toBe(1);
    expect(p0.leaderDefense).toBe(20);
    expect(p1.leaderDefense).toBe(20);
    expect(p1.evolutionPoints).toBe(0); // went first
    expect(p0.evolutionPoints).toBe(3); // went second
    expect(p0.superEvolutionPoints).toBe(1);
    expect(p1.superEvolutionPoints).toBe(1);
    expect([p1.maxPlayPoints, p1.playPoints]).toEqual([1, 1]); // 7.2.1 / 7.2.2 on turn 1
    expect([p0.maxPlayPoints, p0.playPoints]).toEqual([0, 0]);
    expect(p1.zones.hand).toHaveLength(4); // 7.2.4.1 no draw on the first player's first turn
    expect(g.decision).toMatchObject({ type: "mainPhase", player: 1 });
  });

  it("is deterministic: same seed and answers give the same game", () => {
    const run = (seed: string) => {
      const g = newGame(seed);
      act(g, { type: "mulligan", redraw: true });
      act(g, keep);
      return JSON.stringify(g.state);
    };
    expect(run("same")).toBe(run("same"));
    expect(run("same")).not.toBe(run("other"));
  });
});

describe("CR 6.1 deck construction", () => {
  const engine = testEngine();
  const forty = (id: string) => Array<string>(40).fill(id);
  const legal = (): DeckList => ({
    leader: "L-SWORD",
    main: [...Array(3).fill("V1"), ...Array(3).fill("V2"), ...Array(34).fill("V3")],
    evolve: [],
  });

  it("6.1.1.4 — at most three copies per card name in each deck", () => {
    expect(engine.validateDeck(legal())).toContainEqual(expect.stringContaining('34 copies of "V3"'));
    expect(engine.validateDeck(legal(), { deckRestrictions: false })).toEqual([]);
  });

  it("6.1.1.2 / 6.1.1.3 — main deck 40–50 cards, evolve deck at most 10", () => {
    const problems = engine.validateDeck({ leader: "L-SWORD", main: ["V1"], evolve: Array(11).fill("EVOLVER-E") });
    expect(problems.join("\n")).toMatch(/main deck has 1 cards/);
    expect(problems.join("\n")).toMatch(/evolve deck has 11 cards/);
  });

  it("6.1.1.1 / 6.1.1.5.1 — a leader is required and cards must be Neutral or its class", () => {
    expect(engine.validateDeck({ main: forty("V1"), evolve: [] })).toContain("a leader card is required (6.1.1.1)");
    const wrongClass = engine.validateDeck({ leader: "L-FOREST", main: forty("SWORD1"), evolve: [] });
    expect(wrongClass.join("\n")).toMatch(/does not match the leader class Forestcraft/);
    expect(engine.validateDeck({ leader: "L-FOREST", main: forty("SWORD1"), evolve: [] }, { deckRestrictions: false })).toEqual([]);
  });

  it("structural rules apply even with restrictions off (6.1.1.2, 6.1.1.3, 9.1.4)", () => {
    const off = { deckRestrictions: false };
    expect(engine.validateDeck({ main: ["EVOLVER-E"], evolve: [] }, off).join()).toMatch(/cannot be in the main deck/);
    expect(engine.validateDeck({ main: ["TOKEN"], evolve: [] }, off).join()).toMatch(/cannot be in the main deck/);
    expect(engine.validateDeck({ main: [], evolve: ["V1"] }, off).join()).toMatch(/not an evolved or advanced card/);
    expect(engine.validateDeck({ leader: "V1", main: [], evolve: [] }, off).join()).toMatch(/not a leader card/);
    expect(engine.validateDeck({ main: ["NOPE"], evolve: [] }, off).join()).toMatch(/unknown card number NOPE/);
  });

  it("refuses cards whose effects are not implemented, unless allowed", () => {
    const deck: DeckList = { main: Array(40).fill("UNIMPL"), evolve: [] };
    expect(engine.validateDeck(deck, { deckRestrictions: false })).toEqual(["card effect not implemented yet: UNIMPL UNIMPL"]);
    expect(engine.validateDeck(deck, { deckRestrictions: false, allowUnimplementedCards: true })).toEqual([]);
    expect(() => engine.newGame({ seed: 1, players: [deck, deck], config: { deckRestrictions: false } })).toThrow(DeckError);
    expect(bp01Engine().validateDeck({ main: Array(40).fill("BP01-006"), evolve: [] }, { deckRestrictions: false })).toEqual([]);
  });
});
