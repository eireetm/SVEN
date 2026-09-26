import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP15 Runecraft (038–056, PR11, PR12). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral); KILL (1) destroys
// an enemy follower; QUICK-SAC (0) destroys one of your followers. BP05-035 is Raio, Omen of Truth (7); BP05-037
// Lishenna, Omen of Destruction (4); Idolatry: BP05-048 Servant of Destruction, BP05-T01 Destruction in White
// (amulet); Onmyoji: BP06-042 Shikigami Summons (spell), BP06-044 Demoncaller (3), BP06-048 Talisman Disciple (1).
// Tokens: BP15-PR11 Ersatz Elimination, BP15-PR12 Melodious Monody, BP06-T02 Paper Shikigami, BP01-T10 Magic
// Sediment (Stack).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const ERSATZ = "BP15-PR11";
const MONODY = "BP15-PR12";
const PAPER = "BP06-T02";
const SEDIMENT = "BP01-T10";
const IDOL = "BP05-048";
const n = (count: number, id = "V1") => Array<string>(count).fill(id);

describe("BP15 Runecraft", () => {
  it("038 Raio, Truthful Elimination — 9 less for burying 3 Mage followers (2 or more); Fanfare: a card from the top 3 into the EX area; act, discard a Raio, Omen of Truth: 9 damage and an Ersatz Elimination", () => {
    const t = d({ me: { hand: ["BP15-038"], field: n(3, "BP15-051"), deck: ["V1"], playPoints: 0 } }).play("BP15-038").pick("V1");
    expect([t.field(), t.cemetery(), t.ex()]).toEqual([["BP15-038"], n(3, "BP15-051"), ["V1"]]);
    expect(d({ me: { hand: ["BP15-038"], field: ["BP15-051", "BP15-051", "V2"], playPoints: 0 } }).canPlay("BP15-038")).toBe(false);
    const act = d({ me: { field: ["BP15-038"], hand: ["BP05-035"] }, opp: { field: ["V5"] } }).activate("BP15-038");
    expect([act.field("opp"), act.ex(), act.cemetery()]).toEqual([[], [ERSATZ], ["BP05-035"]]);
    expect(d({ me: { field: ["BP15-038"], hand: ["BP05-035"] } }).canActivate("BP15-038")).toBe(false);
  });

  it("039 / 040 Lishenna, Melodious Destruction — Fanfare: a Melodious Monody with 3 Idolatry cards on your field; evolved: up to 2 Idolatry cards from the top 4 into the EX area", () => {
    expect(d({ me: { hand: ["BP15-039"], field: [IDOL, "BP05-T01"], playPoints: 3 } }).play("BP15-039").ex()).toEqual([MONODY]);
    expect(d({ me: { hand: ["BP15-039"], field: [IDOL], playPoints: 3 } }).play("BP15-039").ex()).toEqual([]);
    const evo = d({ me: { field: ["BP15-039"], evolveDeck: ["BP15-040"], deck: [IDOL, "V1", "BP15-054", "V3"], playPoints: 1 } }).evolve("BP15-039").pick(IDOL, "BP15-054").order();
    expect(evo.ex()).toEqual([IDOL, "BP15-054"]);
  });

  it("041 Kuon, Wuxing Master — 1 less for revealing 2 Onmyoji cards; Fanfare: draw, discard; adv (4): a Noble Shikigami from the evolve deck with 7 spells / Onmyoji cards in the cemetery; act, engage: an Onmyoji follower (4 or less) from the cemetery", () => {
    const t = d({ me: { hand: ["BP15-041", "BP06-048", "BP06-042"], deck: ["V1"], playPoints: 4 } }).play("BP15-041").pick("V1");
    expect([t.pp(), t.hand(), t.cemetery()]).toEqual([0, ["BP06-048", "BP06-042"], ["V1"]]);
    expect(d({ me: { hand: ["BP15-041", "BP06-048"], playPoints: 4 } }).canPlay("BP15-041")).toBe(false);
    const adv = d({ me: { field: ["BP15-041"], evolveDeck: ["BP15-042"], cemetery: n(7, "BP06-042"), playPoints: 4 }, opp: { field: ["V5"] } });
    adv.activate("BP15-041").pick("BP15-042").none();
    expect([adv.field(), adv.field("opp"), adv.leader("opp"), adv.pp()]).toEqual([["BP15-041", "BP15-042"], [], 15, 0]);
    expect(d({ me: { field: ["BP15-041"], evolveDeck: ["BP15-042"], cemetery: n(6, "BP06-042"), playPoints: 4 } }).canActivate("BP15-041")).toBe(false);
    // A faceup (used) Noble Shikigami can't be summoned (CR 4.6.3).
    const used = d({ me: { field: ["BP15-041"], faceUpEvolveDeck: ["BP15-042"], cemetery: n(7, "BP06-042"), playPoints: 4 } }).activate("BP15-041");
    expect([used.field(), used.pp()]).toEqual([["BP15-041"], 0]);
    const act = d({ me: { field: ["BP15-041"], cemetery: ["BP06-044", "BP06-039"] } }).activate("BP15-041").pick("BP06-044");
    expect([act.field(), act.engaged("BP15-041")]).toEqual([["BP15-041", "BP06-044"], true]);
  });

  it("042 Noble Shikigami — Ward; takes no ability damage", () => {
    const t = d({ me: { ex: ["BP15-T01"], playPoints: 2 }, opp: { field: ["BP15-042"] } }).play("BP15-T01@ex");
    expect([t.stats("opp:BP15-042"), t.keywords("opp:BP15-042")]).toEqual([[5, 5], ["ward"]]);
  });

  it("043 / 044 Acid Golem — Fanfare, Earth Rite: 2 damage to an enemy leader or follower; evolved: 2 damage to an enemy follower", () => {
    const t = d({ me: { hand: ["BP15-043"], field: [SEDIMENT], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP15-043").yes().pick("opp:V5");
    expect([t.stats("opp:V5"), t.field()]).toEqual([[5, 3], ["BP15-043"]]);
    expect(d({ me: { hand: ["BP15-043"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP15-043").stats("opp:V5")).toEqual([5, 5]);
    expect(d({ me: { field: ["BP15-043"], evolveDeck: ["BP15-044"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP15-043").stats("opp:V5")).toEqual([5, 3]);
  });

  it("045 Melody's Return — banish a Lishenna follower from the cemetery; a Lishenna follower from the deck with 2 Idolatry cards on your field", () => {
    const t = d({ me: { hand: ["BP15-045"], field: [IDOL, IDOL], cemetery: ["BP05-037"], deck: ["V1", "BP15-039"], playPoints: 2 } }).play("BP15-045").pick("BP15-039");
    expect([t.field(), t.zone("me", "banished"), t.ex()]).toEqual([[IDOL, IDOL, "BP15-039"], ["BP05-037"], [MONODY]]);
    expect(d({ me: { hand: ["BP15-045"], field: [IDOL, IDOL], playPoints: 2 } }).canPlay("BP15-045")).toBe(false);
  });

  it("046 Secrets of Onmyodo — reveal 2 Onmyoji cards; (X): an Onmyoji follower (X or less) from the deck, and a Paper Shikigami costing 1 less with 7 spells / Onmyoji cards in the cemetery", () => {
    const t = d({ me: { hand: ["BP15-046", "BP06-048", "BP06-042"], deck: ["BP06-044", "V1"], cemetery: n(7, "BP06-042"), playPoints: 4 } });
    t.play("BP15-046").yes().choose("3").pick("BP06-044");
    expect([t.field(), t.ex(), t.pp(), t.canPlay(`${PAPER}@ex`)]).toEqual([["BP06-044"], [PAPER], 1, true]);
    expect(d({ me: { hand: ["BP15-046", "BP06-048"], playPoints: 4 } }).canPlay("BP15-046")).toBe(false);
  });

  it("047 / 048 Adherent of Elimination — Fanfare: evolves unless it came from the hand; evolved: 2 damage or a Raio follower from the deck", () => {
    const t = d({ me: { ex: [ERSATZ], cemetery: ["BP15-047"], evolveDeck: ["BP15-048"], playPoints: 1 }, opp: { field: ["V5"] } }).play(`${ERSATZ}@ex`).yes().choose("damage");
    expect([t.stats("BP15-047"), t.stats("opp:V5")]).toEqual([[3, 3], [5, 3]]);
    expect(d({ me: { hand: ["BP15-047"], evolveDeck: ["BP15-048"], playPoints: 2 } }).play("BP15-047").stats("BP15-047")).toEqual([2, 2]);
    const raio = d({ me: { field: ["BP15-047"], evolveDeck: ["BP15-048"], deck: ["V1", "BP15-038"], playPoints: 1 } }).evolve("BP15-047").pick("BP15-038");
    expect(raio.hand()).toEqual(["BP15-038"]);
  });

  it("049 Adherent of Melody — Fanfare: an Idolatry card from the top 3", () => {
    expect(d({ me: { hand: ["BP15-049"], deck: ["V1", IDOL, "V3"], playPoints: 2 } }).play("BP15-049").pick(IDOL).order().hand()).toEqual([IDOL]);
  });

  it("050 Elimination Unleashed — up to 3 Omen Mage followers (total 9 or less) from the cemetery, destroyed at the start of your end phase", () => {
    const t = d({ me: { hand: ["BP15-050"], cemetery: ["BP05-035", "BP15-047", "BP15-053"], playPoints: 6 } }).play("BP15-050").pick("BP05-035").pick("BP15-047").flush();
    expect(t.field()).toEqual(["BP05-035", "BP15-047"]);
    t.end().flush();
    expect(t.cemetery()).toEqual(["BP15-053", "BP15-050", "BP05-035", "BP15-047"]);
  });

  it("051 / 052 Scroll Wizard — evolved: discard a spell for 4 damage to each enemy follower", () => {
    const t = d({ me: { field: ["BP15-051"], evolveDeck: ["BP15-052"], hand: ["KILL"], playPoints: 1 }, opp: { field: ["V5", "V3"] } }).evolve("BP15-051").yes();
    expect([t.field("opp"), t.stats("opp:V5"), t.cemetery()]).toEqual([["V5"], [5, 1], ["KILL"]]);
  });

  it("053 Hermit of Truth — Fanfare: another Omen Mage follower from the cemetery into the EX area, 3 less this turn unless this came from the hand", () => {
    const t = d({ me: { hand: ["BP15-053"], cemetery: ["BP15-047", "BP15-053"], playPoints: 3 } }).play("BP15-053");
    expect([t.ex(), t.cemetery()]).toEqual([["BP15-047"], ["BP15-053"]]);
    const other = d({ me: { ex: [ERSATZ], cemetery: ["BP15-053", "BP05-035"], playPoints: 5 } }).play(`${ERSATZ}@ex`);
    expect([other.field(), other.ex(), other.canPlay("BP05-035@ex")]).toEqual([["BP15-053"], ["BP05-035"], true]);
    const fromHand = d({ me: { hand: ["BP15-053"], cemetery: ["BP05-035"], playPoints: 7 } }).play("BP15-053");
    expect(fromHand.canPlay("BP05-035@ex")).toBe(false);
  });

  it("054 Hermit of Destruction — Fanfare: 3 damage with 3 Idolatry cards on your field", () => {
    expect(d({ me: { hand: ["BP15-054"], field: [IDOL, IDOL], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP15-054").stats("opp:V5")).toEqual([5, 2]);
    expect(d({ me: { hand: ["BP15-054"], field: [IDOL], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP15-054").stats("opp:V5")).toEqual([5, 5]);
  });

  it("055 Crystal Witch — 2 less with 2 Mage followers on your field; Fanfare: draw, discard", () => {
    const t = d({ me: { hand: ["BP15-055", "V3"], field: ["BP15-051", "BP15-051"], deck: ["V1"], playPoints: 1 } }).play("BP15-055").pick("V3");
    expect([t.hand(), t.cemetery()]).toEqual([["V1"], ["V3"]]);
    expect(d({ me: { hand: ["BP15-055"], field: ["BP15-051", "V2"], playPoints: 1 } }).canPlay("BP15-055")).toBe(false);
  });

  it("056 Twinblade Mage — 6 less with 6 different base costs in the cemetery; Storm; Fanfare: 3 damage to up to 2 enemy followers", () => {
    const six = ["QUICK-SAC", "V1", "V2", "V3", "BP05-037", "V5"];
    const t = d({ me: { hand: ["BP15-056"], cemetery: six, playPoints: 2 }, opp: { field: ["V5", "V3", "V1"] } }).play("BP15-056").pick("opp:V3", "opp:V1");
    expect([t.field("opp"), t.stats("opp:V3"), t.keywords("BP15-056")]).toEqual([["V5", "V3"], [3, 1], ["storm"]]);
    expect(d({ me: { hand: ["BP15-056"], cemetery: [...six.slice(1), "V1"], playPoints: 2 } }).canPlay("BP15-056")).toBe(false);
  });

  it("PR11 Ersatz Elimination — an Omen Mage follower (3 or less) from the cemetery", () => {
    expect(d({ me: { ex: [ERSATZ], cemetery: ["BP05-035"], playPoints: 1 } }).canPlay(`${ERSATZ}@ex`)).toBe(false);
  });

  it("PR12 Melodious Monody — engage any number of Idolatry cards for 2 damage each", () => {
    const t = d({ me: { ex: [MONODY], field: [IDOL, IDOL, "BP05-T01"] }, opp: { field: ["V5"] } }).play(`${MONODY}@ex`).pick(IDOL, "BP05-T01");
    expect([t.stats("opp:V5"), t.engaged(IDOL), t.engaged("BP05-T01")]).toEqual([[5, 1], true, true]);
    expect(d({ me: { ex: [MONODY], field: [IDOL] }, opp: { field: ["V5"] } }).play(`${MONODY}@ex`).none().stats("opp:V5")).toEqual([5, 5]);
  });
});
