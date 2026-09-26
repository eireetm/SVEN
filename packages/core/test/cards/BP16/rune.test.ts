import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP16 Runecraft (037–055, T01, T02). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); KILL (1) is a spell; QUICK-SAC
// (0) destroys one of your followers. Academic: BP16-045 (spell), BP16-048. Festive followers: BP14-008, BP14-012.
// Tokens: BP01-T10 Magic Sediment (Stack), BP01-T08 Strikeform Golem, BP01-T09 Guardform Golem, BP13-T01 Anne's
// Summoning (Rush, Ward; Fanfare: leader +2), BP16-T01 Guardian Golem, BP16-T02 Looking Smart!.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const SEDIMENT = "BP01-T10";
const GOLEM = "BP16-T01";
const SMART = "BP16-T02";
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };
const n = (count: number, id = "V1") => Array<string>(count).fill(id);

describe("BP16 Runecraft", () => {
  it("037 Anne & Grea, Mysterian Duo — Storm with 10 Academic cards in the cemetery; Fanfare, discard 2 Academic cards: 5 damage, draw 2; end phase with 5: an Anne's Summoning", () => {
    expect(d({ me: { field: ["BP16-037"], cemetery: n(10, "BP16-045") } }).keywords("BP16-037")).toEqual(["storm"]);
    expect(d({ me: { field: ["BP16-037"], cemetery: n(9, "BP16-045") } }).keywords("BP16-037")).toEqual([]);
    const t = d({ me: { hand: ["BP16-037", "BP16-048", "BP16-045"], deck: ["V1", "V3"], playPoints: 5 }, opp: { field: ["V5"] } }).play("BP16-037").yes();
    expect([t.field("opp"), t.hand(), t.cemetery()]).toEqual([[], ["V1", "V3"], ["BP16-048", "BP16-045"]]);
    const end = d({ me: { field: [{ card: "BP16-037", engaged: true }], cemetery: n(5, "BP16-045") }, opp: { deck: ["V1"] } }).end().none();
    expect([end.field(), end.leader()]).toEqual([["BP16-037", "BP13-T01"], 22]);
  });

  it("038 / 039 Lilanthim, Anathema of Edacity — Fanfare: 2 damage; act, Earth Rite: Assail; super-evolved: destroy up to 2, add 2 to a Stack; evolved Last Words, Earth Rite: back onto the field engaged", () => {
    expect(d({ me: { hand: ["BP16-038"], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP16-038").stats("opp:V5")).toEqual([5, 3]);
    expect(d({ me: { field: ["BP16-038", SEDIMENT] } }).activate("BP16-038").keywords("BP16-038")).toEqual(["assail"]);
    expect(d({ me: { field: ["BP16-038"] } }).canActivate("BP16-038")).toBe(false);
    const s = d({ me: { field: ["BP16-038", SEDIMENT], evolveDeck: ["BP16-039"], playPoints: 1, ...SUPER }, opp: { field: ["V5", "V3"] } });
    s.evolve("BP16-038", { sep: true }).pick("opp:V5", "opp:V3");
    expect([s.field("opp"), s.counters(SEDIMENT, "stack")]).toEqual([[], 3]);
    const lw = d({ me: { field: [{ card: "BP16-038", evolvedInto: "BP16-039" }, SEDIMENT], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").yes();
    expect([lw.field(), lw.engaged("BP16-038"), lw.stats("BP16-038")]).toEqual([["BP16-038"], true, [4, 4]]);
  });

  it("040 / 041 Zizdvend, Fate's Arbiter — Fanfare: draw per other Festive follower; end phase: that much to the enemy leader; evolved: 2 times your Festive followers in damage", () => {
    expect(d({ me: { hand: ["BP16-040"], field: ["BP14-012", "BP14-008"], deck: ["V1", "V3"], playPoints: 3 } }).play("BP16-040").hand()).toEqual(["V1", "V3"]);
    expect(d({ me: { field: ["BP16-040", "BP14-012"] }, opp: { deck: ["V1"] } }).end().leader("opp")).toBe(19);
    const evo = d({ me: { field: ["BP16-040", "BP14-012"], evolveDeck: ["BP16-041"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP16-040");
    expect(evo.stats("opp:V5")).toEqual([5, 1]);
  });

  it("042 / 043 Edelweiss, Sagelight Ward — evolved: a Strikeform Golem and a Guardform Golem into the EX area; a Golem follower onto your field adds 1 to a Stack; super-evolved: draw 2", () => {
    const t = d({ me: { field: ["BP16-042"], evolveDeck: ["BP16-043"], playPoints: 1 } }).evolve("BP16-042");
    expect([t.field(), t.ex(), t.counters(SEDIMENT, "stack")]).toEqual([["BP16-042", "BP01-T08", SEDIMENT], ["BP01-T09"], 1]);
    const s = d({ me: { field: ["BP16-042", SEDIMENT], evolveDeck: ["BP16-043"], deck: ["V1", "V3"], playPoints: 1, ...SUPER } }).evolve("BP16-042", { sep: true }).flush();
    expect([s.hand(), s.counters(SEDIMENT, "stack")]).toEqual([["V1", "V3"], 2]);
  });

  it("044 Juno, Visionary Alchemist — act, engage and Earth Rite: 2 Guardian Golems; from the hand, (2) and discard it: add 2 to a Stack, draw", () => {
    const t = d({ me: { field: ["BP16-044", SEDIMENT] } }).activate("BP16-044").none();
    expect([t.field(), t.engaged("BP16-044")]).toEqual([["BP16-044", GOLEM, GOLEM], true]);
    const hand = d({ me: { hand: ["BP16-044"], deck: ["V1"], playPoints: 2 } }).activate("BP16-044@hand");
    expect([hand.field(), hand.counters(SEDIMENT, "stack"), hand.hand(), hand.cemetery()]).toEqual([[SEDIMENT], 2, ["V1"], ["BP16-044"]]);
  });

  it("045 Homework Time! — draw; a Looking Smart! with 5 Academic cards in the cemetery", () => {
    const t = d({ me: { hand: ["BP16-045"], deck: ["V1"], cemetery: n(5, "BP16-048"), playPoints: 1 } }).play("BP16-045");
    expect([t.hand(), t.ex()]).toEqual([["V1"], [SMART]]);
    expect(d({ me: { hand: ["BP16-045"], deck: ["V1"], cemetery: n(4, "BP16-048"), playPoints: 1 } }).play("BP16-045").ex()).toEqual([]);
  });

  it("046 / 047 Penelope, Potions Prodigy — Fanfare: a Magic Sediment; evolved: leader +2, add 1 to a Stack", () => {
    expect(d({ me: { hand: ["BP16-046"], playPoints: 2 } }).play("BP16-046").field()).toEqual(["BP16-046", SEDIMENT]);
    const evo = d({ me: { field: ["BP16-046", SEDIMENT], evolveDeck: ["BP16-047"], playPoints: 1 } }).evolve("BP16-046");
    expect([evo.leader(), evo.counters(SEDIMENT, "stack")]).toEqual([22, 2]);
  });

  it("048 Ms. Miranda, Adored Academic — Fanfare, discard an Academic card: draw 2", () => {
    expect(d({ me: { hand: ["BP16-048", "BP16-045"], deck: ["V1", "V3"], playPoints: 2 } }).play("BP16-048").yes().hand()).toEqual(["V1", "V3"]);
  });

  it("049 Snowman Army — an enemy follower becomes 1/1; with Spellchain (10) it loses all abilities", () => {
    expect(d({ me: { hand: ["BP16-049"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP16-049").stats("opp:V5")).toEqual([1, 1]);
    const t = d({ me: { hand: ["BP16-049"], cemetery: n(10, "KILL"), playPoints: 2 }, opp: { field: ["BP16-035"] } }).play("BP16-049");
    expect([t.stats("opp:BP16-035"), t.keywords("opp:BP16-035")]).toEqual([[1, 1], []]);
  });

  it("050 / 051 Starry-Eyed Penguin Wizard — evolved: draw 2, discard 2", () => {
    const t = d({ me: { field: ["BP16-050"], evolveDeck: ["BP16-051"], hand: ["V5"], deck: ["V1", "V3"], playPoints: 1 } }).evolve("BP16-050").pick("V5", "V1");
    expect([t.hand(), t.cemetery()]).toEqual([["V3"], ["V5", "V1"]]);
  });

  it("052 Emmylou, Witch of Wonder — Fanfare: a Magic Sediment, or Earth Rite: 3 damage", () => {
    expect(d({ me: { hand: ["BP16-052"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP16-052").choose("sediment").field()).toEqual(["BP16-052", SEDIMENT]);
    const t = d({ me: { hand: ["BP16-052"], field: [SEDIMENT], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP16-052").choose("damage").yes();
    expect([t.stats("opp:V5"), t.field()]).toEqual([[5, 2], ["BP16-052"]]);
  });

  it("053 William, Mysterian Student — Fanfare: 4 damage; act (2), engage: 4 damage", () => {
    expect(d({ me: { hand: ["BP16-053"], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP16-053").stats("opp:V5")).toEqual([5, 1]);
    const act = d({ me: { field: ["BP16-053"], playPoints: 2 }, opp: { field: ["V5"] } }).activate("BP16-053");
    expect([act.stats("opp:V5"), act.engaged("BP16-053"), act.pp()]).toEqual([[5, 1], true, 0]);
  });

  it("054 Sagelight Teachings — a Magic Sediment and leader +1, or a Guardian Golem into the EX area; both after an evolution this turn", () => {
    const t = d({ me: { hand: ["BP16-054"], playPoints: 1 } }).play("BP16-054").choose("sediment");
    expect([t.field(), t.leader()]).toEqual([[SEDIMENT], 21]);
    const both = d({ me: { hand: ["BP16-054"], field: ["BP16-050"], evolveDeck: ["BP16-051"], deck: ["V1", "V3"], playPoints: 2 } });
    both.evolve("BP16-050").pick("V1", "V3").play("BP16-054").choose("sediment", "golem");
    expect([both.ex(), both.leader()]).toEqual([[GOLEM], 21]);
  });

  it("055 Truth Summons — Earth Rite: a Guardian Golem; without paying it does nothing", () => {
    const t = d({ me: { hand: ["BP16-055"], field: [SEDIMENT], playPoints: 3 } }).play("BP16-055").yes().none();
    expect(t.field()).toEqual([GOLEM]);
    const none = d({ me: { hand: ["BP16-055"], playPoints: 3 } });
    expect(none.canPlay("BP16-055")).toBe(true);
    expect(none.play("BP16-055").field()).toEqual([]);
  });

  it("T01 Guardian Golem — Ward; Last Words: leader +2", () => {
    const t = d({ me: { field: [GOLEM], hand: ["QUICK-SAC"] } });
    expect([t.keywords(GOLEM), t.play("QUICK-SAC").leader()]).toEqual([["ward"], 22]);
  });

  it("T02 Looking Smart! — 2 damage, draw, discard", () => {
    const t = d({ me: { ex: [SMART], hand: ["V3"], deck: ["V1"] }, opp: { field: ["V5"] } }).play(`${SMART}@ex`).pick("V3");
    expect([t.stats("opp:V5"), t.hand()]).toEqual([[5, 3], ["V1"]]);
  });
});
