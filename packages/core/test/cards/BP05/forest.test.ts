import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP05 Forestcraft (001–017). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5. BP05-004 is a Hunter card
// (狩人); BP01-T03 Fairy is a Pixie (妖精) token; BP05-T03 is the Puppet token.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const HUNTERS = ["BP05-004", "BP05-004", "BP05-004"];

describe("BP05 Forestcraft", () => {
  it("001 / 002 Izudia — with 3 Hunter cards an enemy follower becomes an amulet; evolved: 6 to a leader with 10+", () => {
    const t = d({ me: { hand: ["BP05-001"], cemetery: HUNTERS, playPoints: 5 }, opp: { field: ["V5"] } }).play("BP05-001");
    expect([t.game.reader().info(t.id("opp:V5")).type, t.game.reader().followers(1)]).toEqual(["amulet", []]);
    const few = d({ me: { hand: ["BP05-001"], cemetery: HUNTERS.slice(1), playPoints: 5 }, opp: { field: ["V5"] } });
    few.play("BP05-001");
    expect(few.game.reader().info(few.id("opp:V5")).type).toBe("follower");
    const evo = d({ me: { field: [{ card: "BP05-001", evolvedInto: "BP05-002" }] } }).activate("BP05-001");
    expect(evo.leader("opp")).toBe(14);
    const low = d({ me: { field: [{ card: "BP05-001", evolvedInto: "BP05-002" }] }, opp: { leaderDefense: 9 } });
    low.activate("BP05-001");
    expect(low.leader("opp")).toBe(9);
  });

  it("003 Spinaria — Ward; up to one Forestcraft follower and one Forestcraft spell from the top 4; Combo (3): recover 3", () => {
    const deck = ["BP05-004", "BP05-007", "BP05-021", "BP05-011", "V1"];
    const t = d({ me: { hand: ["V1", "V1", "BP05-003"], deck, playPoints: 7 } });
    t.play("V1").play("V1").play("BP05-003").none().pick("BP05-004").pick("BP05-011").order();
    expect([t.hand(), t.pp(), t.zone("me", "deck")]).toEqual([["BP05-004", "BP05-011"], 3, ["V1", "BP05-007", "BP05-021"]]);
    const noCombo = d({ me: { hand: ["BP05-003"], deck, playPoints: 5 } }).play("BP05-003").none().none().none().order();
    expect([noCombo.hand(), noCombo.pp()]).toEqual([[], 0]);
  });

  it("004 / 005 Apostle of Unkilling — evolved: a Hunter follower costing 2 or less from the deck onto the field", () => {
    const t = d({ me: { field: ["BP05-004"], evolveDeck: ["BP05-005"], deck: ["BP05-012", "BP05-008", "BP05-004"], playPoints: 1 } });
    t.evolve("BP05-004");
    expect(t.decision?.type === "selectCards" ? t.decision.candidateDefs : []).toEqual(["BP05-012", "BP05-008"]);
    t.pick("BP05-012");
    expect(t.field()).toEqual(["BP05-004", "BP05-012"]);
  });

  it("006 Morton — at your end phase the opponent picks a restriction for their next turn", () => {
    const t = d({ me: { field: ["BP05-006"] }, opp: { deck: ["V1", "V1"], maxPlayPoints: 2 } }).end();
    expect(t.decision?.type === "choose" ? [t.decision.player, t.decision.options.length] : null).toEqual([1, 3]);
    t.choose("noStartPhaseMaxPlayPoints");
    expect([t.hand("opp"), t.game.state.players[1].maxPlayPoints]).toEqual([["V1"], 2]);
  });

  it("007 Fairy Torrent — Quick; up to 2 Pixie followers into the EX area; leader +2 if any", () => {
    const t = d({ me: { hand: ["BP05-007"], field: ["BP01-T03", "BP01-T03", "V1"] } }).play("BP05-007").pick("BP01-T03", "BP01-T03");
    expect([t.ex(), t.field(), t.leader()]).toEqual([["BP01-T03", "BP01-T03"], ["V1"], 22]);
    const none = d({ me: { hand: ["BP05-007"], field: ["BP01-T03"] } }).play("BP05-007").none();
    expect(none.leader()).toBe(20);
  });

  it("008 Disciple of Unkilling — a Hunter card on top may be taken; anything else stays on top", () => {
    const t = d({ me: { hand: ["BP05-008"], deck: ["BP05-012", "V1"] } }).play("BP05-008").pick("BP05-012");
    expect(t.hand()).toEqual(["BP05-012"]);
    const other = d({ me: { hand: ["BP05-008"], deck: ["V1", "BP05-012"] } }).play("BP05-008");
    expect([other.hand(), other.zone("me", "deck")]).toEqual([[], ["V1", "BP05-012"]]);
  });

  it("009 / 010 Noah — 2 Puppets into the EX area; Puppets entering get +1/+0 and Storm; evolved: Puppets cost 1 less", () => {
    const t = d({ me: { hand: ["BP05-009"], playPoints: 6 } }).play("BP05-009");
    expect(t.ex()).toEqual(["BP05-T03", "BP05-T03"]);
    t.play("BP05-T03");
    expect([t.stats("BP05-T03@field"), t.keywords("BP05-T03@field")]).toEqual([[2, 1], ["rush", "storm"]]);
    const evo = d({ me: { field: [{ card: "BP05-009", evolvedInto: "BP05-010" }], ex: ["BP05-T03"], playPoints: 0 } });
    expect(evo.canPlay("BP05-T03")).toBe(true);
  });

  it("011 Mark of the Unkilling — damage equal to its defense minus 1; draw with 3 Hunter cards", () => {
    const t = d({ me: { hand: ["BP05-011"], cemetery: HUNTERS, deck: ["V1"] }, opp: { field: [{ card: "V5", damage: 1 }] } });
    t.play("BP05-011");
    expect([t.stats("opp:V5"), t.hand()]).toEqual([[5, 1], ["V1"]]);
  });

  it("012 Servant of Unkilling — leader +2 with 3 Hunter cards in the cemetery", () => {
    expect(d({ me: { hand: ["BP05-012"], cemetery: HUNTERS } }).play("BP05-012").leader()).toBe(22);
    expect(d({ me: { hand: ["BP05-012"], cemetery: HUNTERS.slice(1) } }).play("BP05-012").leader()).toBe(20);
  });

  it("013 Mechanical Bowman — banish a card in your EX area (a token too) for 5 damage", () => {
    const t = d({ me: { hand: ["BP05-013"], ex: ["BP05-T03"], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP05-013").yes();
    expect([t.ex(), t.field("opp")]).toEqual([[], []]);
  });

  it("014 / 015 Flower Doll — a Puppet into the EX area; evolved Last Words: a Puppetry follower back to hand, itself included", () => {
    expect(d({ me: { hand: ["BP05-014"] } }).play("BP05-014").ex()).toEqual(["BP05-T03"]);
    const lw = d({ me: { field: [{ card: "BP05-014", evolvedInto: "BP05-015" }], hand: ["QUICK-SAC"], cemetery: ["BP05-016"] } });
    lw.play("QUICK-SAC").pick("BP05-014");
    expect([lw.hand(), lw.cemetery()]).toEqual([["BP05-014"], ["BP05-016", "QUICK-SAC"]]);
  });

  it("016 Automaton Soldier — Ward; 2 Puppets into the EX area", () => {
    const t = d({ me: { hand: ["BP05-016"] } }).play("BP05-016").none();
    expect([t.ex(), t.keywords("BP05-016")]).toEqual([["BP05-T03", "BP05-T03"], ["ward"]]);
  });

  it("017 Mark of the Six — Quick; the next damage to your leader this turn is prevented", () => {
    const t = d({ me: { hand: ["BP05-017", "BP05-075"], playPoints: 2 } }).play("BP05-017").play("BP05-075");
    expect([t.leader(), t.leader("opp")]).toEqual([20, 19]);
  });

  it("T03 Puppet — Rush", () => {
    const t = d({ me: { hand: ["BP05-T03"] }, opp: { field: [{ card: "V1", engaged: true }] } }).play("BP05-T03");
    expect(t.attackTargets("BP05-T03")).toEqual(["V1"]);
  });
});
