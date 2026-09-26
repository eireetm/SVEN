import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP19 Abysscraft (074–091). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); QUICK-SAC (0) destroys one of your followers.
// Condemned followers: BP19-030 (1, Fanfare: a Dread Pirate's Flag into the EX area), BP19-064 (2), BP19-066 (1), BP19-082
// (2). BP17-085 Rouge Vampire (1, Fanfare: 1 damage to your leader); BP18-094 Prince Catacomb (4, Fanfare: a 1-cost follower
// from the cemetery); BP14-072 Paracelise (3).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id = "V1") => Array<string>(count).fill(id);

describe("BP19 Abysscraft", () => {
  it("074 Istyndet, Soul Convict — once per your turn, with 10 cards in the cemetery, another small Condemned follower going there comes back without its Fanfare; act, engage and bury a Condemned follower: destroy", () => {
    const t = d({ me: { field: ["BP19-074", "BP19-030"], cemetery: n(10), hand: ["QUICK-SAC", "QUICK-SAC"] } }).play("QUICK-SAC").pick("BP19-030").flush();
    expect([t.field(), t.ex()]).toEqual([["BP19-074", "BP19-030"], []]);
    t.play("QUICK-SAC").pick("BP19-030").flush();
    expect(t.field()).toEqual(["BP19-074"]);
    const nine = d({ me: { field: ["BP19-074", "BP19-030"], cemetery: n(9), hand: ["QUICK-SAC"] } }).play("QUICK-SAC").pick("BP19-030").flush();
    expect(nine.field()).toEqual(["BP19-074"]);
    const act = d({ me: { field: ["BP19-074", "BP19-030"] }, opp: { field: ["V5"] } }).activate("BP19-074");
    expect([act.field("opp"), act.cemetery()]).toEqual([[], ["BP19-030"]]);
  });

  it("075 / 076 Garodeth, Insurgent Convict — Fanfare: 1 to your leader; the 4th loss of defense on your turn: evolve; evolved: Storm, 8 damage", () => {
    const t = d({ me: { field: ["BP19-075"], evolveDeck: ["BP19-076"], hand: n(4, "BP17-085"), playPoints: 4 }, opp: { field: ["V5"] } });
    t.play("BP17-085").play("BP17-085").play("BP17-085").play("BP17-085").yes();
    expect([t.field("opp"), t.keywords("BP19-075"), t.leader()]).toEqual([[], ["storm"], 16]);
    expect(d({ me: { hand: ["BP19-075"], playPoints: 3 } }).play("BP19-075").leader()).toBe(19);
  });

  it("077 Zeronua, Demon of Domination — Fanfare: with 2 or less in hand a Paracelise into the EX area, 3 less with an empty hand; act (1) in the hand, into the EX area: leader +1", () => {
    const t = d({ me: { hand: ["BP19-077"], deck: ["V1", "BP14-072"], playPoints: 2 } }).play("BP19-077").pick("BP14-072");
    expect([t.ex(), t.pp(), t.canPlay("BP14-072@ex")]).toEqual([["BP14-072"], 0, true]);
    const three = d({ me: { hand: ["BP19-077", "V1", "V1", "V1"], deck: ["BP14-072"], playPoints: 2 } }).play("BP19-077");
    expect(three.ex()).toEqual([]);
    const act = d({ me: { hand: ["BP19-077"], playPoints: 1 } }).activate("BP19-077@hand");
    expect([act.ex(), act.leader()]).toEqual([["BP19-077"], 21]);
  });

  it("078 / 079 Abyssal Colonel — Necrocharge (10): Storm (evolved: and Ward); Last Words: 3 damage; evolved: leader +2", () => {
    expect(d({ me: { field: ["BP19-078"], cemetery: n(10) } }).keywords("BP19-078")).toEqual(["storm"]);
    expect(d({ me: { field: ["BP19-078"], cemetery: n(9) } }).keywords("BP19-078")).toEqual([]);
    expect(d({ me: { field: [{ card: "BP19-078", evolvedInto: "BP19-079" }], cemetery: n(10) } }).keywords("BP19-078")).toEqual(["storm", "ward"]);
    expect(d({ me: { field: ["BP19-078"], hand: ["QUICK-SAC"] }, opp: { field: ["V5"] } }).play("QUICK-SAC").stats("opp:V5")).toEqual([5, 2]);
    expect(d({ me: { field: ["BP19-078"], evolveDeck: ["BP19-079"], playPoints: 1 } }).evolve("BP19-078").leader()).toBe(22);
  });

  it("080 Myroel, Death Enforcer — a follower put onto your field from the cemetery: 1 to each enemy follower; act, engage: a 5-cost and a 3-cost Condemned follower from the cemetery", () => {
    const t = d({ me: { field: ["BP19-080"], hand: ["BP18-094"], cemetery: ["V1"], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP18-094").flush();
    expect([t.field(), t.stats("opp:V5")]).toEqual([["BP19-080", "BP18-094", "V1"], [5, 4]]);
    const act = d({ me: { field: ["BP19-080"], cemetery: ["BP19-064", "BP19-066"] }, opp: { field: ["V5"] } }).activate("BP19-080").pick("BP19-064").pick("BP19-066").flush();
    expect([act.field(), act.stats("opp:V5")]).toEqual([["BP19-080", "BP19-064", "BP19-066"], [5, 3]]);
  });

  it("081 Genomuel, Wyrm Enforcer — end phase: -3/-3 to each enemy follower, 3 to the enemy leader", () => {
    const t = d({ me: { field: ["BP19-081"] }, opp: { field: ["V5"], deck: ["V1"] } }).end();
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[2, 2], 17]);
  });

  it("082 / 083 Underworld Lieutenant — Evolve (0) once summoned from the cemetery; Last Words: bury the top card; evolved: 2 damage", () => {
    const t = d({ me: { field: ["BP19-080"], cemetery: ["BP19-082"], evolveDeck: ["BP19-083"], playPoints: 0 } }).activate("BP19-080").pick("BP19-082").flush();
    expect(t.canEvolve("BP19-082")).toBe(true);
    expect(d({ me: { field: ["BP19-082"], evolveDeck: ["BP19-083"], playPoints: 0 } }).canEvolve("BP19-082")).toBe(false);
    expect(d({ me: { field: ["BP19-082"], hand: ["QUICK-SAC"], deck: ["V1"] } }).play("QUICK-SAC").cemetery()).toEqual(["BP19-082", "QUICK-SAC", "V1"]);
    expect(d({ me: { field: ["BP19-082"], evolveDeck: ["BP19-083"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP19-082").stats("opp:V5")).toEqual([5, 3]);
  });

  it("084 Warden of Corpses — Ward; Fanfare: draw, leader +4 with a Myroel", () => {
    const t = d({ me: { hand: ["BP19-084"], field: ["BP19-080"], deck: ["V1"], playPoints: 3 } }).play("BP19-084").none();
    expect([t.hand(), t.leader()]).toEqual([["V1"], 24]);
  });

  it("085 Raging Commander — your Garodeths cost 1 less; 4 times per your turn, your leader losing defense: 1 damage; Fanfare: 1 to your leader, draw", () => {
    expect(d({ me: { hand: ["BP19-075"], field: ["BP19-085"], playPoints: 2 } }).canPlay("BP19-075")).toBe(true);
    const t = d({ me: { field: ["BP19-085"], hand: [...n(4, "BP17-085"), "BP19-090"], deck: ["V1"], playPoints: 5 }, opp: { field: ["V5"] } });
    for (let i = 0; i < 4; i++) t.play("BP17-085");
    t.play("BP19-090").choose("draw").yes();
    expect([t.stats("opp:V5"), t.leader()]).toEqual([[5, 1], 15]);
  });

  it("086 / 087 Vicious Blitzer — Fanfare: 1 to your leader, evolve with a Garodeth; evolved: 1 to each leader", () => {
    const t = d({ me: { field: ["BP19-075"], hand: ["BP19-086"], evolveDeck: ["BP19-087"], playPoints: 1 } }).play("BP19-086").flush().yes().flush();
    expect([t.leader(), t.leader("opp")]).toEqual([18, 19]);
  });

  it("088 Fallen Sergeant — Last Words: Necrocharge (10) 2 damage, or bury the top card", () => {
    const t = d({ me: { field: ["BP19-088"], hand: ["QUICK-SAC"], cemetery: n(8) }, opp: { field: ["V5"] } }).play("QUICK-SAC").choose("damage");
    expect(t.stats("opp:V5")).toEqual([5, 3]);
    const mill = d({ me: { field: ["BP19-088"], hand: ["QUICK-SAC"], deck: ["V3"] }, opp: { field: ["V5"] } }).play("QUICK-SAC").choose("mill");
    expect(mill.cemetery()).toEqual(["BP19-088", "QUICK-SAC", "V3"]);
  });

  it("089 Steamrolling Tank — Ward; 4 times per your turn, your leader losing defense: leader +1; Fanfare: 1 to your leader", () => {
    expect(d({ me: { hand: ["BP19-089"], playPoints: 1 } }).play("BP19-089").none().leader()).toBe(20);
  });

  it("090 Howling Scream — up to 2 of (1): 2 damage and 1 to your leader, (1): 1 to your leader and draw", () => {
    const t = d({ me: { hand: ["BP19-090"], deck: ["V1"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP19-090").choose("damage", "draw").yes().yes();
    expect([t.stats("opp:V5"), t.leader(), t.hand(), t.pp()]).toEqual([[5, 3], 18, ["V1"], 0]);
    const unpaid = d({ me: { hand: ["BP19-090"], deck: ["V1"], playPoints: 0 }, opp: { field: ["V5"] } }).play("BP19-090").choose("draw");
    expect([unpaid.hand(), unpaid.leader()]).toEqual([[], 20]);
  });

  it("091 Prison of Pain — Fanfare: 2 pain counters, draw; act, engage and remove one: 1 to your leader, buried with none left", () => {
    const t = d({ me: { hand: ["BP19-091"], deck: ["V1"], playPoints: 2 } }).play("BP19-091");
    expect([t.counters("BP19-091", "pain"), t.hand()]).toEqual([2, ["V1"]]);
    const act = d({ me: { field: [{ card: "BP19-091", counters: { pain: 1 } }] } }).activate("BP19-091");
    expect([act.leader(), act.field()]).toEqual([19, []]);
  });
});
