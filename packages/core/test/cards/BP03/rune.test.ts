import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP03 Runecraft (038–054). SEDIMENT is Magic Sediment (Stack). PAWN is Magical Pawn, 2/1.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const SEDIMENT = "BP01-T10";
const PAWN = "BP02-T04";
const SPELLS = Array.from({ length: 7 }, () => "BP01-179");

describe("BP03 Runecraft", () => {
  it("038 Wizardess of Oz — Sediment, add 1 Stack, draw; Earth Rite makes the next spell cost 4 less", () => {
    const t = d({
      me: { hand: ["BP03-038", "BP01-179", "BP01-179"], deck: ["V1"], playPoints: 10 },
      opp: { deck: ["V1"], field: ["V5"] },
    });
    t.play("BP03-038");
    expect([t.field(), t.counters(SEDIMENT, "stack"), t.hand()]).toEqual([
      ["BP03-038", SEDIMENT],
      2,
      ["BP01-179", "BP01-179", "V1"],
    ]);
    t.activate("BP03-038");
    expect([t.counters(SEDIMENT, "stack"), t.canActivate("BP03-038")]).toEqual([1, false]);
    t.play("BP01-179");
    expect([t.pp(), t.stats("opp:V5")]).toEqual([4, [5, 3]]);
    t.play("BP01-179");
    expect([t.pp(), t.stats("opp:V5")]).toEqual([3, [5, 1]]);
    t.end().end().quick("BP03-038");
    expect(t.field()).not.toContain(SEDIMENT);
  });

  it("039 / 040 Mystic King — bury a Chess follower to deal 5; unevolved act still allows Evolve; evolved reanimates different names", () => {
    const block = d({
      me: { field: ["BP03-039", "BP03-051", "BP03-042"], evolveDeck: ["BP03-040"], playPoints: 2 },
      opp: { field: ["V5"] },
    });
    block.activate("BP03-039").pick("BP03-051");
    expect([block.field("opp"), block.canActivate("BP03-039"), block.canEvolve("BP03-039")]).toEqual([[], false, true]);
    block.evolve("BP03-039").none();
    expect([block.stats("BP03-039"), block.canActivate("BP03-039"), block.cemetery()]).toEqual([[6, 6], false, ["BP03-051"]]);

    const reanimate = d({
      me: { field: ["BP03-039"], evolveDeck: ["BP03-040"], cemetery: ["BP03-042", "BP03-046", "BP03-052", "BP03-051", "BP03-051"], playPoints: 2 },
    });
    reanimate.evolve("BP03-039").pick("BP03-042").pick("BP03-046").pick("BP03-052").pick("BP03-051").flush();
    expect(reanimate.field()).toEqual(["BP03-039", "BP03-042", "BP03-046", "BP03-052", "BP03-051"]);
    // Putting them onto the field is a fanfare (CR 12.4.3). 042 and 052 each put a Pawn into
    // the EX area, so 051's fanfare also gives it +1 defense. The summoned Pawn does not fit.
    expect([reanimate.stats("BP03-042"), reanimate.stats("BP03-052"), reanimate.stats("BP03-051"), reanimate.stats("BP03-046")]).toEqual([
      [3, 2],
      [2, 2],
      [3, 3],
      [3, 3],
    ]);
    expect(reanimate.keywords("BP03-051")).toEqual(["ward"]);
    expect(reanimate.ex()).toEqual([PAWN, PAWN]);
    expect(reanimate.cemetery()).toEqual(["BP03-051"]);

    const act = d({ me: { field: [{ card: "BP03-039", evolvedInto: "BP03-040" }, "BP03-051"] }, opp: { field: ["V3", "V5"] } });
    act.activate("BP03-039").pick("opp:V5");
    expect([act.field("opp"), act.field(), act.canActivate("BP03-039")]).toEqual([["V3"], ["BP03-039"], false]);
  });

  it("041 Falise, Leonardian Mage — optional Earth Rite gives Storm; Spellchain (7) deals 4 to each enemy", () => {
    const both = d({
      me: { hand: ["BP03-041"], field: [SEDIMENT], cemetery: SPELLS, playPoints: 4 },
      opp: { field: ["V5", "V3"] },
    });
    both.play("BP03-041").flush().yes();
    expect(both.keywords("BP03-041")).toEqual(["storm"]);
    expect([both.stats("opp:V5"), both.field("opp"), both.field()]).toEqual([[5, 1], ["V5"], ["BP03-041"]]);
    const decline = d({ me: { hand: ["BP03-041"], field: [SEDIMENT], playPoints: 4 } });
    decline.play("BP03-041").flush().no();
    expect([decline.keywords("BP03-041"), decline.counters(SEDIMENT, "stack")]).toEqual([[], 1]);
    const plain = d({ me: { hand: ["BP03-041"], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP03-041").flush();
    expect([plain.keywords("BP03-041"), plain.stats("opp:V5")]).toEqual([[], [5, 5]]);
  });

  it("042 / 043 Milady, Mystic Queen — summon a Pawn and put one in EX; evolve deals X for Chess followers", () => {
    const t = d({ me: { hand: ["BP03-042"], playPoints: 4 } }).play("BP03-042");
    expect([t.field(), t.ex(), t.stats(PAWN)]).toEqual([["BP03-042", PAWN], [PAWN], [2, 1]]);
    const one = d({ me: { field: ["BP03-042"], evolveDeck: ["BP03-043"], playPoints: 1 }, opp: { field: ["V5"] } });
    one.evolve("BP03-042");
    expect([one.stats("BP03-042"), one.stats("opp:V5")]).toEqual([[3, 3], [5, 4]]);
    const two = d({ me: { field: ["BP03-042", PAWN], evolveDeck: ["BP03-043"], playPoints: 1 }, opp: { field: ["V5", "V3"] } });
    two.evolve("BP03-042").pick("opp:V3");
    expect(two.stats("opp:V3")).toEqual([3, 2]);
  });

  it("044 Check — 4 damage, then a differently named Chess card from the top 3", () => {
    const t = d({ me: { hand: ["BP03-044"], deck: ["BP03-044", "BP03-042", "V1"], playPoints: 3 }, opp: { field: ["V5"] } });
    t.play("BP03-044").pick("BP03-042").order();
    expect([t.stats("opp:V5"), t.hand(), t.zone("me", "deck")]).toEqual([[5, 1], ["BP03-042"], ["BP03-044", "V1"]]);
    const skip = d({ me: { hand: ["BP03-044"], deck: ["BP03-044"], playPoints: 3 }, opp: { field: ["V3"] } });
    skip.play("BP03-044");
    expect([skip.field("opp"), skip.hand(), skip.zone("me", "deck")]).toEqual([[], [], ["BP03-044"]]);
  });

  it("045 Mr. Heinlein, Shadow Mage — mill 4 and recover for each spell; discard a spell to deal 4", () => {
    const t = d({
      me: { hand: ["BP03-045", "BP01-179", "V1"], deck: ["BP01-179", "V1", "BP03-053", "V2"], playPoints: 5 },
      opp: { field: ["V5", "V3"] },
    });
    t.play("BP03-045");
    expect([t.pp(), t.cemetery()]).toEqual([2, ["BP01-179", "V1", "BP03-053", "V2"]]);
    t.activate("BP03-045").pick("opp:V5");
    expect([t.stats("opp:V5"), t.hand(), t.engaged("BP03-045")]).toEqual([[5, 1], ["V1"], true]);
    expect(d({ me: { field: ["BP03-045"], hand: ["V1"] } }).canActivate("BP03-045")).toBe(false);
  });

  it("046 / 047 Magical Knight — another Chess follower gets +1 attack, including one summoned on evolve", () => {
    const t = d({ me: { field: ["BP03-046"], hand: ["BP03-042", "V1"], playPoints: 5 } });
    t.play("V1");
    expect(t.stats("V1")).toEqual([2, 2]);
    t.play("BP03-042").flush();
    expect([t.stats("BP03-042"), t.stats(PAWN + "@field")]).toEqual([[3, 2], [3, 1]]);
    const evo = d({ me: { field: ["BP03-046"], evolveDeck: ["BP03-047"], playPoints: 1 } }).evolve("BP03-046");
    expect([evo.stats("BP03-046"), evo.stats(PAWN)]).toEqual([[4, 4], [3, 1]]);
  });

  it("048 Gingerbread House — Stack, and your leader gains 3 defense", () => {
    const t = d({ me: { hand: ["BP03-048"], playPoints: 1 } }).play("BP03-048");
    expect([t.keywords("BP03-048"), t.counters("BP03-048", "stack"), t.leader()]).toEqual([["stack"], 1, 23]);
  });

  it("049 / 050 Witch of Sweets — evolve for 0 and draw", () => {
    const t = d({ me: { field: ["BP03-049"], evolveDeck: ["BP03-050"], deck: ["V1"], playPoints: 0 } }).evolve("BP03-049");
    expect([t.stats("BP03-049"), t.hand(), t.pp()]).toEqual([[2, 2], ["V1"], 0]);
  });

  it("051 Magical Rook — +1 defense and Ward if a Magical Pawn is in your EX area", () => {
    const yes = d({ me: { hand: ["BP03-051"], ex: [PAWN], playPoints: 1 } }).play("BP03-051");
    expect([yes.stats("BP03-051"), yes.keywords("BP03-051")]).toEqual([[2, 3], ["ward"]]);
    const no = d({ me: { hand: ["BP03-051"], playPoints: 1 } }).play("BP03-051");
    expect([no.stats("BP03-051"), no.keywords("BP03-051")]).toEqual([[2, 2], []]);
  });

  it("052 Magical Bishop — a Pawn in EX; at your end phase, ping and heal if another Chess follower is out", () => {
    const t = d({ me: { hand: ["BP03-052"], field: ["BP03-051"], deck: ["V1"], playPoints: 2 }, opp: { deck: ["V1"] } });
    t.play("BP03-052").end();
    expect([t.ex(), t.leader("opp"), t.leader()]).toEqual([[PAWN], 19, 21]);
    const alone = d({ me: { field: ["BP03-052"], deck: ["V1"] }, opp: { deck: ["V1"] } }).end();
    expect([alone.leader("opp"), alone.leader()]).toEqual([20, 20]);
  });

  it("053 Blitz — 2 damage plus 1 for each Magical Pawn on your field", () => {
    const none = d({ me: { hand: ["BP03-053"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP03-053");
    expect(none.stats("opp:V5")).toEqual([5, 3]);
    const two = d({ me: { hand: ["BP03-053"], field: [PAWN, PAWN], playPoints: 1 }, opp: { field: ["V5", "V3"] } });
    two.play("BP03-053").pick("opp:V3");
    expect(two.field("opp")).toEqual(["V5"]);
  });

  it("054 Witch's Cauldron — Stack; a card with Earth Rite from the top 4", () => {
    const t = d({ me: { hand: ["BP03-054"], deck: ["BP03-041", "V1"], playPoints: 1 } });
    t.play("BP03-054").pick("BP03-041");
    expect([t.keywords("BP03-054"), t.counters("BP03-054", "stack"), t.hand(), t.zone("me", "deck")]).toEqual([
      ["stack"],
      1,
      ["BP03-041"],
      ["V1"],
    ]);
    const skip = d({ me: { hand: ["BP03-054"], deck: ["BP03-041", "V2"], playPoints: 1 } }).play("BP03-054").none().order();
    expect([skip.hand(), skip.zone("me", "deck")]).toEqual([[], ["BP03-041", "V2"]]);
    const none = d({ me: { hand: ["BP03-054"], deck: ["V1"], playPoints: 1 } }).play("BP03-054");
    expect(none.zone("me", "deck")).toEqual(["V1"]);
    // BP22-039's Earth Rite is a way to play it ("When playing this card, Earth Rite (9): ..."): it has Earth Rite too.
    const option = d({ me: { hand: ["BP03-054"], deck: ["BP22-039", "V1"], playPoints: 1 } });
    option.play("BP03-054").pick("BP22-039");
    expect(option.hand()).toEqual(["BP22-039"]);
  });
});
