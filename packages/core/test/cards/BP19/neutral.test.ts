import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP19 Neutral (110–120). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral); the synthetic cards are named after
// their ids. BP19-110 Cutthroat, Discord Convict is a follower with "Cutthroat" in its name.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };
const NINE = ["V1", "V2", "V3", "V5", "ZERO", "SWORD1", "WARD", "RUSH", "STORM"];

describe("BP19 Neutral", () => {
  it("110 Cutthroat, Discord Convict — Fanfare: 1 of the top 8 into the hand, the rest shuffled to the bottom; other cards 1 copy per deck", () => {
    const t = d({ me: { hand: ["BP19-110"], deck: [...NINE.slice(0, 8), "BANE"], playPoints: 1 } }).play("BP19-110").pick("V3");
    expect([t.hand(), t.zone("me", "deck")[0], t.zone("me", "deck").length]).toEqual([["V3"], "BANE", 8]);
    const deck = (extra: string[]) => ({ main: ["BP19-110", "BP19-110", "BP19-110", ...extra], evolve: ["BP19-111", "BP19-111", "BP19-118", "BP19-118"] });
    const problems = E.validateDeck(deck(["V1", "V1", "V3"]), { deckRestrictions: true });
    expect(problems.filter((p) => p.includes("copies"))).toEqual([
      'main deck: 2 copies of "V1", at most 1 (6.1.1.4)',
      'evolve deck: 2 copies of "Smeltwork Bodyguard", at most 1 (6.1.1.4)',
    ]);
    expect(E.validateDeck({ main: ["V1", "V1"], evolve: [] }, { deckRestrictions: true }).some((p) => p.includes("copies"))).toBe(false);
  });

  it("111 Cutthroat (Evolved) — 4 damage divided between up to 2; super-evolved: 8 damage to a follower and its leader", () => {
    const t = d({ me: { field: ["BP19-110"], evolveDeck: ["BP19-111"], playPoints: 4 }, opp: { field: ["V5", "V1"] } }).evolve("BP19-110");
    t.pick("opp:V5", "opp:V1").choose("1");
    expect([t.stats("opp:V5"), t.field("opp")]).toEqual([[5, 4], ["V5"]]);
    const s = d({ me: { field: ["BP19-110"], evolveDeck: ["BP19-111"], playPoints: 4, ...SUPER }, opp: { field: ["V5", "V1"] } });
    s.evolve("BP19-110", { sep: true }).flush().pick("opp:V1").flush();
    expect([s.field("opp"), s.leader("opp")]).toEqual([[], 12]);
  });

  it("112 Eudie, Maiden Reborn — Ward; Fanfare: draw, +2/+2 and leader +2 without a Super Evolution Point", () => {
    const t = d({ me: { hand: ["BP19-112"], deck: ["V1", "V3"], playPoints: 2, superEvolutionPoints: 0 } }).play("BP19-112").none();
    expect([t.stats("BP19-112"), t.leader(), t.hand()]).toEqual([[4, 5], 22, ["V1"]]);
    const one = d({ me: { hand: ["BP19-112"], deck: ["V1"], playPoints: 2 } }).play("BP19-112").none();
    expect([one.stats("BP19-112"), one.leader()]).toEqual([[2, 3], 20]);
  });

  it("113 / 114 Zerael — Fanfare: 9 revealed cards with different names: bury this, may summon Zerael, Regent of Vicissitude (Ward, Aura, destroy each enemy follower)", () => {
    const t = d({ me: { hand: ["BP19-113"], deck: NINE, evolveDeck: ["BP19-114"], playPoints: 7 }, opp: { field: ["V5", "V1"] } });
    t.play("BP19-113").pick("BP19-114").none();
    expect([t.field(), t.cemetery(), t.field("opp"), t.keywords("BP19-114")]).toEqual([["BP19-114"], ["BP19-113"], [], ["ward", "aura"]]);
    const same = d({ me: { hand: ["BP19-113"], deck: [...NINE.slice(0, 8), "V1"], evolveDeck: ["BP19-114"], playPoints: 7 } }).play("BP19-113");
    expect(same.field()).toEqual(["BP19-113"]);
    const eight = d({ me: { hand: ["BP19-113"], deck: NINE.slice(0, 8), evolveDeck: ["BP19-114"], playPoints: 7 } }).play("BP19-113");
    expect(eight.field()).toEqual(["BP19-113"]);
  });

  it("115 Ironforged Right Hand — Fanfare: draw, recover 2 with a Cutthroat follower on the field or in the cemetery", () => {
    expect(d({ me: { hand: ["BP19-115"], cemetery: ["BP19-110"], deck: ["V1"], playPoints: 2, maxPlayPoints: 5 } }).play("BP19-115").pp()).toBe(2);
    expect(d({ me: { hand: ["BP19-115"], deck: ["V1"], playPoints: 2, maxPlayPoints: 5 } }).play("BP19-115").pp()).toBe(0);
  });

  it("116 Azvaldt — Fanfare: a Condemned card from the top 4; act, engage and bury this: draw from your 8th turn", () => {
    const t = d({ me: { hand: ["BP19-116"], deck: ["V1", "BP19-117", "V3", "V5"], playPoints: 1 } }).play("BP19-116").pick("BP19-117").order();
    expect(t.hand()).toEqual(["BP19-117"]);
    const late = d({ me: { field: ["BP19-116"], deck: ["V1"], turnsPassed: 8 } }).activate("BP19-116");
    expect([late.hand(), late.cemetery()]).toEqual([["V1"], ["BP19-116"]]);
    const early = d({ me: { field: ["BP19-116"], deck: ["V1"], turnsPassed: 7 } }).activate("BP19-116");
    expect([early.hand(), early.cemetery()]).toEqual([[], ["BP19-116"]]);
  });

  it("117 / 118 Smeltwork Bodyguard — Ward; Fanfare: draw; evolved: with a Cutthroat follower, 4 damage and leader +4", () => {
    expect(d({ me: { hand: ["BP19-117"], deck: ["V1"], playPoints: 3 } }).play("BP19-117").none().hand()).toEqual(["V1"]);
    const e = d({ me: { field: ["BP19-117"], evolveDeck: ["BP19-118"], cemetery: ["BP19-110"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP19-117");
    expect([e.stats("opp:V5"), e.leader()]).toEqual([[5, 1], 24]);
    const none = d({ me: { field: ["BP19-117"], evolveDeck: ["BP19-118"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP19-117");
    expect([none.stats("opp:V5"), none.leader()]).toEqual([[5, 5], 20]);
  });

  it("119 Warden of Recurrence — Ward; Fanfare: a Zerael, Regent of Rebirth from the deck, or recover 8", () => {
    const t = d({ me: { hand: ["BP19-119"], deck: ["V1", "BP19-113"], playPoints: 8 } }).play("BP19-119").none().choose("zerael").pick("BP19-113");
    expect(t.field()).toEqual(["BP19-119", "BP19-113"]);
    expect(d({ me: { hand: ["BP19-119"], playPoints: 8, maxPlayPoints: 10 } }).play("BP19-119").none().choose("pp").pp()).toBe(8);
  });

  it("120 Blackrust Underling — Storm; Strike: 4 damage with a Cutthroat follower", () => {
    expect(d({ me: { field: ["BP19-120"], cemetery: ["BP19-110"] }, opp: { field: ["V5"] } }).attack("BP19-120", "opp:leader").stats("opp:V5")).toEqual([5, 1]);
    expect(d({ me: { field: ["BP19-120"] }, opp: { field: ["V5"] } }).attack("BP19-120", "opp:leader").stats("opp:V5")).toEqual([5, 5]);
  });
});
