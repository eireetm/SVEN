import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP13 Runecraft (036–053, T01, T02). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral); WARD 2c 1/3
// with Ward; QUICK-SAC destroys one of your followers. BP13-042 Grea is an Academic card; BP12-042 Chaos
// Wielder a Mage follower; BP13-047 Riven Earth / BP12-051 Mystic Absorption Mage spells; BP03-051 Magical
// Rook (1) and BP03-046 Magical Knight (3) Chess followers. Tokens: BP13-T01 Anne's Summoning, BP13-T02
// Resentful Blaze, BP01-T10 Magic Sediment (Stack).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const SUMMONING = "BP13-T01";
const BLAZE = "BP13-T02";
const SEDIMENT = "BP01-T10";
const n = (count: number, id = "V1") => Array<string>(count).fill(id);
const endOpponentTurn = (t: ReturnType<typeof d>) => t.game.act({ type: "mainPhase", action: { type: "endMainPhase" } });

describe("BP13 Runecraft", () => {
  it("036 / 039 Anne & Rending Blast — discard an Academic card: draw, Anne's Summoning with 5 Academic cards; engage with 15: may play Rending Blast from the evolve deck", () => {
    const t = d({ me: { hand: ["BP13-036", "BP13-042"], cemetery: n(4, "BP13-042"), deck: ["V1"], playPoints: 2 } }).play("BP13-036").yes();
    expect([t.hand(), t.ex()]).toEqual([["V1"], [SUMMONING]]);
    expect(d({ me: { hand: ["BP13-036", "BP13-042"], cemetery: n(3, "BP13-042"), deck: ["V1"], playPoints: 2 } }).play("BP13-036").yes().ex()).toEqual([]);
    const act = d({ me: { field: ["BP13-036"], cemetery: n(15, "BP13-042"), evolveDeck: ["BP13-039"], playPoints: 3 } }).activate("BP13-036").pick("BP13-039");
    const blast = act.game.state.cards[act.id("BP13-039")]!;
    expect([act.leader("opp"), act.pp(), blast.zone, blast.faceUp]).toEqual([12, 0, "evolveDeck", true]);
    // Its cost must be paid (ruling).
    expect(d({ me: { field: ["BP13-036"], cemetery: n(15, "BP13-042"), evolveDeck: ["BP13-039"], playPoints: 2 } }).activate("BP13-036").leader("opp")).toBe(20);
    expect(d({ me: { field: ["BP13-036"], cemetery: n(14, "BP13-042"), evolveDeck: ["BP13-039"], playPoints: 3 } }).canActivate("BP13-036")).toBe(false);
  });

  it("037 Ghios — (0) from the hand into the EX area, a mana counter with 5 Mage followers and 5 Mage spells in the cemetery; in the EX area, a counter at your end phase after playing a Mage follower and spell", () => {
    const t = d({ me: { hand: ["BP13-037"], cemetery: [...n(5, "BP12-042"), ...n(5, "BP13-047")] } }).activate("BP13-037");
    expect([t.ex(), t.counters("BP13-037", "mana")]).toEqual([["BP13-037"], 1]);
    expect(d({ me: { hand: ["BP13-037"], cemetery: n(5, "BP12-042") } }).activate("BP13-037").counters("BP13-037", "mana")).toBe(0);
    const end = d({ me: { ex: ["BP13-037"], hand: ["BP12-042", "BP13-047"], playPoints: 3 }, opp: { field: ["V5"], deck: ["V1"] } });
    end.play("BP12-042").play("BP13-047").end();
    expect(end.counters("BP13-037", "mana")).toBe(1);
    expect(d({ me: { ex: ["BP13-037"], hand: ["BP12-042"], playPoints: 2 }, opp: { deck: ["V1"] } }).play("BP12-042").end().counters("BP13-037", "mana")).toBe(0);
  });

  it("038 Ghios (Evolved) — up to X Mage spells with different names that cost 3 or less from the cemetery into the EX area at 3 less; the mana counters are removed", () => {
    const t = d({
      me: { field: [{ card: "BP13-037", counters: { mana: 2 } }], evolveDeck: ["BP13-038"], cemetery: ["BP13-047", "BP13-047", "BP12-051"], playPoints: 4 },
      opp: { field: ["V5"] },
    });
    t.evolve("BP13-037").pick("BP13-047").pick("BP12-051");
    expect([t.ex(), t.counters("BP13-037", "mana"), t.pp(), t.canPlay("BP13-047@ex"), t.canPlay("BP12-051@ex")]).toEqual([
      ["BP13-047", "BP12-051"],
      0,
      0,
      true,
      true,
    ]);
  });

  it("040 / 041 Mileka — Ward; bury 1 of the top 5; evolved: with 6 different base costs in the cemetery, 4 damage, draw 2, discard 1", () => {
    const t = d({ me: { hand: ["BP13-040"], deck: ["V1", "V3", "V5"], playPoints: 1 } }).play("BP13-040").none().pick("V3").order();
    expect([t.cemetery(), t.zone("me", "deck").length]).toEqual([["V3"], 2]);
    const costs = ["BP04-056", "V1", "V2", "V3", "BP01-021", "V5"];
    const evo = d({ me: { field: ["BP13-040"], evolveDeck: ["BP13-041"], cemetery: costs, deck: ["V1", "V3"], hand: ["V5"], playPoints: 2 }, opp: { field: ["V5"] } });
    evo.evolve("BP13-040").pick("V5");
    expect([evo.stats("opp:V5"), evo.hand()]).toEqual([[5, 1], ["V1", "V3"]]);
    const five = d({ me: { field: ["BP13-040"], evolveDeck: ["BP13-041"], cemetery: costs.slice(1), deck: ["V1"], playPoints: 2 }, opp: { field: ["V5"] } });
    expect(five.evolve("BP13-040").stats("opp:V5")).toEqual([5, 5]);
  });

  it("042 Grea — discard an Academic card: draw, a Resentful Blaze with 5 Academic cards; engage: 1 damage", () => {
    const t = d({ me: { hand: ["BP13-042", "BP13-042"], cemetery: n(4, "BP13-042"), deck: ["V1"], playPoints: 2 } }).play("BP13-042").yes();
    expect([t.hand(), t.ex()]).toEqual([["V1"], [BLAZE]]);
    expect(d({ me: { field: ["BP13-042"] }, opp: { field: ["V5"] } }).activate("BP13-042").stats("opp:V5")).toEqual([5, 4]);
  });

  it("043 Whims of Chaos — each player declares a follower and gives it to the other; it can't attack for its new controller that turn", () => {
    const t = d({ me: { hand: ["BP13-043"], field: ["V1", "V3"], playPoints: 6 }, opp: { field: ["V5", "WARD"] } });
    t.play("BP13-043").pick("V3").pick("opp:V5");
    expect([t.field(), t.field("opp"), t.attackTargets("V5")]).toEqual([["V1", "V5"], ["WARD", "V3"], []]);
    // A full field can't take it: that follower stays.
    const full = d({ me: { hand: ["BP13-043"], field: ["V3"], playPoints: 6 }, opp: { field: ["V5", "V1", "V1", "V1", "V1"] } });
    full.play("BP13-043").pick("opp:V5");
    expect([full.field(), full.field("opp")]).toEqual([["V3", "V5"], ["V1", "V1", "V1", "V1"]]);
  });

  it("044 / 045 Grimoire Sorcerer — evolved: may put a Mage spell from the hand into the EX area at 3 less", () => {
    const t = d({ me: { field: ["BP13-044"], evolveDeck: ["BP13-045"], hand: ["BP13-047", "V1"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP13-044").pick("BP13-047");
    expect([t.ex(), t.pp(), t.canPlay("BP13-047@ex")]).toEqual([["BP13-047"], 0, true]);
  });

  it("046 Hurricane Golem — 2 damage to each enemy follower, 2 more with Earth Rite; Last Words a Magic Sediment", () => {
    const t = d({ me: { hand: ["BP13-046"], field: [SEDIMENT], playPoints: 6 }, opp: { field: ["V5", "V3"] } }).play("BP13-046").yes();
    expect([t.field("opp"), t.stats("opp:V5"), t.field()]).toEqual([["V5"], [5, 1], ["BP13-046"]]);
    const plain = d({ me: { hand: ["BP13-046"], playPoints: 6 }, opp: { field: ["V5", "V3"] } }).play("BP13-046");
    expect([plain.stats("opp:V5"), plain.stats("opp:V3")]).toEqual([[5, 3], [3, 2]]);
    expect(d({ me: { field: ["BP13-046"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").field()).toEqual([SEDIMENT]);
  });

  it("047 Riven Earth — 2 damage, or 4 and 1 to its leader with 2 Mage followers", () => {
    expect(d({ me: { hand: ["BP13-047"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP13-047").stats("opp:V5")).toEqual([5, 3]);
    const two = d({ me: { hand: ["BP13-047"], field: ["BP12-042", "BP13-042"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP13-047");
    expect([two.stats("opp:V5"), two.leader("opp")]).toEqual([[5, 1], 19]);
  });

  it("048 / 049 Magical Squirrel — draw, discard, leader +1; evolved: 1 damage to an enemy follower and its leader", () => {
    const t = d({ me: { hand: ["BP13-048", "V5"], deck: ["V1"], playPoints: 2 } }).play("BP13-048").pick("V5");
    expect([t.hand(), t.leader()]).toEqual([["V1"], 21]);
    const evo = d({ me: { field: ["BP13-048"], evolveDeck: ["BP13-049"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP13-048");
    expect([evo.stats("opp:V5"), evo.leader("opp")]).toEqual([[5, 4], 19]);
  });

  it("050 Art Society Magus — the top card into the EX area, leader + its cost", () => {
    const t = d({ me: { hand: ["BP13-050"], deck: ["V5"], playPoints: 5 } }).play("BP13-050");
    expect([t.ex(), t.leader()]).toEqual([["V5"], 25]);
  });

  it("051 Cat Summoner — summons a Beast or Arcanaform follower that costs 2 or less from the cemetery", () => {
    expect(d({ me: { hand: ["BP13-051"], cemetery: ["BP13-016", "V1"], playPoints: 3 } }).play("BP13-051").field()).toEqual(["BP13-051", "BP13-016"]);
  });

  it("052 Arcane Duplication — banish a cemetery card and search a card with its cost and type", () => {
    const t = d({ me: { hand: ["BP13-052"], cemetery: ["V3"], deck: ["V1", "BP13-003", "BP13-047"], playPoints: 2 } }).play("BP13-052").pick("BP13-003");
    expect([t.hand(), t.zone("me", "banished")]).toEqual([["BP13-003"], ["V3"]]);
  });

  it("053 Sacrifice — 1 less with 5 Chess cards in the cemetery; destroy a Chess follower, summon a Chess follower that costs 2 more", () => {
    const t = d({ me: { hand: ["BP13-053"], field: ["BP03-051"], deck: ["V1", "BP03-046"], playPoints: 2 } }).play("BP13-053").pick("BP03-046");
    expect([t.field(), t.cemetery()]).toEqual([["BP03-046"], ["BP03-051", "BP13-053"]]);
    expect(d({ me: { hand: ["BP13-053"], field: ["BP03-051"], cemetery: n(5, "BP03-051"), playPoints: 1 } }).canPlay("BP13-053")).toBe(true);
    expect(d({ me: { hand: ["BP13-053"], field: ["BP03-051"], playPoints: 1 } }).canPlay("BP13-053")).toBe(false);
  });

  it("T01 Anne's Summoning — Rush, Ward; Fanfare leader +2; banished at the start of your main phase", () => {
    const t = d({ me: { ex: [SUMMONING], deck: ["V1"], playPoints: 2 }, opp: { deck: ["V1"] } }).play(SUMMONING).none();
    expect([t.leader(), t.keywords(SUMMONING)]).toEqual([22, ["rush", "ward"]]);
    // Ward: its controller may engage it at the end phase (none here).
    t.end().none();
    endOpponentTurn(t);
    expect(t.field()).toEqual([]);
  });

  it("T02 Resentful Blaze — 4 damage, or 4 to 2 enemy followers with 15 Academic cards", () => {
    expect(d({ me: { ex: [BLAZE], playPoints: 1 }, opp: { field: ["V5", "V3"] } }).play(BLAZE).choose("one").pick("opp:V5").stats("opp:V5")).toEqual([5, 1]);
    const two = d({ me: { ex: [BLAZE], cemetery: n(15, "BP13-042"), playPoints: 1 }, opp: { field: ["V5", "V3"] } }).play(BLAZE).choose("two");
    expect([two.stats("opp:V5"), two.field("opp")]).toEqual([[5, 1], ["V5"]]);
    const few = d({ me: { ex: [BLAZE], playPoints: 1 }, opp: { field: ["V5", "V3"] } }).play(BLAZE).choose("two");
    expect(few.stats("opp:V5")).toEqual([5, 5]);
  });
});
