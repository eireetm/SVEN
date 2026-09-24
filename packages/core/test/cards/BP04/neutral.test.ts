import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP04 Neutral (116–130, T02). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5, ZERO 1c 0/3.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const GOBLIN_KING = "BP04-T02";

describe("BP04 Neutral", () => {
  it("116 Zodiac Demon — engage, discard a follower: its cost to an enemy follower and half (rounded up) to its leader", () => {
    const t = d({ me: { field: ["BP04-116"], hand: ["V5"] }, opp: { field: ["V3"] } });
    t.activate("BP04-116");
    expect([t.field("opp"), t.leader("opp"), t.cemetery()]).toEqual([[], 17, ["V5"]]);
    const one = d({ me: { field: ["BP04-116"], hand: ["V1"] }, opp: { field: ["V3"] } }).activate("BP04-116");
    expect([one.stats("opp:V3"), one.leader("opp")]).toEqual([[3, 3], 19]);
    expect(d({ me: { field: ["BP04-116"], hand: ["V5"] } }).canActivate("BP04-116")).toBe(false);
  });

  it("117 / 118 Israfil — leader +4; Strike: 3 to each enemy follower; evolved: 5", () => {
    const t = d({ me: { hand: ["BP04-117"], playPoints: 8 } }).play("BP04-117");
    expect(t.leader()).toBe(24);
    const strike = d({ me: { field: ["BP04-117"] }, opp: { field: ["V1", "V5"] } }).attack("BP04-117", "opp:leader");
    expect([strike.field("opp"), strike.stats("opp:V5")]).toEqual([["V5"], [5, 2]]);
    const evo = d({ me: { field: ["BP04-117"], evolveDeck: ["BP04-118"], playPoints: 1 }, opp: { field: ["V5"] } });
    evo.evolve("BP04-117").attack("BP04-117", "opp:leader");
    expect(evo.field("opp")).toEqual([]);
  });

  it("119 / 120 Grimnir — Ward; evolve, pay 4: 4 damage to the enemy leader and each enemy follower", () => {
    const t = d({ me: { field: ["BP04-119"], evolveDeck: ["BP04-120"], playPoints: 6 }, opp: { field: ["V3", "V5"] } });
    t.evolve("BP04-119").yes();
    expect([t.field("opp"), t.stats("opp:V5"), t.leader("opp"), t.pp(), t.keywords("BP04-119")]).toEqual([["V5"], [5, 1], 16, 0, ["ward"]]);
    const no = d({ me: { field: ["BP04-119"], evolveDeck: ["BP04-120"], playPoints: 6 }, opp: { field: ["V3"] } }).evolve("BP04-119").no();
    expect([no.leader("opp"), no.pp()]).toEqual([20, 4]);
  });

  it("121 Arriet — an engaged follower of yours gets +2/+2 and is refreshed, but can't attack enemies this turn", () => {
    const t = d({ me: { hand: ["BP04-121"], field: [{ card: "V3", engaged: true }], playPoints: 5 }, opp: { field: [{ card: "V1", engaged: true }] } });
    t.play("BP04-121");
    expect([t.stats("V3"), t.engaged("V3"), t.attackTargets("V3")]).toEqual([[5, 6], false, []]);
    const none = d({ me: { hand: ["BP04-121"], field: ["V3"], playPoints: 5 } }).play("BP04-121");
    expect(none.stats("V3")).toEqual([3, 4]);
  });

  it("122 Staircase to Paradise — a soul counter per follower of yours put into a cemetery; with 6, dig 2 followers from the top 5", () => {
    const t = d({ me: { field: ["BP04-122", "V1", "BP01-T03"], hand: ["QUICK-SAC", "QUICK-SAC"] } });
    t.play("QUICK-SAC").pick("V1").play("QUICK-SAC"); // the Fairy token counts too (ruling)
    expect(t.counters("BP04-122", "soul")).toBe(2);
    expect(t.canActivate("BP04-122")).toBe(false);

    const deck = ["V1", "AMULET", "V2", "KILL", "V3", "V5"];
    const dig = d({ me: { field: [{ card: "BP04-122", counters: { soul: 6 } }], deck } });
    dig.activate("BP04-122").pick("V1", "V3").order();
    expect([dig.hand(), dig.zone("me", "deck"), dig.cemetery()]).toEqual([["V1", "V3"], ["V5", "AMULET", "V2", "KILL"], ["BP04-122"]]);
  });

  it("123 Purehearted Singer — draw on entering and on leaving", () => {
    const t = d({ me: { hand: ["BP04-123", "QUICK-SAC"], deck: ["V1", "V2"], playPoints: 3 } });
    t.play("BP04-123");
    expect(t.hand()).toEqual(["QUICK-SAC", "V1"]);
    t.play("QUICK-SAC");
    expect(t.hand()).toEqual(["V1", "V2"]);
  });

  it("124 / 125 Goblin Princess — a 1-cost Neutral follower from the deck; evolved: a Goblin King into EX, which buffs Goblins", () => {
    const t = d({ me: { hand: ["BP04-124"], deck: ["V2", "V1", "BP04-055"], playPoints: 3 } });
    t.play("BP04-124").pick("V1");
    expect(t.field()).toEqual(["BP04-124", "V1"]);
    const evo = d({ me: { field: ["BP04-124", "V1"], evolveDeck: ["BP04-125"], playPoints: 5 } });
    evo.evolve("BP04-124");
    expect(evo.ex()).toEqual([GOBLIN_KING]);
    evo.play(GOBLIN_KING).none();
    expect([evo.stats("BP04-124"), evo.stats("V1"), evo.keywords(GOBLIN_KING)]).toEqual([[4, 3], [2, 2], ["ward"]]);
  });

  it("126 Mystic Ring — Quick; put a card from hand on the deck bottom, then draw", () => {
    const t = d({ me: { hand: ["BP04-126", "V1", "V2"], deck: ["V3"], playPoints: 1 } });
    t.play("BP04-126").pick("V1");
    expect([t.hand(), t.zone("me", "deck")]).toEqual([["V2", "V3"], ["V1"]]);
    const empty = d({ me: { hand: ["BP04-126"], deck: ["V3"], playPoints: 1 } }).play("BP04-126");
    expect(empty.hand()).toEqual(["V3"]);
  });

  it("127 / 128 Owlcat — evolve banishes an enemy follower with 1 attack or less, or with 1 defense", () => {
    const t = d({ me: { field: ["BP04-127"], evolveDeck: ["BP04-128"], playPoints: 1 }, opp: { field: ["V5", "ZERO", "V1"] } });
    t.evolve("BP04-127");
    expect(t.zone("opp", "banished")).toEqual(["ZERO"]);
  });

  it("129 Mr. Full Moon — -3/-3 to an enemy follower on entering and on leaving", () => {
    const t = d({ me: { hand: ["BP04-129", "QUICK-SAC"], playPoints: 5 }, opp: { field: ["V5"] } });
    t.play("BP04-129");
    expect(t.stats("opp:V5")).toEqual([2, 2]);
    t.play("QUICK-SAC");
    expect(t.field("opp")).toEqual([]);
  });

  it("130 Night's Way — engage: the top card into an empty EX area (a token counts as a card)", () => {
    const t = d({ me: { field: ["BP04-130"], deck: ["V1"] } }).activate("BP04-130");
    expect(t.ex()).toEqual(["V1"]);
    const token = d({ me: { field: ["BP04-130"], ex: ["BP01-T03"], deck: ["V1"] } }).activate("BP04-130");
    expect([token.ex(), token.zone("me", "deck")]).toEqual([["BP01-T03"], ["V1"]]);
  });

  it("T02 Goblin King — Ward; other Goblinoid followers on your field get +1/+1", () => {
    const t = d({ me: { ex: [GOBLIN_KING], field: ["BP04-124", "V1"], playPoints: 4 } }).play(GOBLIN_KING).none();
    expect([t.stats("BP04-124"), t.stats("V1"), t.stats(GOBLIN_KING)]).toEqual([[3, 2], [2, 2], [6, 6]]);
  });
});
