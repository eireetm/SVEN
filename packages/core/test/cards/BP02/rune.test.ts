import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP02 Runecraft (035–051) and its token Magical Pawn (T04).
// "V1".."V5" are vanilla test followers (cost N, V1 = 2/2, V2 = 2/3, V3 = 3/4, V5 = 5/5).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const SEDIMENT = "BP01-T10";
const TEN_SPELLS = Array<string>(10).fill("BP02-050");

describe("BP02 Runecraft", () => {
  it("035 Daria — discard your hand, then fill the EX area from the deck", () => {
    const t = d({ me: { hand: ["BP02-035", "V1", "V2"], deck: ["V3", "V3", "V3", "V3", "V3", "V5", "V5"], playPoints: 6 } });
    t.play("BP02-035");
    expect([t.hand(), t.cemetery(), t.ex(), t.zone("me", "deck")]).toEqual([[], ["V1", "V2"], ["V3", "V3", "V3", "V3", "V3"], ["V5", "V5"]]);
  });

  it("035 / 036 Daria — Spellchain counts Runecraft followers too (10 followers are enough)", () => {
    const spec = (field: string[]) =>
      d({ me: { field, cemetery: Array<string>(10).fill("BP02-042"), hand: ["BP02-041"], playPoints: 2 }, opp: { field: ["V3"], deck: ["V1"] } });
    const withDaria = spec(["BP02-035"]).play("BP02-041");
    expect(withDaria.zone("opp", "deck")).toEqual(["V3", "V1"]); // Rimewind with Spellchain (10)
    const without = spec([]).play("BP02-041");
    expect(without.hand("opp")).toEqual(["V3"]);
  });

  it("036 Daria (Evolved) — a follower and a spell in your EX area cost 5 less this turn", () => {
    const t = d({ me: { field: ["BP02-035"], evolveDeck: ["BP02-036"], ex: ["V5", "BP02-050"], playPoints: 1 } }).evolve("BP02-035").flush();
    expect([t.pp(), t.canPlay("V5@ex"), t.canPlay("BP02-050@ex")]).toEqual([0, true, true]);
  });

  it("037 Sun Oracle Pascale — Magic Sediment; Quick acts with Earth Rite: -2/-2 to an enemy follower or +2/+2 to another of yours", () => {
    expect(d({ me: { hand: ["BP02-037"], playPoints: 4 } }).play("BP02-037").field()).toEqual(["BP02-037", SEDIMENT]);
    const minus = d({ me: { field: ["BP02-037", "V1", SEDIMENT] }, opp: { field: ["V3"] } }).activate("BP02-037", 0);
    expect([minus.stats("opp:V3"), minus.field()]).toEqual([[1, 2], ["BP02-037", "V1"]]); // the Sediment's last counter was used
    // No enemy follower: the -2/-2 act is not legal, so the +2/+2 act is the only one offered.
    const plus = d({ me: { field: ["BP02-037", "V1", SEDIMENT] } }).activate("BP02-037");
    expect(plus.stats("V1")).toEqual([4, 4]);
    expect(d({ me: { field: ["BP02-037", "V1"] }, opp: { field: ["V3"] } }).canActivate("BP02-037")).toBe(false); // no Earth Rite
  });

  it("038 / 040 Anne and Grea — 2 less with the other on your field; Grea deals 3, or 6 with Anne", () => {
    expect(d({ me: { hand: ["BP02-038"], field: ["BP02-040"], playPoints: 2 } }).canPlay("BP02-038")).toBe(true);
    expect(d({ me: { hand: ["BP02-038"], playPoints: 2 } }).canPlay("BP02-038")).toBe(false);
    expect(d({ me: { hand: ["BP02-040"], field: ["BP02-038", "BP02-038"], playPoints: 2 } }).canPlay("BP02-040")).toBe(true);
    const three = d({ me: { field: ["BP02-040"] }, opp: { field: ["V5"] } }).activate("BP02-040");
    expect(three.stats("opp:V5")).toEqual([5, 2]);
    const six = d({ me: { field: ["BP02-040", "BP02-038"] }, opp: { field: ["V5"] } }).activate("BP02-040");
    expect(six.field("opp")).toEqual([]);
  });

  it("039 Anne (Evolved) — search an Academic follower with another name", () => {
    const t = d({ me: { field: ["BP02-038"], evolveDeck: ["BP02-039"], deck: ["BP02-038", "BP02-046"], playPoints: 1 } });
    t.evolve("BP02-038").pick("BP02-046");
    expect(t.hand()).toEqual(["BP02-046"]);
  });

  it("041 Rimewind — Quick; an unevolved enemy follower back to hand (evolved ones cannot be selected)", () => {
    const t = d({
      me: { hand: ["BP02-041"], playPoints: 2 },
      opp: { field: ["V3", { card: "BP01-171", evolvedInto: "BP01-172" }] },
    }).play("BP02-041");
    expect([t.hand("opp"), t.field("opp")]).toEqual([["V3"], ["BP01-171"]]);
    const sc = d({ me: { hand: ["BP02-041"], cemetery: TEN_SPELLS, playPoints: 2 }, opp: { field: ["V3"], deck: ["V1"] } }).play("BP02-041");
    expect(sc.zone("opp", "deck")).toEqual(["V3", "V1"]);
  });

  it("043 Remi & Rami (Evolved) — a Strikeform Golem; Earth Rite +2 attack, paid first so its Stack amulet frees a slot", () => {
    const t = d({ me: { field: ["BP02-042", "V1", "V1", "V1", SEDIMENT], evolveDeck: ["BP02-043"], playPoints: 1 } });
    t.evolve("BP02-042").yes();
    expect([t.field(), t.stats("BP01-T08")]).toEqual([["BP02-042", "V1", "V1", "V1", "BP01-T08"], [5, 2]]);
    const no = d({ me: { field: ["BP02-042", SEDIMENT], evolveDeck: ["BP02-043"], playPoints: 1 } }).evolve("BP02-042").no();
    expect([no.stats("BP01-T08"), no.counters(SEDIMENT, "stack")]).toEqual([[3, 2], 1]);
  });

  it("044 Shadow Witch — fanfare, Earth Rite: banish an enemy follower", () => {
    const t = d({ me: { hand: ["BP02-044"], field: [SEDIMENT], playPoints: 5 }, opp: { field: ["V5"] } }).play("BP02-044").yes();
    expect([t.field("opp"), t.zone("opp", "banished")]).toEqual([[], ["V5"]]);
  });

  it("045 Multipart Experiment — choose up to 2 options, up to 3 with Spellchain (10)", () => {
    const two = d({ me: { hand: ["BP02-045"], deck: ["V1"], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP02-045");
    expect(() => two.choose("1", "2", "3")).toThrow();
    two.choose("1", "3");
    expect([two.stats("opp:V5"), two.hand(), two.field()]).toEqual([[5, 2], ["V1"], []]);
    const three = d({ me: { hand: ["BP02-045"], cemetery: TEN_SPELLS, deck: ["V1"], playPoints: 4 }, opp: { field: ["V5"] } });
    three.play("BP02-045").choose("1", "2", "3").none(); // (2)'s Guardform Golem has Ward: keep it reserved
    expect([three.stats("opp:V5"), three.field(), three.hand()]).toEqual([[5, 2], ["BP01-T09"], ["V1"]]);
  });

  it("046 / 047 Craig — draw a card, then discard a card", () => {
    const t = d({ me: { hand: ["BP02-046", "V5"], deck: ["V1"], playPoints: 2 } }).play("BP02-046").pick("V5");
    expect([t.hand(), t.cemetery()]).toEqual([["V1"], ["V5"]]);
    const evo = d({ me: { field: ["BP02-046"], evolveDeck: ["BP02-047"], hand: ["V5"], deck: ["V1"], playPoints: 1 } });
    evo.evolve("BP02-046").pick("V1");
    expect([evo.hand(), evo.cemetery()]).toEqual([["V5"], ["V1"]]);
  });

  it("048 Grand Gargoyle — Ward; Last Words: add 2 to a Stack (a Magic Sediment with 2 counters when there is none)", () => {
    const t = d({ me: { field: [{ card: "BP02-048", damage: 3 }] }, opp: { field: [{ card: "V1", engaged: true }] } }).attack("BP02-048", "opp:V1");
    expect([t.field(), t.counters(SEDIMENT, "stack")]).toEqual([[SEDIMENT], 2]);
  });

  it("049 Witchbolt — 5 damage; draws only with an evolved follower on your field", () => {
    const t = d({ me: { hand: ["BP02-049"], deck: ["V1"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP02-049");
    expect([t.field("opp"), t.hand()]).toEqual([[], []]);
    const evo = d({ me: { hand: ["BP02-049"], field: [{ card: "EVOLVER", evolvedInto: "EVOLVER-E" }], deck: ["V1"], playPoints: 3 }, opp: { field: ["V5"] } });
    expect(evo.play("BP02-049").hand()).toEqual(["V1"]);
  });

  it("050 Magical Strategy / 051 Red-Hot Ritual — a Magical Pawn; a Stack amulet dealing 3", () => {
    expect(d({ me: { hand: ["BP02-050"], playPoints: 1 } }).play("BP02-050").field()).toEqual(["BP02-T04"]);
    const t = d({ me: { hand: ["BP02-051"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP02-051");
    expect([t.stats("opp:V5"), t.counters("BP02-051", "stack")]).toEqual([[5, 2], 1]);
  });
});
