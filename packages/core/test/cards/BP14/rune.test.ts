import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP14 Runecraft (036–052). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral); QUICK-SAC destroys one
// of your followers. Festive: BP14-008 (2, Forestcraft). BP14-043 Orchestral Mage is Festive and Mage (3).
// Earth Rite followers: BP01-054 Ancient Alchemist (3), BP01-051 Arch Summoner Erasmus (7). BP09-049 Onion
// Patch. Token: BP01-T10 Magic Sediment (Stack).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const SEDIMENT = "BP01-T10";
const n = (count: number, id = "V1") => Array<string>(count).fill(id);

describe("BP14 Runecraft", () => {
  it("036 Yukishima — Fanfare: the next Festive / Mage card (3 or less) costs 3 less; playing one: 2 damage to an enemy follower", () => {
    const t = d({ me: { hand: ["BP14-036", "BP14-043", "V3"], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP14-036");
    expect([t.canPlay("BP14-043"), t.canPlay("V3")]).toEqual([true, false]);
    // Orchestral Mage: Yukishima's 2 damage, and its own Fanfare (Yukishima is another Festive card).
    t.play("BP14-043").flush().choose("storm");
    expect([t.stats("opp:V5"), t.keywords("BP14-043"), t.pp()]).toEqual([[5, 3], ["storm"], 0]);
  });

  it("037 / 038 Riley — Fanfare: a Magic Sediment; evolves only after Earth Rite removed 2 Stack counters this turn; evolved: a follower with Earth Rite (up to your max play points) from the deck", () => {
    expect(d({ me: { hand: ["BP14-037"], playPoints: 2 } }).play("BP14-037").field()).toEqual(["BP14-037", SEDIMENT]);
    const t = d({
      me: {
        field: ["BP14-037", { card: SEDIMENT, counters: { stack: 3 } }],
        evolveDeck: ["BP14-038"],
        hand: ["BP14-050", "BP14-050"],
        deck: ["BP14-037", "BP01-051", "BP01-054", "V1"],
        playPoints: 8,
        maxPlayPoints: 5,
      },
      opp: { field: ["V5", "V5"] },
    });
    expect(t.canEvolve("BP14-037")).toBe(false);
    t.play("BP14-050").yes().pick("opp:V5");
    expect(t.canEvolve("BP14-037")).toBe(false);
    t.play("BP14-050").yes();
    expect(t.canEvolve("BP14-037")).toBe(true);
    t.evolve("BP14-037");
    // Riley itself has no Earth Rite (ruling); Erasmus costs more than 5.
    expect(() => t.pick("BP14-037")).toThrow(/not a candidate/);
    expect(() => t.pick("BP01-051")).toThrow(/not a candidate/);
    t.pick("BP01-054").no();
    expect(t.field()).toEqual(["BP14-037", SEDIMENT, "BP01-054"]);
  });

  it("039 / 040 Bergent — not from the EX area; in the EX area at your end phase: an Onion Patch on top may be summoned, otherwise top or bottom; evolved: discard an Onion Patch to draw 2; Last Words: may go into the EX area", () => {
    expect(d({ me: { ex: ["BP14-039"], playPoints: 2 } }).canPlay("BP14-039@ex")).toBe(false);
    const t = d({ me: { ex: ["BP14-039"], deck: ["BP09-049", "V1"] }, opp: { deck: n(2) } }).end().pick("BP09-049");
    expect(t.field()).toEqual(["BP09-049"]);
    const other = d({ me: { ex: ["BP14-039"], deck: ["V3", "V1", "V2"] }, opp: { deck: n(2) } }).end().choose("bottom");
    // The opponent's turn: my deck is V1, V2, V3.
    expect(other.zone("me", "deck")).toEqual(["V1", "V2", "V3"]);
    const evo = d({ me: { field: ["BP14-039"], evolveDeck: ["BP14-040"], hand: ["BP09-049"], deck: ["V1", "V2"], playPoints: 1 } }).evolve("BP14-039").yes();
    expect([evo.hand(), evo.cemetery()]).toEqual([["V1", "V2"], ["BP09-049"]]);
    const lw = d({ me: { field: [{ card: "BP14-039", evolvedInto: "BP14-040" }], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").yes();
    expect(lw.ex()).toEqual(["BP14-039"]);
  });

  it("041 Arctic Chimera — Rush; Strike: damage equal to its attack; Last Words, Earth Rite: back onto the field as a 2/2 with Storm", () => {
    const t = d({ me: { field: ["BP14-041", SEDIMENT] }, opp: { field: [{ card: "V5", engaged: true }, "V3"] } });
    t.attack("BP14-041", "opp:V5").pick("opp:V3").yes();
    expect([t.field("opp"), t.field(), t.stats("BP14-041"), t.keywords("BP14-041")]).toEqual([[], ["BP14-041"], [2, 2], ["rush", "storm"]]);
    const noRite = d({ me: { field: ["BP14-041"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC");
    expect([noRite.field(), noRite.cemetery()]).toEqual([[], ["BP14-041", "QUICK-SAC"]]);
  });

  it("042 Story of a Lifetime — 2 of the top 4 to the hand (both must be taken), the rest buried; recover 1 with Yukishima", () => {
    const t = d({ me: { hand: ["BP14-042"], field: ["BP14-036"], deck: ["V1", "V2", "V3", "V5", "V1"], playPoints: 3 } }).play("BP14-042");
    expect(() => t.pick("V3")).toThrow();
    t.pick("V3", "V5");
    expect([t.hand(), t.cemetery(), t.zone("me", "deck"), t.pp()]).toEqual([["V3", "V5"], ["V1", "V2", "BP14-042"], ["V1"], 1]);
  });

  it("043 / 044 Orchestral Mage — Fanfare: Storm or Drain after another Festive card this turn; evolved: 2 x the Festive / Mage cards played this turn", () => {
    expect(d({ me: { hand: ["BP14-043"], playPoints: 3 } }).play("BP14-043").keywords("BP14-043")).toEqual([]);
    const t = d({ me: { hand: ["BP14-008", "BP14-043"], evolveDeck: ["BP14-044"], playPoints: 6 }, opp: { field: ["V5"] } });
    t.play("BP14-008").no().play("BP14-043").choose("drain");
    expect(t.keywords("BP14-043")).toEqual(["drain"]);
    expect(t.evolve("BP14-043").stats("opp:V5")).toEqual([5, 1]);
  });

  it("045 Tempestuous Alchemist — Fanfare: 3 damage and a Stack +1 (a Magic Sediment without one)", () => {
    const t = d({ me: { hand: ["BP14-045"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP14-045");
    expect([t.stats("opp:V5"), t.field(), t.counters(SEDIMENT, "stack")]).toEqual([[5, 2], ["BP14-045", SEDIMENT], 1]);
    const more = d({ me: { hand: ["BP14-045"], field: [SEDIMENT], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP14-045");
    expect(more.counters(SEDIMENT, "stack")).toBe(2);
  });

  it("046 Dream Come True — top cards into the EX area until it is full; the next of them played costs 0", () => {
    const t = d({ me: { hand: ["BP14-046"], ex: ["V2"], deck: ["V3", "V5", "V1", "V1", "V3"], playPoints: 7 } }).play("BP14-046");
    expect([t.ex(), t.zone("me", "deck"), t.canPlay("V5@ex"), t.canPlay("V2@ex")]).toEqual([["V2", "V3", "V5", "V1", "V1"], ["V3"], true, false]);
    t.play("V5@ex");
    expect([t.field(), t.canPlay("V3@ex")]).toEqual([["V5"], false]);
    // An empty deck just stops it (ruling).
    expect(d({ me: { hand: ["BP14-046"], deck: ["V1"], playPoints: 7 } }).play("BP14-046").ex()).toEqual(["V1"]);
  });

  it("047 / 048 Chakram Wizard — Fanfare: 3 damage with another Mage follower; evolved: 3 damage, draw, discard", () => {
    expect(d({ me: { hand: ["BP14-047"], field: ["BP14-037"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP14-047").stats("opp:V5")).toEqual([5, 2]);
    expect(d({ me: { hand: ["BP14-047"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP14-047").stats("opp:V5")).toEqual([5, 5]);
    const evo = d({ me: { field: ["BP14-047"], evolveDeck: ["BP14-048"], deck: ["V1"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP14-047");
    expect([evo.stats("opp:V5"), evo.hand(), evo.cemetery()]).toEqual([[5, 2], [], ["V1"]]);
  });

  it("049 Owl Receptionist — Fanfare: the next Festive / Mage card (3 or less) costs 3 less; leader +2 with Yukishima", () => {
    // Yukishima's own trigger (the Owl is a 3-cost Festive card) and the Fanfare are both pending.
    const t = d({ me: { hand: ["BP14-049", "BP14-042"], field: ["BP14-036"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP14-049").flush();
    expect([t.leader(), t.stats("opp:V5"), t.canPlay("BP14-042")]).toEqual([22, [5, 3], true]);
    expect(d({ me: { hand: ["BP14-049"], playPoints: 3 } }).play("BP14-049").leader()).toBe(20);
  });

  it("050 Earthen Fist — Quick; 5 damage; Earth Rite: 2 to its leader", () => {
    const t = d({ me: { hand: ["BP14-050"], field: [SEDIMENT], playPoints: 3 }, opp: { field: ["V5"] } });
    expect(t.keywords("BP14-050")).toEqual(["quick"]);
    t.play("BP14-050").yes();
    expect([t.field("opp"), t.leader("opp"), t.field()]).toEqual([[], 18, []]);
    expect(d({ me: { hand: ["BP14-050"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP14-050").leader("opp")).toBe(20);
  });

  it("051 Magical Reserves — draw 2, then damage equal to your hand size to each enemy follower", () => {
    const t = d({ me: { hand: ["BP14-051", "V1"], deck: ["V1", "V2"], playPoints: 6 }, opp: { field: ["V5", "V3"] } }).play("BP14-051");
    // 3 cards in hand after drawing.
    expect([t.stats("opp:V5"), t.stats("opp:V3")]).toEqual([
      [5, 2],
      [3, 1],
    ]);
  });

  it("052 Grand Spire — Stack; Fanfare: 2 damage", () => {
    const t = d({ me: { hand: ["BP14-052"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP14-052");
    expect([t.stats("opp:V5"), t.keywords("BP14-052"), t.counters("BP14-052", "stack")]).toEqual([[5, 3], ["stack"], 1]);
  });
});
