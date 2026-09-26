import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP12 Swordcraft (018–034, T02). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). BP01-032 Alwida's
// Command; BP08-025 Azord, Duke of the Mists (3/4, Ward); BP11-046 Crystal Fencer draws and discards.
// Tokens: BP07-T03 Naterran Great Tree, BP12-T02 Twilight Blade.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const TREE = "BP07-T03";
const BLADE = "BP12-T02";

describe("BP12 Swordcraft", () => {
  it("018 / 019 Patrick — Ward; a Tree onto the field or into the EX area; evolved: recover 5 with 5 Natura cards on the field and in the EX area", () => {
    expect(d({ me: { hand: ["BP12-018"], playPoints: 5 } }).play("BP12-018").none().choose("field").field()).toEqual(["BP12-018", TREE]);
    expect(d({ me: { hand: ["BP12-018"], playPoints: 5 } }).play("BP12-018").none().choose("ex").ex()).toEqual([TREE]);
    const evo = (ex: string[]) => d({ me: { field: ["BP12-018", TREE, TREE], ex, evolveDeck: ["BP12-019"], playPoints: 1, maxPlayPoints: 8 } }).evolve("BP12-018");
    expect(evo([TREE, TREE]).pp()).toBe(5);
    expect(evo([TREE]).pp()).toBe(0);
  });

  it("020 Lecia — summons a Nano from the deck; a Nano evolving: a Twilight Blade into the EX area or leader +2", () => {
    const t = d({ me: { hand: ["BP12-020"], deck: ["V1", "BP12-025"], playPoints: 3 } }).play("BP12-020").pick("BP12-025");
    expect([t.field(), t.keywords("BP12-025")]).toEqual([["BP12-020", "BP12-025"], ["bane", "assail"]]);
    const blade = d({ me: { field: ["BP12-020", "BP12-025"], evolveDeck: ["BP12-026"], playPoints: 1 } }).evolve("BP12-025").choose("blade");
    expect(blade.ex()).toEqual([BLADE]);
    const defense = d({ me: { field: ["BP12-020", "BP12-025"], evolveDeck: ["BP12-026"], playPoints: 1 } }).evolve("BP12-025").choose("defense");
    expect(defense.leader()).toBe(22);
    expect(d({ me: { field: ["BP12-020", "BP12-029"], evolveDeck: ["BP12-030"], deck: ["V1"], playPoints: 1 } }).evolve("BP12-029").leader()).toBe(20);
  });

  it("021 / 022 Ironfist Beast Warrior — discarded: may go into the EX area; the top card into the EX area; evolved: the next card from the EX area costs 10 less", () => {
    const t = d({ me: { hand: ["BP11-046", "BP12-021"], deck: ["V1"], playPoints: 3 } }).play("BP11-046").pick("BP12-021").yes();
    expect([t.ex(), t.cemetery()]).toEqual([["BP12-021"], []]);
    expect(d({ me: { hand: ["BP12-021"], deck: ["V5"], playPoints: 5 } }).play("BP12-021").none().ex()).toEqual(["V5"]);
    const evo = d({ me: { field: ["BP12-021"], evolveDeck: ["BP12-022"], deck: ["V5"], playPoints: 3 } }).evolve("BP12-021");
    expect([evo.ex(), evo.pp(), evo.canPlay("V5@ex")]).toEqual([["V5"], 0, true]);
  });

  it("023 Alwida — the next Alwida's Command 5 less, or the next Thief card 3 less; a Thief attacking deals 4 and its controller buries 1", () => {
    expect(d({ me: { hand: ["BP12-023", "BP01-032"], playPoints: 5 } }).play("BP12-023").choose("command").canPlay("BP01-032")).toBe(true);
    const thief = d({ me: { hand: ["BP12-023", "BP12-027"], playPoints: 5 } }).play("BP12-023").choose("thief");
    expect(thief.canPlay("BP12-027")).toBe(true);
    const t = d({ me: { field: ["BP12-023"] }, opp: { field: ["V5"], deck: ["V1", "V3"] } }).attack("BP12-023", "opp:leader");
    expect([t.stats("opp:V5"), t.zone("opp", "deck"), t.cemetery("opp"), t.leader("opp")]).toEqual([[5, 1], ["V3"], ["V1"], 15]);
  });

  it("024 Stroke of Conviction — engage 2 Trees; 5 damage and 2 to its leader, up to 1 Natura follower +1/+1", () => {
    const t = d({ me: { hand: ["BP12-024"], field: [TREE, TREE, "BP12-027"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP12-024").pick("BP12-027");
    expect([t.field("opp"), t.leader("opp"), t.stats("BP12-027"), t.engaged(TREE)]).toEqual([[], 18, [3, 3], true]);
    expect(d({ me: { hand: ["BP12-024"], field: [TREE, "BP12-027"], playPoints: 2 }, opp: { field: ["V5"] } }).canPlay("BP12-024")).toBe(false);
  });

  it("025 / 026 Nano — Bane; Assail while there's a Lecia on your field", () => {
    expect(d({ me: { field: ["BP12-025", "BP12-020"] } }).keywords("BP12-025")).toEqual(["bane", "assail"]);
    expect(d({ me: { field: ["BP12-025"] } }).keywords("BP12-025")).toEqual(["bane"]);
    expect(d({ me: { field: [{ card: "BP12-025", evolvedInto: "BP12-026" }, "BP12-020"] } }).keywords("BP12-025")).toEqual(["bane", "assail"]);
  });

  it("027 Panther Scout — Storm; may put a Tree nowhere", () => {
    const t = d({ me: { hand: ["BP12-027"], playPoints: 2 } }).play("BP12-027").choose("none");
    expect([t.field(), t.ex(), t.keywords("BP12-027")]).toEqual([["BP12-027"], [], ["storm"]]);
  });

  it("028 King's Welcome — draw 2 with a Commander and an Officer follower on your field", () => {
    expect(d({ me: { hand: ["BP12-028"], field: ["BP12-020", "BP12-025"], deck: ["V1", "V3"], playPoints: 2 } }).play("BP12-028").hand()).toEqual(["V1", "V3"]);
    expect(d({ me: { hand: ["BP12-028"], field: ["BP12-020"], deck: ["V1", "V3"], playPoints: 2 } }).play("BP12-028").hand()).toEqual([]);
  });

  it("029 / 030 Lilje — Azord has Storm and Strike +2/+2; evolved: searches an Azord", () => {
    const t = d({ me: { field: ["BP12-029", "BP08-025"] } });
    expect(t.keywords("BP08-025")).toEqual(["ward", "storm"]);
    t.attack("BP08-025", "opp:leader");
    expect([t.stats("BP08-025"), t.leader("opp")]).toEqual([[5, 6], 15]);
    const evo = d({ me: { field: ["BP12-029"], evolveDeck: ["BP12-030"], deck: ["V1", "BP08-025"], playPoints: 1 } }).evolve("BP12-029").pick("BP08-025");
    expect(evo.hand()).toEqual(["BP08-025"]);
  });

  it("031 Sheena — Rush; Fanfare 1 damage, 5 with an Azord on your field", () => {
    expect(d({ me: { hand: ["BP12-031"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP12-031").stats("opp:V5")).toEqual([5, 4]);
    expect(d({ me: { hand: ["BP12-031"], field: ["BP08-025"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP12-031").field("opp")).toEqual([]);
  });

  it("032 Wolf Fang Swordsman — Bane; (4): +2/+2 and Storm", () => {
    const t = d({ me: { field: ["BP12-032"], playPoints: 4 } }).activate("BP12-032");
    expect([t.stats("BP12-032"), t.keywords("BP12-032")]).toEqual([[4, 5], ["bane", "storm"]]);
  });

  it("033 Splendid Fencer — an Officer follower +2 attack", () => {
    expect(d({ me: { hand: ["BP12-033"], field: ["BP12-032", "V1"], playPoints: 3 } }).play("BP12-033").stats("BP12-032")).toEqual([4, 3]);
  });

  it("034 Ivory Sword Dance — X damage divided between up to 2 enemy followers, X the highest attack among your followers", () => {
    const t = d({ me: { hand: ["BP12-034"], field: ["V5", "V3"], playPoints: 2 }, opp: { field: ["V5", "V3"] } }).play("BP12-034").pick("opp:V5", "opp:V3").choose("4");
    expect([t.stats("opp:V5"), t.stats("opp:V3")]).toEqual([[5, 1], [3, 3]]);
  });

  it("T02 Twilight Blade — engage a Lecia and a Nano: 10 damage to each enemy leader and follower", () => {
    const t = d({ me: { ex: [BLADE], field: ["BP12-020", "BP12-025"], playPoints: 5 }, opp: { field: ["V5", "V3"] } }).play(BLADE);
    expect([t.field("opp"), t.leader("opp"), t.engaged("BP12-020"), t.engaged("BP12-025")]).toEqual([[], 10, true, true]);
    expect(d({ me: { ex: [BLADE], field: ["BP12-020"], playPoints: 5 } }).canPlay(BLADE)).toBe(false);
  });
});
