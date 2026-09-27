import { describe, expect, it } from "vitest";
import { deckUniverse } from "../../src/engine/deck";
import { drive, type DriveSpec } from "../../src/testing";
import { cardEngine } from "../helpers";

// Universes (CR 6.1.1.5, 14) and Umamusume racing (CR 14.2), with CP01 cards. CP01-007 Eishin Flash (3c 3/3; serve
// {[feed]} (1): race; On Race: +1/+1, return up to 1 enemy follower), CP01-042 Oguri Cap (serve 1, 2 or 3 times; On Race
// +2/+1), CP01-085 Carrot, CP01-LD01 an Umamusume leader. V1 is 1c 2/2, V5 5c 5/5; QUICK-SAC destroys a follower of yours.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const CARROT = "CP01-085";

describe("CR 6.1.1.5 — the deck's universe", () => {
  it("is the universe the leader and every card share; otherwise the deck is based on a class", () => {
    const deck = { leader: "CP01-LD01", main: ["CP01-007", "CP01-001"], evolve: [CARROT, "CP01-002"] };
    expect(deckUniverse(E.db, deck)).toBe("umamusume");
    expect(deckUniverse(E.db, { ...deck, main: [...deck.main, "BP01-001"] })).toBeNull();
    expect(deckUniverse(E.db, { main: deck.main, evolve: deck.evolve })).toBeNull();
    expect(deckUniverse(E.db, { ...deck, leader: "BP01-LD01" })).toBeNull();
  });

  it("is recorded in the player's state and public in the player view", () => {
    const deck = { leader: "CP01-LD01", main: Array<string>(40).fill("CP01-007"), evolve: [CARROT] };
    const other = { main: Array<string>(40).fill("BP01-001"), evolve: [] };
    const game = E.newGame({ seed: 1, players: [deck, other], config: { deckRestrictions: false } });
    expect([game.state.players[0].universe, game.state.players[1].universe]).toEqual(["umamusume", null]);
    expect(game.view(1).players[0].universe).toBe("umamusume");
  });

  it("with deck restrictions, a universe deck may mix classes; a class deck may not (CR 6.1.1.5.1 / 6.1.1.5.2)", () => {
    const mixed = { leader: "CP01-LD01", main: [...Array<string>(20).fill("CP01-007"), ...Array<string>(20).fill("CP01-014")], evolve: [CARROT] };
    const classProblems = (deck: typeof mixed) => E.validateDeck(deck).filter((p) => p.includes("6.1.1.5.1") || p.includes("copies"));
    expect(classProblems(mixed).filter((p) => p.includes("6.1.1.5.1"))).toEqual([]);
    const withBp = { ...mixed, main: [...mixed.main.slice(1), "BP01-020"] };
    expect(classProblems(withBp).some((p) => p.includes("6.1.1.5.1"))).toBe(true);
  });
});

describe("CR 14.2 — serving and racing (Umamusume)", () => {
  it("14.2.1 / 14.2.3 — serving links a facedown Carrot in the race zone; the racing follower has Rush and races once", () => {
    const t = d({ me: { field: ["CP01-007"], evolveDeck: [CARROT, CARROT], playPoints: 1 }, opp: { field: ["V5"] } });
    t.activate("CP01-007").pick("opp:V5");
    const g = t.game.reader();
    const race = t.game.state.players[0].zones.raceZone;
    expect([race.length, t.game.state.cards[race[0]!]!.linkedTo, g.isRacing(t.id("CP01-007")), g.racedTimes(t.id("CP01-007"))]).toEqual([
      1,
      t.id("CP01-007"),
      true,
      1,
    ]);
    expect([t.stats("CP01-007"), t.keywords("CP01-007"), t.hand("opp"), t.pp()]).toEqual([[4, 4], ["rush"], ["V5"], 0]);
    // 14.2.1.2.1 / ruling: a follower that raced can't be served again.
    expect(g.canServe(t.id("CP01-007"), 1)).toBe(false);
  });

  it("14.2.2.4 / 14.2.2.5 — a serve ability may use an evolution point for 1 play point and counts as the turn's evolve ability", () => {
    const t = d({ me: { field: ["CP01-007", "CP01-001"], evolveDeck: [CARROT, "CP01-002"], playPoints: 0, evolutionPoints: 1 } });
    t.activate("CP01-007", 0, { ep: true });
    expect([t.game.state.players[0].evolutionPoints, t.game.reader().isRacing(t.id("CP01-007")), t.canEvolve("CP01-001")]).toEqual([0, true, false]);
  });

  it("serving N times needs N facedown Carrots and triggers On Race N times (CP01-042 rulings)", () => {
    const t = d({ me: { field: ["CP01-042"], evolveDeck: [CARROT, CARROT], playPoints: 3 } });
    expect(t.canActivate("CP01-042")).toBe(true);
    t.activate("CP01-042", 1).flush();
    expect([t.stats("CP01-042"), t.game.reader().racedTimes(t.id("CP01-042")), t.zone("me", "raceZone").length]).toEqual([[8, 6], 2, 2]);
    const three = d({ me: { field: ["CP01-042"], evolveDeck: [CARROT, CARROT], playPoints: 3 } });
    const legal = (three.decision?.type === "mainPhase" ? three.decision.actions : []).filter((a) => a.type === "activate");
    expect(legal.length).toBe(2); // race 1 time or 2 times; 3 needs a third Carrot
  });

  it("11.8.1 — when the racing follower leaves the field, its Carrot goes faceup to the evolve deck area and can't be served", () => {
    const t = d({ me: { field: [{ card: "CP01-007", racing: 1 }, "V1"], hand: ["QUICK-SAC"], evolveDeck: [] } });
    t.play("QUICK-SAC").pick("CP01-007");
    const deck = t.game.state.players[0].zones.evolveDeck;
    expect([t.zone("me", "raceZone"), deck.length, t.game.state.cards[deck[0]!]!.faceUp, t.game.reader().carrotsToServe(0)]).toEqual([[], 1, true, []]);
  });
});
