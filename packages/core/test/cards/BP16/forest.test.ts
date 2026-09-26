import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP16 Forestcraft (001–018). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); QUICK-SAC (0) destroys one of your
// followers. Festive: BP14-001 Hozumi (3), BP14-008 Elven Waitress (2), BP14-012 Karakuri Servant (2, Fanfare: a
// Puppet into the EX area). BP15-110 Caladrius buries an amulet. Tokens: BP01-T03 Fairy, BP05-T03 Puppet (Rush),
// BP08-T01 Lloyd. Super-evolution: 8 turns passed and a super-evolution point.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const FAIRY = "BP01-T03";
const PUPPET = "BP05-T03";
const LLOYD = "BP08-T01";
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };

describe("BP16 Forestcraft", () => {
  it("001 / 002 Aria, Lady of the Woods — Fanfare: 2 Fairies into the EX area; evolved: a Fairy; super-evolved: +1/+1 to your Pixie token followers on the field and in the EX area", () => {
    expect(d({ me: { hand: ["BP16-001"], playPoints: 1 } }).play("BP16-001").ex()).toEqual([FAIRY, FAIRY]);
    expect(d({ me: { field: ["BP16-001"], evolveDeck: ["BP16-002"], playPoints: 1 } }).evolve("BP16-001").field()).toEqual(["BP16-001", FAIRY]);
    const t = d({ me: { field: ["BP16-001", FAIRY], ex: [FAIRY, "V1"], evolveDeck: ["BP16-002"], playPoints: 1, ...SUPER } });
    t.evolve("BP16-001", { sep: true }).flush();
    expect([t.field(), t.ids(FAIRY).map((id) => t.game.reader().info(id).attack), t.stats("V1@ex")]).toEqual([["BP16-001", FAIRY, FAIRY], [2, 2, 2], [2, 2]]);
  });

  it("003 Orchis, Newfound Heart — Fanfare, banish 2 Puppets from the EX area: a Lloyd; act, engage, with 3 Puppetry cards in the cemetery: +1/+1, Storm and Bane to a Puppet", () => {
    expect(d({ me: { hand: ["BP16-003"], ex: [PUPPET, PUPPET], playPoints: 2 } }).play("BP16-003").yes().ex()).toEqual([LLOYD]);
    const t = d({ me: { field: ["BP16-003", PUPPET], cemetery: ["BP16-003", "BP16-008", "BP14-012"] } }).activate("BP16-003");
    expect([t.stats(PUPPET), t.keywords(PUPPET), t.engaged("BP16-003")]).toEqual([[2, 2], ["rush", "storm", "bane"], true]);
    expect(d({ me: { field: ["BP16-003", PUPPET], cemetery: ["BP16-003", "BP16-008"] } }).canActivate("BP16-003")).toBe(false);
  });

  it("004 Nazuri, Bestial Innkeeper — Fanfare: with 3 Festive cards on the field and in the EX area, another Festive follower (3 or less) from the deck", () => {
    const t = d({ me: { hand: ["BP16-004"], field: ["BP14-008"], ex: ["BP14-001"], deck: ["V1", "BP14-012"], playPoints: 3 } }).play("BP16-004").pick("BP14-012");
    expect([t.field(), t.ex()]).toEqual([["BP14-008", "BP16-004", "BP14-012"], ["BP14-001", PUPPET]]);
    expect(d({ me: { hand: ["BP16-004"], field: ["BP14-008"], deck: ["V1", "BP14-012"], playPoints: 3 } }).play("BP16-004").field()).toEqual(["BP14-008", "BP16-004"]);
  });

  it("005 / 006 Glade, Fragrantwood Ward — evolved: draw and 2 Fairies; super-evolved: cards on your field and in your hand in damage, divided", () => {
    const t = d({ me: { field: ["BP16-005"], evolveDeck: ["BP16-006"], deck: ["V1"], playPoints: 1 } }).evolve("BP16-005");
    expect([t.hand(), t.field()]).toEqual([["V1"], ["BP16-005", FAIRY, FAIRY]]);
    // On Evolve first: 3 cards on the field and 3 in the hand, so 6 damage.
    const s = d({ me: { field: ["BP16-005"], hand: ["V1", "V1"], evolveDeck: ["BP16-006"], deck: ["V3"], playPoints: 1, ...SUPER }, opp: { field: ["V5", "V3"] } });
    s.evolve("BP16-005", { sep: true }).pending().pick("opp:V5", "opp:V3").choose("5");
    expect([s.field("opp"), s.stats("opp:V3")]).toEqual([["V3"], [3, 3]]);
  });

  it("007 Lily, Crystallian Innocence — Fanfare: an enemy follower's attack and defense become 1", () => {
    expect(d({ me: { hand: ["BP16-007"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP16-007").stats("opp:V5")).toEqual([1, 1]);
  });

  it("008 Liam, Crazed Creator — Fanfare: 2 Puppets; act, engage: a Puppetry card (3 or less) from the top 5 into the EX area, 3 less this turn", () => {
    expect(d({ me: { hand: ["BP16-008"], playPoints: 4 } }).play("BP16-008").field()).toEqual(["BP16-008", PUPPET, PUPPET]);
    const t = d({ me: { field: ["BP16-008"], deck: ["V1", "BP16-003", "V3", "V5", "V1"], playPoints: 0 } }).activate("BP16-008").pick("BP16-003").order();
    expect([t.ex(), t.canPlay("BP16-003@ex")]).toEqual([["BP16-003"], true]);
  });

  it("009 / 010 Aerin, Crystalian Frostward — Ward; Fanfare: an enemy follower can't attack during its controller's next turn; evolved: a Crystalian follower (2 or less) into the EX area, 2 less this turn", () => {
    const t = d({ me: { hand: ["BP16-009"], playPoints: 3 }, opp: { field: ["V5"], deck: ["V1"] } }).play("BP16-009").none();
    expect(t.keywords("BP16-009")).toEqual(["ward"]);
    t.end().none();
    expect(t.attackTargets("opp:V5")).toEqual([]);
    const evo = d({ me: { field: ["BP16-009"], evolveDeck: ["BP16-010"], deck: ["V1", "BP16-007"], playPoints: 1 } }).evolve("BP16-009").pick("BP16-007");
    expect([evo.ex(), evo.canPlay("BP16-007@ex")]).toEqual([["BP16-007"], true]);
  });

  it("011 Bayle, Luxglaive Warrior — only after a follower of yours left the field this turn; Fanfare: 4 damage", () => {
    const t = d({ me: { hand: ["BP16-011", "QUICK-SAC"], field: ["V1"], playPoints: 3 }, opp: { field: ["V5"] } });
    expect(t.canPlay("BP16-011")).toBe(false);
    t.play("QUICK-SAC").play("BP16-011");
    expect(t.stats("opp:V5")).toEqual([5, 1]);
  });

  it("012 Godwood Staff — leaving the field: leader +1, recover 1", () => {
    const t = d({ me: { hand: ["BP15-110"], field: ["BP16-012"], playPoints: 6 } }).play("BP15-110").yes();
    expect([t.leader(), t.pp()]).toEqual([21, 1]);
  });

  it("013 / 014 Fairy Tamer — Fanfare: a Fairy; evolved: +1/+1 to up to 2 other Pixie followers on your field and in your EX area", () => {
    expect(d({ me: { hand: ["BP16-013"], playPoints: 2 } }).play("BP16-013").field()).toEqual(["BP16-013", FAIRY]);
    const t = d({ me: { field: ["BP16-013", FAIRY], ex: [FAIRY], evolveDeck: ["BP16-014"], playPoints: 1 } }).evolve("BP16-013").pick(`${FAIRY}@field`, `${FAIRY}@ex`);
    expect([t.stats(`${FAIRY}@field`), t.stats(`${FAIRY}@ex`), t.stats("BP16-013")]).toEqual([[2, 2], [2, 2], [2, 2]]);
  });

  it("015 Good Fairy of the Pond — Fanfare / Last Words: a Fairy into the EX area", () => {
    expect(d({ me: { hand: ["BP16-015"], playPoints: 1 } }).play("BP16-015").ex()).toEqual([FAIRY]);
    expect(d({ me: { field: ["BP16-015"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").ex()).toEqual([FAIRY]);
  });

  it("016 Fay Twinkletoes — Fanfare: +1/+1 to your other Forestcraft followers", () => {
    const t = d({ me: { hand: ["BP16-016"], field: ["BP16-013", "V1"], playPoints: 3 } }).play("BP16-016");
    expect([t.stats("BP16-013"), t.stats("V1"), t.stats("BP16-016")]).toEqual([[2, 2], [2, 2], [2, 2]]);
  });

  it("017 Baby Carbuncle — Fanfare, return another Beast card on your field: draw", () => {
    const t = d({ me: { hand: ["BP16-017"], field: ["BP16-011"], deck: ["V1"], playPoints: 1 } }).play("BP16-017").yes();
    expect([t.hand(), t.field()]).toEqual([["BP16-011", "V1"], ["BP16-017"]]);
  });

  it("018 Fragrantwood Whispers — leader +2 or draw; both if a follower of yours evolved this turn", () => {
    expect(d({ me: { hand: ["BP16-018"], playPoints: 1 } }).play("BP16-018").choose("leader").leader()).toBe(22);
    const t = d({ me: { hand: ["BP16-018"], field: ["BP16-005"], evolveDeck: ["BP16-006"], deck: ["V1", "V3", "V5"], playPoints: 2 } }).evolve("BP16-005");
    t.play("BP16-018").choose("leader", "draw");
    expect([t.leader(), t.hand()]).toEqual([22, ["V1", "V3"]]);
  });
});
