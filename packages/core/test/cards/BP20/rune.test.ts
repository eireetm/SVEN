import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP20 Runecraft (037–055, T03, T04). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); KILL (1) is a spell; QUICK-SAC (0)
// destroys one of your followers. Idolatry: BP20-040 Axia (2c), BP20-050 (1c), BP20-055 (an amulet). Omen–Mage: BP20-038
// Velharia (2c), BP20-049 (a spell). Tokens: BP20-T03 White Psalm, BP20-T04 Black Psalm, BP15-PR12 Melodious Monody,
// BP15-PR11 Ersatz Elimination, BP06-T02 Paper Shikigami.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id: string) => Array<string>(count).fill(id);
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };
const WHITE = "BP20-T03";
const BLACK = "BP20-T04";
const MONODY = "BP15-PR12";
const ERSATZ = "BP15-PR11";

describe("BP20 Runecraft", () => {
  it("037 Lishenna, Melody Manifest — Fanfare: destroy another Idolatry card of yours and a Melodious Monody, or a White Psalm", () => {
    const t = d({ me: { hand: ["BP20-037"], field: ["BP20-040"], playPoints: 2 } }).play("BP20-037").choose("destroy");
    expect([t.field(), t.ex()]).toEqual([["BP20-037"], [MONODY]]);
    expect(d({ me: { hand: ["BP20-037"], playPoints: 2 } }).play("BP20-037").field()).toEqual(["BP20-037", WHITE]);
  });

  it("038 / 039 Velharia, Heir to Truth — Fanfare: draw; evolved: destroy; super-evolved: a 9-cost or less Runecraft spell from the cemetery into the EX area, 3 less", () => {
    expect(d({ me: { hand: ["BP20-038"], deck: ["V1"], playPoints: 2 } }).play("BP20-038").hand()).toEqual(["V1"]);
    expect(d({ me: { field: ["BP20-038"], evolveDeck: ["BP20-039"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP20-038").field("opp")).toEqual([]);
    const s = d({ me: { field: ["BP20-038"], evolveDeck: ["BP20-039"], cemetery: ["BP20-045"], playPoints: 1, ...SUPER }, opp: { field: ["V5"] } });
    s.evolve("BP20-038", { sep: true }).flush();
    expect([s.ex(), s.field("opp"), s.pp()]).toEqual([["BP20-045"], [], 0]);
  });

  it("040 / 041 Axia, Heir to Destruction — evolved: once per turn an Idolatry amulet entering: 2 damage; bury another Idolatry card: a Lishenna follower; super-evolved: damage per Idolatry card", () => {
    const t = d({ me: { field: [{ card: "BP20-040", evolvedInto: "BP20-041" }], hand: ["BP20-055", "BP20-055"], playPoints: 2 }, opp: { field: ["V5"] } });
    t.play("BP20-055").flush();
    expect(t.stats("opp:V5")).toEqual([5, 3]);
    t.play("BP20-055").flush();
    expect(t.stats("opp:V5")).toEqual([5, 3]);
    const e = d({ me: { field: ["BP20-040", "BP20-050"], evolveDeck: ["BP20-041"], deck: ["V1", "BP20-037"], playPoints: 1 } }).evolve("BP20-040").yes().pick("BP20-037");
    expect([e.hand(), e.field()]).toEqual([["BP20-037"], ["BP20-040"]]);
    const s = d({ me: { field: ["BP20-040", "BP20-050", "BP20-055"], evolveDeck: ["BP20-041"], playPoints: 1, ...SUPER } });
    s.evolve("BP20-040", { sep: true }).flush().no().flush();
    expect(s.leader("opp")).toBe(17);
  });

  it("042 / 043 Raio, Elimination Manifest — not from the hand: evolves; act in the hand, discard it and an Omen–Mage spell: an Ersatz Elimination; evolved: 9 to each enemy follower, 2 Ersatz Eliminations 1 less", () => {
    const act = d({ me: { hand: ["BP20-042", "BP20-049"] } }).activate("BP20-042@hand");
    expect([act.ex(), act.cemetery()]).toEqual([[ERSATZ], ["BP20-042", "BP20-049"]]);
    const t = d({ me: { ex: ["BP20-042"], evolveDeck: ["BP20-043"], playPoints: 9 }, opp: { field: ["V5", "V3"] } }).play("BP20-042@ex").yes();
    expect([t.field("opp"), t.ex(), t.canPlay(`${ERSATZ}@ex`)]).toEqual([[], [ERSATZ, ERSATZ], false]);
  });

  it("044 Congregant of Destruction — Fanfare / act once per turn, bury another Idolatry card: destroy an enemy follower, 2 to its leader", () => {
    const t = d({ me: { hand: ["BP20-044"], field: ["BP20-050", "BP20-040"], playPoints: 6 }, opp: { field: ["V5", "V3"] } }).play("BP20-044").yes().pick("opp:V5").pick("BP20-050");
    expect([t.field("opp"), t.leader("opp"), t.field()]).toEqual([["V3"], 18, ["BP20-040", "BP20-044"]]);
    t.activate("BP20-044");
    expect([t.field("opp"), t.leader("opp"), t.canActivate("BP20-044")]).toEqual([[], 16, false]);
  });

  it("045 Devastating Soprano — destroy an Idolatry card of yours and draw, or a White Psalm", () => {
    const t = d({ me: { hand: ["BP20-045"], field: ["BP20-050"], deck: ["V1"], playPoints: 1 } }).play("BP20-045").choose("destroy");
    expect([t.field(), t.hand()]).toEqual([[], ["V1"]]);
    expect(d({ me: { hand: ["BP20-045"], playPoints: 1 } }).play("BP20-045").field()).toEqual([WHITE]);
  });

  it("046 / 047 Congregant of Truth — not from the hand: evolves; evolved: 3 damage, draw, discard", () => {
    const t = d({ me: { ex: ["BP20-046"], evolveDeck: ["BP20-047"], hand: ["V3"], deck: ["V1"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP20-046@ex").yes().pick("V3");
    expect([t.stats("opp:V5"), t.hand(), t.cemetery()]).toEqual([[5, 2], ["V1"], ["V3"]]);
    expect(d({ me: { hand: ["BP20-046"], evolveDeck: ["BP20-047"], playPoints: 3 } }).play("BP20-046").canEvolve("BP20-046")).toBe(false);
  });

  it("048 Supplicant of Destruction — act, engage and bury another Idolatry card: 2 damage to an enemy leader or follower", () => {
    const t = d({ me: { field: ["BP20-048", "BP20-050"] }, opp: { field: ["V5"] } }).activate("BP20-048").pick("opp:leader");
    expect([t.leader("opp"), t.field(), t.engaged("BP20-048")]).toEqual([18, ["BP20-048"], true]);
    expect(d({ me: { field: ["BP20-048"] }, opp: { field: ["V5"] } }).canActivate("BP20-048")).toBe(false);
  });

  it("049 Illusory Conjuration — an Omen–Mage card from the top 3 into the hand or the EX area", () => {
    const t = d({ me: { hand: ["BP20-049"], deck: ["V1", "BP20-038", "V3"], playPoints: 1 } }).play("BP20-049").pick("BP20-038").choose("ex").order();
    expect([t.ex(), t.hand()]).toEqual([["BP20-038"], []]);
  });

  it("050 / 051 Devotee of Destruction — Assail; evolved, bury another Idolatry card: draw", () => {
    const t = d({ me: { field: ["BP20-050", "BP20-040"], evolveDeck: ["BP20-051"], deck: ["V1"], playPoints: 1 } }).evolve("BP20-050").yes();
    expect([t.hand(), t.field(), t.keywords("BP20-050")]).toEqual([["V1"], ["BP20-050"], ["assail"]]);
  });

  it("052 Supplicant of Truth — Ward; Fanfare: draw 2, discard, +0/+2 if not from the hand", () => {
    const t = d({ me: { ex: ["BP20-052"], deck: ["V1", "V3"], playPoints: 3 } }).play("BP20-052@ex").none().pick("V3");
    expect([t.hand(), t.stats("BP20-052")]).toEqual([["V1"], [3, 5]]);
    expect(d({ me: { hand: ["BP20-052"], deck: ["V1", "V3"], playPoints: 3 } }).play("BP20-052").none().pick("V3").stats("BP20-052")).toEqual([3, 3]);
  });

  it("053 Devotee of Truth — Fanfare: draw, discard, leader +2 if not from the hand", () => {
    expect(d({ me: { ex: ["BP20-053"], deck: ["V1"], playPoints: 2 } }).play("BP20-053@ex").leader()).toBe(22);
    expect(d({ me: { hand: ["BP20-053"], deck: ["V1"], playPoints: 2 } }).play("BP20-053").leader()).toBe(20);
  });

  it("054 Ascetic of Wuxing — Fanfare, discard: an Onmyoji follower or a spell from the top 3; act, engage, with 7 Onmyoji cards and/or spells in the cemetery: a Paper Shikigami", () => {
    const t = d({ me: { hand: ["BP20-054", "V1"], deck: ["V3", "KILL", "V5"], playPoints: 2 } }).play("BP20-054").yes().pick("KILL").order();
    expect([t.hand(), t.cemetery()]).toEqual([["KILL"], ["V1"]]);
    expect(d({ me: { field: ["BP20-054"], cemetery: n(7, "KILL") } }).activate("BP20-054").field()).toEqual(["BP20-054", "BP06-T02"]);
    expect(d({ me: { field: ["BP20-054"], cemetery: n(6, "KILL") } }).canActivate("BP20-054")).toBe(false);
  });

  it("055 Wasteland of Destruction — Fanfare: an Omen–Idolatry card from the top 2; act, bury this: bury another Idolatry card (also without one)", () => {
    expect(d({ me: { hand: ["BP20-055"], deck: ["V1", "BP20-050"], playPoints: 1 } }).play("BP20-055").pick("BP20-050").hand()).toEqual(["BP20-050"]);
    expect(d({ me: { field: ["BP20-055", "BP20-050"] } }).activate("BP20-055").field()).toEqual([]);
    expect(d({ me: { field: ["BP20-055"] } }).activate("BP20-055").field()).toEqual([]);
  });

  it("T03 / T04 White and Black Psalm, New Revelation — act, engage 3 Idolatry cards (itself too): bury this; Last Words: the other one, leader +1 / 1 to each enemy leader", () => {
    const t = d({ me: { field: [WHITE, "BP20-050", "BP20-040"] } }).activate(WHITE);
    expect([t.field(), t.leader(), t.engaged("BP20-050")]).toEqual([["BP20-050", "BP20-040", BLACK], 21, true]);
    const b = d({ me: { field: [BLACK, "BP20-050", "BP20-040"] } }).activate(BLACK);
    expect([b.field(), b.leader("opp")]).toEqual([["BP20-050", "BP20-040", WHITE], 19]);
    expect(d({ me: { field: [WHITE, "BP20-050"] } }).canActivate(WHITE)).toBe(false);
  });
});
