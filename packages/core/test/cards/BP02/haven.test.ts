import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP02 Havencraft (089–105) and its token Ephemeral Moon (T08).
// "V1".."V5" are vanilla test followers (cost N, V1 = 2/2, V2 = 2/3, V3 = 3/4, V5 = 5/5).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const MOON = "BP02-T08";

describe("BP02 Havencraft", () => {
  it("089 Heavenly Aegis — can't be destroyed by abilities (the rest of the effect happens); Aura", () => {
    const t = d({ me: { field: ["BP02-089"], hand: ["BP01-140"], deck: ["V1"], playPoints: 1 } }).play("BP01-140");
    expect([t.field(), t.leader(), t.hand(), t.keywords("BP02-089")]).toEqual([["BP02-089"], 23, ["V1"], ["aura"]]);
  });

  it("089 Heavenly Aegis — evolves for 2 PP or by discarding 3 cards", () => {
    const t = d({ me: { field: ["BP02-089"], evolveDeck: ["BP02-090"], hand: ["V1", "V2", "V3"], playPoints: 0 } });
    t.evolve("BP02-089");
    expect([t.hand(), t.cemetery(), t.stats("BP02-089@field")]).toEqual([[], ["V1", "V2", "V3"], [10, 10]]);
  });

  it("090 Heavenly Aegis (Evolved) — no damage for the rest of this turn and during the opponent's next turn", () => {
    const t = d({
      me: { field: ["BP02-089"], evolveDeck: ["BP02-090"], deck: ["V1"], playPoints: 2 },
      opp: { field: [{ card: "V5", engaged: true }, "V3"], deck: ["V1"] },
    });
    t.evolve("BP02-089").attack("BP02-089", "opp:V5");
    expect([t.stats("BP02-089@field"), t.field("opp")]).toEqual([[10, 10], ["V3"]]);
    t.end().attack("opp:V3", "BP02-089"); // the opponent's next turn
    expect(t.stats("BP02-089@field")).toEqual([10, 10]);
    t.end(); // the effect ends with that turn
    expect(t.game.state.effects.some((e) => e.change.kind === "preventDamage")).toBe(false);
  });

  it("091 Enstatued Seraph — at 4 prayer counters: to the cemetery, leader +10, up to 2 deck cards into EX costing 0", () => {
    const t = d({
      me: { field: [{ card: "BP02-091", counters: { prayer: 3 } }], deck: ["V5", "V5", "V3"], playPoints: 0, maxPlayPoints: 0 },
      opp: { deck: ["V1", "V1"] },
    });
    t.end().pick("V5", "V5");
    expect([t.field(), t.cemetery(), t.leader(), t.ex()]).toEqual([[], ["BP02-091"], 30, ["V5", "V5"]]);
    t.end(); // the opponent's turn ends; my next turn: 1 play point
    expect([t.pp(), t.canPlay("V5@ex")]).toEqual([1, true]);
    const three = d({ me: { field: [{ card: "BP02-091", counters: { prayer: 2 } }] }, opp: { deck: ["V1"] } }).end();
    expect([three.field(), three.counters("BP02-091", "prayer")]).toEqual([["BP02-091"], 3]);
  });

  it("092 / 093 Kaguya — may put an amulet costing 3 or less from your hand; amulets entering deal damage equal to their cost", () => {
    const t = d({ me: { hand: ["BP02-092", "BP02-095"], playPoints: 5 }, opp: { field: ["V5"] } }).play("BP02-092").pick("BP02-095");
    expect([t.field(), t.stats("opp:V5")]).toEqual([["BP02-092", "BP02-095"], [5, 2]]);
    const none = d({ me: { hand: ["BP02-092", "BP02-095"], playPoints: 5 }, opp: { field: ["V5"] } }).play("BP02-092").none();
    expect(none.hand()).toEqual(["BP02-095"]);
    const evo = d({ me: { field: ["BP02-092"], evolveDeck: ["BP02-093"], playPoints: 2 }, opp: { field: ["V5"] } }).evolve("BP02-092");
    expect([evo.field(), evo.leader(), evo.stats("opp:V5")]).toEqual([["BP02-092", MOON], 23, [5, 2]]);
  });

  it("T08 Ephemeral Moon — your Kaguyas take no damage during your turn; banished at the start of your main phase", () => {
    const mine = d({ me: { field: ["BP02-092", MOON] }, opp: { field: [{ card: "V5", engaged: true }] } }).attack("BP02-092", "opp:V5");
    expect([mine.stats("BP02-092"), mine.stats("opp:V5")]).toEqual([[4, 4], [5, 1]]);
    const theirs = d({ turn: 6, me: { field: [{ card: "BP02-092", engaged: true }, MOON] }, opp: { field: ["V3"] } }).attack("opp:V3", "BP02-092");
    expect(theirs.stats("BP02-092")).toEqual([4, 1]);
    const banished = d({ me: { field: [MOON], deck: ["V1"] }, opp: { deck: ["V1"] } }).end().end();
    expect(banished.field()).toEqual([]);
  });

  it("094 Tribunal of Good and Evil — fanfare destroys an enemy follower; act: engage, bury, draw", () => {
    expect(d({ me: { hand: ["BP02-094"], playPoints: 5 }, opp: { field: ["V5"] } }).play("BP02-094").field("opp")).toEqual([]);
    const act = d({ me: { field: ["BP02-094"], deck: ["V1"] } }).activate("BP02-094");
    expect([act.hand(), act.cemetery()]).toEqual([["V1"], ["BP02-094"]]);
  });

  it("095 Elana's Prayer — once per turn, when your leader gains defense, +1/+1 to each of your followers", () => {
    const t = d({ me: { field: ["BP02-095", "V1"], hand: ["BP02-013", "BP02-100"], playPoints: 5 } });
    t.play("BP02-013");
    expect([t.leader(), t.stats("V1"), t.stats("BP02-013")]).toEqual([23, [3, 3], [2, 6]]);
    t.play("BP02-100");
    expect([t.leader(), t.stats("V1")]).toEqual([25, [3, 3]]);
  });

  it("096 / 097 Radiance Angel — Ward; draw; evolved: leader +2", () => {
    expect(d({ me: { hand: ["BP02-096"], deck: ["V1"], playPoints: 4 } }).play("BP02-096").none().hand()).toEqual(["V1"]);
    expect(d({ me: { field: ["BP02-096"], evolveDeck: ["BP02-097"], playPoints: 1 } }).evolve("BP02-096").leader()).toBe(22);
  });

  it("098 Sapphire Priestess — draws 3 at your end phase after 3 attacks by your followers", () => {
    const t = d({ me: { field: ["BP02-098", "V1", "V1", "V1"], deck: ["V2", "V2", "V2"] }, opp: { deck: ["V1"] } });
    for (let i = 0; i < 3; i++) t.attack("V1@field", "opp:leader");
    expect(t.end().hand()).toEqual(["V2", "V2", "V2"]);
    const two = d({ me: { field: ["BP02-098", "V1", "V1"], deck: ["V2", "V2", "V2"] }, opp: { deck: ["V1"] } });
    two.attack("V1@field", "opp:leader").attack("V1@field", "opp:leader");
    expect(two.end().hand()).toEqual([]);
  });

  it("099 Beastcall Aria / 100 Frog Cleric — Holy Falcon, act for a Holy Tiger; leader +2, act 2: leader +1", () => {
    expect(d({ me: { hand: ["BP02-099"], playPoints: 3 } }).play("BP02-099").field()).toEqual(["BP02-099", "BP01-T16"]);
    expect(d({ me: { field: ["BP02-099"], playPoints: 2 } }).activate("BP02-099").field()).toEqual(["BP01-T17"]);
    const frog = d({ me: { hand: ["BP02-100"], playPoints: 4 } }).play("BP02-100");
    expect(frog.leader()).toBe(22);
    expect(frog.activate("BP02-100").leader()).toBe(23);
  });

  it("101 Sky Sprite — +2/+2 to another follower put onto your field this turn", () => {
    const t = d({ me: { hand: ["V1", "BP02-101"], field: ["V2"], playPoints: 4 } }).play("V1").play("BP02-101");
    expect([t.stats("V1"), t.stats("V2")]).toEqual([[4, 4], [2, 3]]);
  });

  it("102 / 103 Soul Collector — banish an enemy follower costing 4 or less; evolved: a Havencraft follower from the cemetery", () => {
    const t = d({ me: { hand: ["BP02-102"], playPoints: 6 }, opp: { field: ["V5", "V3"] } }).play("BP02-102");
    expect([t.field("opp"), t.zone("opp", "banished")]).toEqual([["V5"], ["V3"]]);
    const evo = d({ me: { field: ["BP02-102"], evolveDeck: ["BP02-103"], cemetery: ["BP02-100", "V1"], playPoints: 1 } }).evolve("BP02-102");
    expect(evo.hand()).toEqual(["BP02-100"]);
  });

  it("104 Sledgehammer Exorcist — optional 2 PP: 4 damage", () => {
    const paid = d({ me: { hand: ["BP02-104"], playPoints: 5 }, opp: { field: ["V5"] } }).play("BP02-104").yes();
    expect([paid.stats("opp:V5"), paid.pp()]).toEqual([[5, 1], 0]);
    const declined = d({ me: { hand: ["BP02-104"], playPoints: 5 }, opp: { field: ["V5"] } }).play("BP02-104").no();
    expect([declined.stats("opp:V5"), declined.pp()]).toEqual([[5, 5], 2]);
  });

  it("105 Emerald Maiden — Ward; +X defense for the other Ward followers on your field", () => {
    const t = d({ me: { hand: ["BP02-105"], field: ["WARD", "WARD"], playPoints: 3 } }).play("BP02-105").none();
    expect(t.stats("BP02-105")).toEqual([3, 6]);
  });
});
