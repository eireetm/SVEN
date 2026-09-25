import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../src/testing";
import { cardEngine } from "../helpers";

// Engine behaviour added for BP06 that the card tests do not show directly. V1 is 1c 2/2, V3 3c
// 3/4, V5 5c 5/5; YOKAI0 is a 0/3 Yokai follower; WARD 2c 1/3 Ward; QUICK-SAC destroys a follower
// of yours (0).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const GINSETSU = { card: "BP06-073", evolvedInto: "BP06-074" };

describe("BP06 mechanics", () => {
  it("the damaged card's player orders the replacement effects when the order matters (CR 10.10.2)", () => {
    // Kasha's 1 damage: +1 (Ginsetsu) then -1 (Liza) = 1, or -1 first = 0 and the +1 has nothing
    // left to change (BP06-074 rulings).
    const spec = { me: { hand: ["BP06-080"], field: [GINSETSU] }, opp: { field: ["V5", "BP02-004"] } };
    const t = d(spec).play("BP06-080").pick("opp:V5");
    expect(t.decision?.type === "choose" ? [t.decision.player, t.decision.reason, t.decision.options.map((o) => o.label)] : null).toEqual([
      1,
      "damageOrder",
      ["Take 1 damage", "Take no damage"],
    ]);
    t.choose("Take no damage");
    expect(t.stats("opp:V5")).toEqual([5, 5]);
    const hit = d(spec).play("BP06-080").pick("opp:V5").choose("Take 1 damage");
    expect(hit.stats("opp:V5")).toEqual([5, 4]);
  });

  it("no choice when every order gives the same damage; +1 applies to attack damage too", () => {
    const t = d({ me: { field: [GINSETSU, "BP06-080"] }, opp: { field: [{ card: "V5", engaged: true }] } });
    t.attack("BP06-080", "opp:V5");
    expect([t.stats("opp:V5"), t.field()]).toEqual([[5, 1], ["BP06-073"]]);
  });

  it("damage of 0 is not dealt, so nothing adds to it (CR 1.3.2.2, BP06-074 ruling)", () => {
    const t = d({ me: { field: [GINSETSU, "YOKAI0"] }, opp: { field: [{ card: "V5", engaged: true }] } });
    t.attack("YOKAI0", "opp:leader");
    expect(t.leader("opp")).toBe(20);
  });

  it("'[process]: [effect]' in a spell is asked for while it resolves; the target is needed to play it (CR 10.4.7.5)", () => {
    const hunters = { me: { hand: ["BP06-017"], field: ["BP06-012", "BP06-012"] }, opp: { field: ["V5"] } };
    const yes = d(hunters).play("BP06-017").yes();
    expect([yes.stats("opp:V5"), yes.engaged("BP06-012")]).toEqual([[5, 1], true]);
    const no = d(hunters).play("BP06-017").no();
    expect([no.stats("opp:V5"), no.engaged("BP06-012")]).toEqual([[5, 5], false]);
    // Without 2 Hunter followers it is still played, doing nothing; without a target it is not.
    const none = d({ me: { hand: ["BP06-017"], field: ["BP06-012"] }, opp: { field: ["V5"] } }).play("BP06-017");
    expect([none.stats("opp:V5"), none.cemetery()]).toEqual([[5, 5], ["BP06-017"]]);
    expect(d({ me: { hand: ["BP06-017"], field: ["BP06-012", "BP06-012"] } }).canPlay("BP06-017")).toBe(false);
  });

  it("activated abilities valid in the EX area or the hand (CR 10.3.5); 'only from hand' (BP06-059)", () => {
    const ex = d({ me: { ex: ["BP06-059"], field: ["V3"], playPoints: 6 } });
    expect(ex.canPlay("BP06-059")).toBe(false);
    ex.activate("BP06-059");
    expect([ex.stats("V3"), ex.attackTargets("V3"), ex.cemetery(), ex.pp()]).toEqual([[7, 8], [], ["BP06-059"], 4]);
    const hand = d({ me: { hand: ["BP06-079"], deck: ["V1"], playPoints: 3 }, opp: { field: ["V5"] } });
    hand.activate("BP06-079");
    expect([hand.field("opp"), hand.cemetery(), hand.pp()]).toEqual([[], ["BP06-079", "V1"], 0]);
  });

  it("'can't be played during your turn': only in the opponent's turn (BP06-105)", () => {
    const own = d({ me: { hand: ["BP06-106"], deck: ["V1"] } });
    expect(own.canPlay("BP06-106")).toBe(false);
    // The opponent's turn: at their end phase quick window.
    const t = d({ me: { hand: ["BP06-106"], deck: ["V1"] }, opp: { deck: ["V1"] } }).end();
    t.end();
    expect(t.decision?.type === "quick" ? t.decision.actions.map((a) => a.type) : []).toEqual(["play", "pass"]);
    t.quick("BP06-106");
    expect([t.leader(), t.hand()]).toEqual([21, ["V1"]]);
  });

  it("a passive can lower a card's evolve cost, never below 0 (BP06-019)", () => {
    const t = d({ me: { field: ["BP06-019", "V1", "V1", "V1", "V1"], evolveDeck: ["BP06-020"], playPoints: 0 } });
    expect(t.canEvolve("BP06-019")).toBe(true);
    const two = d({ me: { field: ["BP06-019", "V1", "V1"], evolveDeck: ["BP06-020"], playPoints: 0 } });
    expect(two.canEvolve("BP06-019")).toBe(false);
  });

  it("'can't be banished by abilities' (BP06-022); what else the effect does still happens", () => {
    const t = d({ me: { hand: ["BP06-112"], field: ["BP06-022"], deck: ["V1"] } }).play("BP06-112");
    expect([t.field(), t.leader(), t.hand()]).toEqual([["BP06-022"], 22, ["V1"]]);
  });

  it("'doesn't refresh during its controller's next start phase' — once (BP06-056)", () => {
    const t = d({ me: { hand: ["BP06-056"], deck: ["V1", "V1"] }, opp: { field: ["V5"], deck: ["V1", "V1"] } }).play("BP06-056").flush();
    expect(t.engaged("opp:V5")).toBe(true);
    t.end().end();
    expect(t.engaged("opp:V5")).toBe(true); // still engaged after the opponent's start phase
    t.end().end();
    expect(t.engaged("opp:V5")).toBe(false);
  });

  it("while Colosseum on High is on the field, a follower that can attack a follower can't attack leaders", () => {
    const t = d({ me: { field: ["V3", "BP06-113"] }, opp: { field: [{ card: "V1", engaged: true }] } });
    expect(t.attackTargets("V3")).toEqual(["V1"]);
    const reserved = d({ me: { field: ["V3", "BP06-113"] }, opp: { field: ["V1"] } });
    expect(reserved.attackTargets("V3")).toEqual(["opp:leader"]);
  });

  it("a card leaving the field records its keywords for look-back (BP06-090, CR 10.7.4.1.2)", () => {
    const t = d({ me: { field: ["BP06-090", "WARD"], hand: ["QUICK-SAC", "QUICK-SAC"] } });
    t.play("QUICK-SAC").pick("WARD");
    expect(t.leader("opp")).toBe(19);
    t.play("QUICK-SAC");
    expect(t.leader("opp")).toBe(18); // Wilbert itself
  });

  it("a given 'once per turn' Strike (BP06-018 with 7 faceup evolved followers)", () => {
    const faceUp = Array<string>(7).fill("BP06-002");
    const t = d({
      me: { hand: ["BP06-018"], faceUpEvolveDeck: faceUp },
      opp: { field: [{ card: "V1", engaged: true }, { card: "V1", engaged: true }] },
    }).play("BP06-018");
    expect([t.stats("BP06-018"), t.keywords("BP06-018")]).toEqual([[8, 8], ["rush", "assail"]]);
    t.attack("BP06-018", "opp:V1");
    expect(t.engaged("BP06-018")).toBe(false);
    t.attack("BP06-018", "opp:V1");
    expect(t.engaged("BP06-018")).toBe(true);
  });

  it("dice use the game's seeded random source (CR 5.20)", () => {
    const roll = (seed: string) => {
      const t = d({ seed, me: { hand: ["BP06-110"], deck: ["V1", "V1", "V1"], playPoints: 6 }, opp: { hand: ["V1", "V1"], deck: ["V1", "V1"] } });
      t.play("BP06-110");
      return t.events.filter((e) => e.type === "dieRolled").map((e) => (e.type === "dieRolled" ? [e.player, e.result] : null));
    };
    expect(roll("a")).toEqual(roll("a"));
    expect(roll("a").map((r) => r![0])).toEqual([0, 1]);
  });
});
