import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP15 Abysscraft (076–093, PR14, PR15, T04). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral); QUICK-SAC (0)
// destroys one of your followers. Sanguine: your leader lost defense during your turn. Tokens: BP15-PR14 Wings of
// Desire, BP15-PR15 Scream Diffusion, BP15-T04 Rulenye, Echoing Scream, BP06-T03 One-Tailed Fox (Rush, Ward).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const WINGS = "BP15-PR14";
const DIFFUSION = "BP15-PR15";
const ECHO = "BP15-T04";
const FOX = "BP06-T03";
const n = (count: number, id = "V1") => Array<string>(count).fill(id);

describe("BP15 Abysscraft", () => {
  it("076 / 077 Valnareik, Lustful Desire — Storm with Sanguine; Fanfare: +2/+2 at 7 leader defense; evolved: a Wings of Desire or draw", () => {
    const t = d({ me: { field: ["BP15-076"], hand: ["BP15-086"], playPoints: 1 } });
    expect(t.keywords("BP15-076")).toEqual([]);
    expect(t.play("BP15-086").keywords("BP15-076")).toEqual(["storm"]);
    expect(d({ me: { hand: ["BP15-076"], leaderDefense: 7, playPoints: 2 } }).play("BP15-076").stats("BP15-076")).toEqual([4, 4]);
    expect(d({ me: { hand: ["BP15-076"], leaderDefense: 8, playPoints: 2 } }).play("BP15-076").stats("BP15-076")).toEqual([2, 2]);
    const spec: DriveSpec = { me: { field: ["BP15-076"], evolveDeck: ["BP15-077"], deck: ["V1"], playPoints: 1 } };
    expect(d(spec).evolve("BP15-076").choose("wings").ex()).toEqual([WINGS]);
    expect(d(spec).evolve("BP15-076").choose("draw").hand()).toEqual(["V1"]);
  });

  it("078 Rulenye, Screaming Silence — Rush, Assail; Fanfare: destroy and 3 to its leader with 3 Rulenye, Echoing Scream; Last Words: a Scream Diffusion, bury the top card", () => {
    const t = d({ me: { hand: ["BP15-078"], field: n(3, ECHO), playPoints: 2 }, opp: { field: ["V5"] } }).play("BP15-078");
    expect([t.field("opp"), t.leader("opp"), t.keywords("BP15-078")]).toEqual([[], 17, ["rush", "assail"]]);
    const two = d({ me: { hand: ["BP15-078"], field: n(2, ECHO), playPoints: 2 }, opp: { field: ["V5"] } }).play("BP15-078");
    expect([two.field("opp"), two.leader("opp")]).toEqual([["V5"], 20]);
    const lw = d({ me: { field: ["BP15-078"], hand: ["QUICK-SAC"], deck: ["V1"] } }).play("QUICK-SAC");
    expect([lw.ex(), lw.cemetery()]).toEqual([[DIFFUSION], ["BP15-078", "QUICK-SAC", "V1"]]);
  });

  it("079 Ginsetsu, Terror Banquet — Fanfare: 2 One-Tailed Foxes; Fanfare (2): one more and +1 attack to your other Yokai followers; another Yokai follower leaving: 1 to an enemy follower and its leader", () => {
    const t = d({ me: { hand: ["BP15-079"], playPoints: 6 } }).play("BP15-079").pending().none().yes().none();
    expect([t.field(), t.stats(FOX), t.pp()]).toEqual([["BP15-079", FOX, FOX, FOX], [2, 3], 0]);
    const leave = d({ me: { field: ["BP15-079", FOX], hand: ["QUICK-SAC"] }, opp: { field: ["V5"] } }).play("QUICK-SAC").pick(FOX);
    expect([leave.stats("opp:V5"), leave.leader("opp")]).toEqual([[5, 4], 19]);
  });

  it("080 / 081 Yuzuki, Bloodlord — Fanfare: destroy with ten 2-cost cards in the cemetery; evolved: a 2-cost card from the top 2 into the EX area, 2 less this turn", () => {
    expect(d({ me: { hand: ["BP15-080"], cemetery: n(10, "V2"), playPoints: 2 }, opp: { field: ["V5"] } }).play("BP15-080").field("opp")).toEqual([]);
    expect(d({ me: { hand: ["BP15-080"], cemetery: n(9, "V2"), playPoints: 2 }, opp: { field: ["V5"] } }).play("BP15-080").field("opp")).toEqual(["V5"]);
    const evo = d({ me: { field: ["BP15-080"], evolveDeck: ["BP15-081"], deck: ["V2", "V1"], playPoints: 1 } }).evolve("BP15-080").pick("V2");
    expect([evo.ex(), evo.canPlay("V2@ex")]).toEqual([["V2"], true]);
  });

  it("082 Spiteful Screams — 1 less with Necrocharge (10); an Abysscraft follower with Last Words (2 or less) from the cemetery", () => {
    const t = d({ me: { hand: ["BP15-082"], cemetery: ["BP15-088", ...n(9)], playPoints: 1 } }).play("BP15-082");
    expect(t.field()).toEqual(["BP15-088"]);
    expect(d({ me: { hand: ["BP15-082"], cemetery: ["BP15-088", ...n(8)], playPoints: 1 } }).canPlay("BP15-082")).toBe(false);
  });

  it("083 A Hellish Banquet — bury 2 One-Tailed Foxes: destroy and draw; from the cemetery, banish it: your One-Tailed Foxes get Storm", () => {
    const t = d({ me: { hand: ["BP15-083"], field: [FOX, FOX], deck: ["V1"], playPoints: 0 }, opp: { field: ["V5"] } }).play("BP15-083");
    expect([t.field(), t.field("opp"), t.hand(), t.cemetery()]).toEqual([[], [], ["V1"], ["BP15-083"]]);
    expect(d({ me: { hand: ["BP15-083"], field: [FOX], playPoints: 0 }, opp: { field: ["V5"] } }).canPlay("BP15-083")).toBe(false);
    const act = d({ me: { cemetery: ["BP15-083"], field: [FOX] } }).activate("BP15-083");
    expect([act.keywords(FOX), act.zone("me", "banished")]).toEqual([["rush", "ward", "storm"], ["BP15-083"]]);
  });

  it("084 / 085 Adherent of Desire — Fanfare: 1 to your leader, evolves with a Valnareik follower on your field; evolved: Drain to an Omen Demon follower", () => {
    const t = d({ me: { field: ["BP15-076"], hand: ["BP15-084"], evolveDeck: ["BP15-085"], playPoints: 1 } }).play("BP15-084").yes().pick("BP15-076");
    expect([t.leader(), t.stats("BP15-084"), t.keywords("BP15-076")]).toEqual([19, [2, 2], ["drain", "storm"]]);
    const alone = d({ me: { hand: ["BP15-084"], evolveDeck: ["BP15-085"], playPoints: 1 } }).play("BP15-084");
    expect([alone.leader(), alone.stats("BP15-084")]).toEqual([19, [1, 1]]);
  });

  it("086 Loathing Desire — 1 to your leader; an Omen Demon card from the top 4, leader +2 for a Valnareik follower", () => {
    const t = d({ me: { hand: ["BP15-086"], deck: ["V1", "BP15-076", "V3", "V5"], playPoints: 1 } }).play("BP15-086").pick("BP15-076").order();
    expect([t.hand(), t.leader()]).toEqual([["BP15-076"], 21]);
    const other = d({ me: { hand: ["BP15-086"], deck: ["V1", "BP15-084", "V3"], playPoints: 1 } }).play("BP15-086").pick("BP15-084").order();
    expect([other.hand(), other.leader()]).toEqual([["BP15-084"], 19]);
  });

  it("087 Crimson Virtue — 1 less with a Yuzuki follower, 1 less for engaging two 2-cost followers; 4 damage", () => {
    const t = d({ me: { hand: ["BP15-087"], field: ["BP15-080", "V2"], playPoints: 0 }, opp: { field: ["V5"] } }).play("BP15-087");
    expect([t.stats("opp:V5"), t.engaged("BP15-080"), t.engaged("V2")]).toEqual([[5, 1], true, true]);
    expect(d({ me: { hand: ["BP15-087"], field: ["BP15-080", "V1"], playPoints: 0 }, opp: { field: ["V5"] } }).canPlay("BP15-087")).toBe(false);
  });

  it("088 / 089 Adherent of Screams — Last Words: bury the top card; evolved: a Rulenye follower from the cemetery, or 2 damage", () => {
    expect(d({ me: { field: ["BP15-088"], hand: ["QUICK-SAC"], deck: ["V1"] } }).play("QUICK-SAC").cemetery()).toEqual(["BP15-088", "QUICK-SAC", "V1"]);
    const evo = d({ me: { field: ["BP15-088"], evolveDeck: ["BP15-089"], cemetery: ["BP15-078"], playPoints: 1 } }).evolve("BP15-088");
    expect(evo.field()).toEqual(["BP15-088", "BP15-078"]);
    const dmg = d({ me: { field: ["BP15-088"], evolveDeck: ["BP15-089"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP15-088");
    expect(dmg.stats("opp:V5")).toEqual([5, 3]);
  });

  it("090 Hermit of Lust — Fanfare, leader -1: Intimidate; act once per turn, leader -1: +1 attack", () => {
    const t = d({ me: { hand: ["BP15-090"], playPoints: 2 } }).play("BP15-090").yes();
    expect([t.keywords("BP15-090"), t.leader()]).toEqual([["intimidate"], 19]);
    const act = d({ me: { field: ["BP15-090"] } }).activate("BP15-090");
    expect([act.stats("BP15-090"), act.leader(), act.canActivate("BP15-090")]).toEqual([[2, 3], 19, false]);
  });

  it("091 Hermit of Silence — Fanfare: destroy an enemy follower, its controller discards at random", () => {
    const t = d({ me: { hand: ["BP15-091"], playPoints: 6 }, opp: { field: ["V5"], hand: ["V1"] } }).play("BP15-091");
    expect([t.field("opp"), t.hand("opp"), t.cemetery("opp")]).toEqual([[], [], ["V5", "V1"]]);
  });

  it("092 Krampus — Fanfare, bury another follower: destroy, leader +1, bury 2, draw", () => {
    const t = d({ me: { hand: ["BP15-092"], field: ["V1"], deck: ["V2", "V3", "V5"], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP15-092").yes();
    expect([t.field(), t.field("opp"), t.leader(), t.cemetery(), t.hand()]).toEqual([["BP15-092"], [], 21, ["V1", "V2", "V3"], ["V5"]]);
  });

  it("093 Astral Projection — Quick; destroy, bury 2", () => {
    const t = d({ me: { hand: ["BP15-093"], deck: ["V1", "V2"], playPoints: 4 }, opp: { field: ["V5"] } });
    expect(t.keywords("BP15-093")).toEqual(["quick"]);
    expect([t.play("BP15-093").field("opp"), t.cemetery()]).toEqual([[], ["V1", "V2", "BP15-093"]]);
  });

  it("PR14 Wings of Desire — your follower's Strike deals the times your leader lost defense this turn; 1 to your leader", () => {
    const t = d({ me: { ex: [WINGS], field: ["V1"], playPoints: 1 }, opp: { field: ["V5", "V3"] } }).play(`${WINGS}@ex`);
    expect(t.leader()).toBe(19);
    t.attack("V1", "opp:leader");
    expect([t.stats("opp:V5"), t.stats("opp:V3"), t.leader("opp")]).toEqual([[5, 4], [3, 3], 18]);
  });

  it("PR15 Scream Diffusion / T04 Rulenye, Echoing Scream — a token (Rush, Assail) for every 5 cards in the cemetery", () => {
    const t = d({ me: { ex: [DIFFUSION], cemetery: n(14), playPoints: 2 } }).play(`${DIFFUSION}@ex`);
    expect([t.field(), t.keywords(ECHO)]).toEqual([[ECHO, ECHO], ["rush", "assail"]]);
  });
});
