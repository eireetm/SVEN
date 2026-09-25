import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP09 Runecraft (035–051). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5; KILL is a spell (for Spellchain);
// QUICK-SAC destroys a follower of yours (0). BP01-T10 Magic Sediment has Stack (Earth Rite).
// Earth Sigil amulets: BP01-075 (1), BP01-074 (2), BP01-066 (3). BP02-046 Craig is an Academic
// follower. Tokens: BP09-T01 Instant Poison, BP09-T02 Eternal Potion, BP01-T08 Strikeform Golem,
// BP01-T09 Guardform Golem.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const SEDIMENT = "BP01-T10";
const POISON = "BP09-T01";
const ACADEMICS = ["BP02-046", "BP02-046", "BP02-046", "BP02-046", "BP02-046"];
const ONIONS = ["BP09-049", "BP09-049", "BP09-049", "BP09-049", "BP09-049"];

describe("BP09 Runecraft", () => {
  it("035 Ceridwen — Earth Rite: an Instant Poison into the EX area (nothing asked without a Stack)", () => {
    const t = d({ me: { hand: ["BP09-035"], field: [SEDIMENT] } }).play("BP09-035").yes();
    expect([t.ex(), t.field()]).toEqual([[POISON], ["BP09-035"]]);
    expect(d({ me: { hand: ["BP09-035"] } }).play("BP09-035").ex()).toEqual([]);
  });

  it("036 Ceridwen (Evolved) — Earth Rite: an Eternal Potion; the turn's 1st Forbidden token costs 2 less (not after one was played)", () => {
    const evo = d({ me: { field: ["BP09-035", SEDIMENT], evolveDeck: ["BP09-036"] } }).evolve("BP09-035").yes();
    expect(evo.ex()).toEqual(["BP09-T02"]);
    const ceridwen = { card: "BP09-035", evolvedInto: "BP09-036" };
    const t = d({ me: { field: [ceridwen], ex: [POISON, POISON], playPoints: 2 }, opp: { field: ["V5", "V1"] } });
    t.play(POISON).pick("opp:V5");
    expect([t.pp(), t.stats("opp:V5"), t.leader("opp")]).toEqual([2, [5, 1], 18]);
    t.play(POISON).pick("opp:V1");
    expect(t.pp()).toBe(0);
    // A Forbidden token played before it evolved was that turn's first (ruling).
    const before = d({ me: { field: ["BP09-035"], evolveDeck: ["BP09-036"], ex: [POISON, POISON], playPoints: 5 }, opp: { field: ["V5", "V5"] } });
    before.play(POISON).pick("opp:V5").evolve("BP09-035");
    expect([before.pp(), before.canPlay(POISON)]).toEqual([2, true]);
    before.play(POISON).pick("opp:V5");
    expect(before.pp()).toBe(0);
  });

  it("037 Faust — up to 2 Earth Sigil amulets totalling 4 or less into the EX area, free this turn; end phase, Earth Rite: +1/+1 and 2 to each enemy leader", () => {
    const t = d({ me: { hand: ["BP09-037"], deck: ["BP01-075", "BP01-074", "BP01-066", "V1"], playPoints: 5 } });
    t.play("BP09-037").pick("BP01-066").pick("BP01-075");
    expect([t.ex(), t.canPlay("BP01-075"), t.canPlay("BP01-066")]).toEqual([["BP01-066", "BP01-075"], true, true]);
    const end = d({ me: { field: ["BP09-037", SEDIMENT] }, opp: { deck: ["V1"] } }).end().yes();
    expect([end.stats("BP09-037"), end.leader("opp")]).toEqual([[5, 5], 18]);
  });

  it("038 / 039 Mysterian Wyrmist — discard an Academic card to draw, or it goes to the cemetery; evolves with 5 Academic cards in the cemetery", () => {
    const keep = d({ me: { hand: ["BP09-038", "BP02-046"], deck: ["V1"] } }).play("BP09-038").pick("BP02-046");
    expect([keep.field(), keep.hand()]).toEqual([["BP09-038"], ["V1"]]);
    expect(d({ me: { hand: ["BP09-038", "V3"] } }).play("BP09-038").cemetery()).toEqual(["BP09-038"]);
    expect(d({ me: { field: ["BP09-038"], evolveDeck: ["BP09-039"], cemetery: ACADEMICS.slice(1), playPoints: 2 } }).canEvolve("BP09-038")).toBe(false);
    const white = d({ me: { field: ["BP09-038"], evolveDeck: ["BP09-039"], cemetery: ACADEMICS, playPoints: 2 } }).evolve("BP09-038", { into: "BP09-039" });
    expect([white.leader(), white.keywords("BP09-038")]).toEqual([23, ["ward"]]);
  });

  it("039_back Mysterian Blackwyrm — Assail; 3 damage to each enemy leader", () => {
    const t = d({ me: { field: ["BP09-038"], evolveDeck: ["BP09-039"], cemetery: ACADEMICS, playPoints: 2 } }).evolve("BP09-038", { into: "BP09-039_back" });
    expect([t.leader("opp"), t.keywords("BP09-038")]).toEqual([17, ["assail"]]);
  });

  it("040 Snowman King — Last Words: leader +3", () => {
    const t = d({ me: { field: ["BP09-040"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC");
    expect(t.leader()).toBe(23);
  });

  it("041 Absolute Zeroblade — 1 damage to each enemy follower, again with Spellchain (10), again with 15", () => {
    const spells = (n: number) => Array.from({ length: n }, () => "KILL");
    const hit = (n: number) => d({ me: { hand: ["BP09-041"], cemetery: spells(n) }, opp: { field: ["V3", "V5"] } }).play("BP09-041").stats("opp:V3");
    expect([hit(9), hit(10), hit(15)]).toEqual([[3, 3], [3, 2], [3, 1]]);
  });

  it("042 / 043 Bergent — summons up to 2 Onion Patches from the top 5; evolved: they deal 1 more damage; act: search 2", () => {
    const t = d({ me: { hand: ["BP09-042"], deck: ["BP09-049", "V1", "BP09-049", "BP09-049", "V3"] } }).play("BP09-042").pick("BP09-049", "BP09-049").order();
    expect([t.field(), t.zone("me", "deck").sort()]).toEqual([["BP09-042", "BP09-049", "BP09-049"], ["BP09-049", "V1", "V3"]]);
    const bergent = { card: "BP09-042", evolvedInto: "BP09-043" };
    const hit = d({ me: { field: [bergent, "BP09-049"] }, opp: { field: [{ card: "V3", engaged: true }] } }).attack("BP09-049", "opp:V3");
    expect(hit.stats("opp:V3")).toEqual([3, 2]);
    const act = d({ me: { field: [bergent], deck: ["BP09-049", "V1", "BP09-049"], playPoints: 1 } }).activate("BP09-042").pick("BP09-049", "BP09-049");
    expect([act.field(), act.engaged("BP09-042"), act.pp()]).toEqual([["BP09-042", "BP09-049", "BP09-049"], true, 0]);
  });

  it("044 Palla — draw; with 5 Academic cards in the cemetery recover 1 play point", () => {
    const t = d({ me: { hand: ["BP09-044"], cemetery: ACADEMICS, deck: ["V1"] } }).play("BP09-044");
    expect([t.hand(), t.pp()]).toEqual([["V1"], 1]);
  });

  it("045 Summoning Drills — Stack; a Guardform Golem; discard a card: a Strikeform Golem into the EX area and +1 attack to Golems on the field and in the EX area", () => {
    const t = d({ me: { hand: ["BP09-045", "V1"], ex: ["BP01-T08"] } }).play("BP09-045").flush().none().yes();
    expect([t.field(), t.stats("BP01-T09"), t.ex(), t.stats("BP01-T08@ex")]).toEqual([["BP09-045", "BP01-T09"], [3, 3], ["BP01-T08", "BP01-T08"], [4, 2]]);
    expect(t.counters("BP09-045", "stack")).toBe(1);
  });

  it("046 / 047 Witch of Foresight — look at the top card, may bury it; evolved also draws (the kept card too)", () => {
    const bury = d({ me: { hand: ["BP09-046"], deck: ["V5", "V1"] } }).play("BP09-046").yes();
    expect([bury.cemetery(), bury.zone("me", "deck")]).toEqual([["V5"], ["V1"]]);
    const evo = d({ me: { field: ["BP09-046"], evolveDeck: ["BP09-047"], deck: ["V5", "V1"] } }).evolve("BP09-046").no();
    expect(evo.hand()).toEqual(["V5"]);
  });

  it("048 Beastfaced Mage — act, Earth Rite: 2 damage; Last Words: a Magic Sediment", () => {
    expect(d({ me: { field: ["BP09-048"] }, opp: { field: ["V3"] } }).canActivate("BP09-048")).toBe(false);
    const t = d({ me: { field: ["BP09-048", SEDIMENT], hand: ["QUICK-SAC"] }, opp: { field: ["V3"] } }).activate("BP09-048");
    expect([t.stats("opp:V3"), t.field()]).toEqual([[3, 2], ["BP09-048"]]);
    t.play("QUICK-SAC");
    expect(t.field()).toEqual([SEDIMENT]);
  });

  it("049 Onion Patch — Rush; with 5 Onion Patches in the cemetery: Storm and Strike: 1 damage", () => {
    const t = d({ me: { hand: ["BP09-049"], cemetery: ONIONS }, opp: { field: ["V3"] } }).play("BP09-049");
    expect(t.keywords("BP09-049")).toEqual(["rush", "storm"]);
    t.attack("BP09-049", "opp:leader");
    expect([t.stats("opp:V3"), t.leader("opp")]).toEqual([[3, 3], 19]);
    const four = d({ me: { hand: ["BP09-049"], cemetery: ONIONS.slice(1) }, opp: { field: [{ card: "V3", engaged: true }] } }).play("BP09-049");
    expect([four.keywords("BP09-049"), four.attackTargets("BP09-049")]).toEqual([["rush"], ["V3"]]);
    four.attack("BP09-049", "opp:V3");
    expect(four.stats("opp:V3")).toEqual([3, 3]); // no Strike: 1 combat damage only
  });

  it("050 Tico — Ward; Last Words: the top card, if Academic, may be added to your hand", () => {
    const t = d({ me: { field: ["BP09-050"], hand: ["QUICK-SAC"], deck: ["BP02-046", "V1"] } }).play("QUICK-SAC").pick("BP02-046");
    expect(t.hand()).toEqual(["BP02-046"]);
    const other = d({ me: { field: ["BP09-050"], hand: ["QUICK-SAC"], deck: ["V1"] } }).play("QUICK-SAC");
    expect([other.hand(), other.zone("me", "deck")]).toEqual([[], ["V1"]]);
  });

  it("051 Staff of Whirlwinds — damage equal to your Runecraft followers to each enemy leader and follower", () => {
    const t = d({ me: { hand: ["BP09-051"], field: ["BP09-048", "BP09-050", "V1"], playPoints: 4 }, opp: { field: ["V3"] } }).play("BP09-051");
    expect([t.leader("opp"), t.stats("opp:V3")]).toEqual([18, [3, 2]]);
  });
});
