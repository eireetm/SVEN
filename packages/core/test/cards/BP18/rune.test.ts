import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP18 Runecraft (039–057, T03, T04). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); SWORD1 (1) is a Swordcraft follower;
// KILL (1) is a spell; QUICK-SAC (0) destroys one of your followers; LW-DRAW has "Last Words: draw a card". BP16-048 is an
// Academic card; BP18-049 Mari is a Mage follower. Tokens: BP18-T03 Adorn with Jewels, BP18-T04 Ginger's Curse.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const JEWELS = "BP18-T03";
const CURSE = "BP18-T04";
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };
const n = (count: number, id = "V1") => Array<string>(count).fill(id);

describe("BP18 Runecraft", () => {
  it("039 / 040 Mana, Sterling Luster — Fanfare: a card from the banished zone, then banish one from the hand; evolved, banish another follower: destroy and draw; super-evolved: Adorn with Jewels", () => {
    const t = d({ me: { hand: ["BP18-039", "V1"], banished: ["V3"], playPoints: 2 } }).play("BP18-039").pick("V1");
    expect([t.hand(), t.zone("me", "banished")]).toEqual([["V3"], ["V1"]]);
    const e = d({ me: { field: ["BP18-039", "V1"], evolveDeck: ["BP18-040"], deck: ["V3"], playPoints: 1, ...SUPER }, opp: { field: ["V5"] } });
    e.evolve("BP18-039", { sep: true }).flush().yes().flush();
    expect([e.field("opp"), e.hand(), e.zone("me", "banished"), e.ex()]).toEqual([[], ["V3"], ["V1"], [JEWELS]]);
  });

  it("041 Françoise, Bejeweled Manager — Fanfare: draw, banish a card from the hand; act with 10 banished cards: 2 damage; Last Words: banish this", () => {
    const t = d({ me: { hand: ["BP18-041", "V1"], deck: ["V3"], playPoints: 1 } }).play("BP18-041").pick("V1");
    expect([t.hand(), t.zone("me", "banished")]).toEqual([["V3"], ["V1"]]);
    expect(d({ me: { field: ["BP18-041"], banished: n(10) }, opp: { field: ["V5"] } }).activate("BP18-041").pick("opp:V5").stats("opp:V5")).toEqual([5, 3]);
    expect(d({ me: { field: ["BP18-041"], banished: n(9) }, opp: { field: ["V5"] } }).canActivate("BP18-041")).toBe(false);
    expect(d({ me: { field: ["BP18-041"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").zone("me", "banished")).toEqual(["BP18-041"]);
  });

  it("042 Ginger, Accursed Word — X less for the banished cards; Fanfare: a Ginger's Curse", () => {
    expect(d({ me: { hand: ["BP18-042"], banished: n(7), playPoints: 2 } }).canPlay("BP18-042")).toBe(false);
    expect(d({ me: { hand: ["BP18-042"], banished: n(8), playPoints: 2 } }).play("BP18-042").ex()).toEqual([CURSE]);
  });

  it("043 / 044 Bejeweled Supermodel — Fanfare: draw 3, banish 2 from the hand; evolved: damage per banished card", () => {
    const t = d({ me: { hand: ["BP18-043", "V1"], deck: ["V3", "V5", "KILL"], playPoints: 4 } }).play("BP18-043").pick("V1", "KILL");
    expect([t.hand(), t.zone("me", "banished")]).toEqual([["V3", "V5"], ["V1", "KILL"]]);
    expect(d({ me: { field: ["BP18-043"], evolveDeck: ["BP18-044"], banished: n(4), playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP18-043").stats("opp:V5")).toEqual([5, 1]);
  });

  it("045 Aleister, Argenteum Astrum — Rush, Drain; Fanfare: banish the top 2, Assail with 5 banished, +1/+1 with 10", () => {
    const t = d({ me: { hand: ["BP18-045"], banished: n(3), deck: ["V1", "V3", "V5"], playPoints: 3 } }).play("BP18-045");
    expect([t.stats("BP18-045"), t.keywords("BP18-045")]).toEqual([[2, 4], ["rush", "drain", "assail"]]);
    expect(d({ me: { hand: ["BP18-045"], banished: n(8), deck: ["V1", "V3"], playPoints: 3 } }).play("BP18-045").stats("BP18-045")).toEqual([3, 5]);
  });

  it("046 Brilliant Cut — 2 damage to a follower and its leader with 10 banished cards, or draw and banish the top card", () => {
    const t = d({ me: { hand: ["BP18-046"], banished: n(10), playPoints: 1 }, opp: { field: ["V5"] } }).play("BP18-046").choose("damage");
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[5, 3], 18]);
    expect(d({ me: { hand: ["BP18-046"], banished: n(9), playPoints: 1 }, opp: { field: ["V5"] } }).play("BP18-046").choose("damage").stats("opp:V5")).toEqual([5, 5]);
    const draw = d({ me: { hand: ["BP18-046"], deck: ["V1", "V3"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP18-046").choose("draw");
    expect([draw.hand(), draw.zone("me", "banished")]).toEqual([["V1"], ["V3"]]);
  });

  it("047 / 048 Bejeweled Advisor — Fanfare: banish the top card, leader +2 with 10 banished; evolved: 2 damage", () => {
    expect(d({ me: { hand: ["BP18-047"], banished: n(9), deck: ["V1"], playPoints: 2 } }).play("BP18-047").leader()).toBe(22);
    expect(d({ me: { field: ["BP18-047"], evolveDeck: ["BP18-048"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP18-047").stats("opp:V5")).toEqual([5, 3]);
  });

  it("049 Mari, Card Conjurer — Fanfare and Last Words: draw, bury the top card", () => {
    const t = d({ me: { hand: ["BP18-049"], deck: ["V1", "V3"], playPoints: 3 } }).play("BP18-049");
    expect([t.hand(), t.cemetery()]).toEqual([["V1"], ["V3"]]);
    const lw = d({ me: { field: ["BP18-049"], hand: ["QUICK-SAC"], deck: ["V1", "V3"] } }).play("QUICK-SAC");
    expect([lw.hand(), lw.cemetery()]).toEqual([["V1"], ["BP18-049", "QUICK-SAC", "V3"]]);
  });

  it("050 Clandestined Dealings — destroy and banish the top 2, or (1): up to 2 differently named 2-cost followers from the banished zone", () => {
    const t = d({ me: { hand: ["BP18-050"], deck: ["V1", "V3", "V5"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP18-050").choose("destroy");
    expect([t.field("opp"), t.zone("me", "banished")]).toEqual([[], ["V1", "V3"]]);
    const s = d({ me: { hand: ["BP18-050"], banished: ["V1", "V1", "SWORD1", "V3"], playPoints: 4 } }).play("BP18-050").pick("V1").pick("SWORD1").yes();
    expect([s.field(), s.pp()]).toEqual([["V1", "SWORD1"], 0]);
  });

  it("051 / 052 Bejeweled Bouncer — Fanfare: banish the top card; evolved: Storm, Strike: +1/+1 per 5 banished cards", () => {
    expect(d({ me: { hand: ["BP18-051"], deck: ["V1"], playPoints: 2 } }).play("BP18-051").zone("me", "banished")).toEqual(["V1"]);
    const s = d({ me: { field: [{ card: "BP18-051", evolvedInto: "BP18-052" }], banished: n(10) } }).attack("BP18-051", "opp:leader");
    expect([s.stats("BP18-051"), s.leader("opp")]).toEqual([[4, 5], 16]);
  });

  it("053 / 054 Carbuncle of Mysteria — Last Words: bury the top card; evolved: an Academic card from the top 2, bury the rest", () => {
    expect(d({ me: { field: ["BP18-053"], hand: ["QUICK-SAC"], deck: ["V1"] } }).play("QUICK-SAC").cemetery()).toEqual(["BP18-053", "QUICK-SAC", "V1"]);
    const t = d({ me: { field: ["BP18-053"], evolveDeck: ["BP18-054"], deck: ["V1", "BP16-048"], playPoints: 1 } }).evolve("BP18-053").pick("BP16-048");
    expect([t.hand(), t.cemetery()]).toEqual([["BP16-048"], ["V1"]]);
  });

  it("055 Illusionist — Fanfare: a non-Runecraft follower (6 or less) from the hand with Rush, Assail and back to the hand at the end phase", () => {
    const t = d({ me: { hand: ["BP18-055", "V5"], playPoints: 6 }, opp: { deck: ["V1"] } }).play("BP18-055").pick("V5");
    expect([t.field(), t.keywords("V5")]).toEqual([["BP18-055", "V5"], ["rush", "assail"]]);
    expect(t.end().flush().hand()).toEqual(["V5"]);
  });

  it("056 Enchanted Sword — 1 less per 5 spells in the cemetery; a Mage follower +2/+2", () => {
    const t = d({ me: { hand: ["BP18-056"], field: ["BP18-049"], cemetery: n(10, "KILL"), playPoints: 1 } }).play("BP18-056");
    expect(t.stats("BP18-049")).toEqual([3, 3]);
    expect(d({ me: { hand: ["BP18-056"], field: ["BP18-049"], cemetery: n(9, "KILL"), playPoints: 1 } }).canPlay("BP18-056")).toBe(false);
  });

  it("057 Authoring Tomorrow — Quick; draw, into the EX area when played from the hand; act (1) in the EX area, bury it: 1 to each enemy follower", () => {
    const t = d({ me: { hand: ["BP18-057"], deck: ["V1", "V3"], playPoints: 2 } }).play("BP18-057");
    expect([t.hand(), t.ex(), t.cemetery()]).toEqual([["V1"], ["BP18-057"], []]);
    expect(d({ me: { ex: ["BP18-057"], deck: ["V1"], playPoints: 2 } }).play("BP18-057@ex").cemetery()).toEqual(["BP18-057"]);
    const act = d({ me: { ex: ["BP18-057"], playPoints: 1 }, opp: { field: ["V1", "V3"] } }).activate("BP18-057@ex");
    expect([act.stats("opp:V1"), act.stats("opp:V3"), act.cemetery()]).toEqual([[2, 1], [3, 3], ["BP18-057"]]);
  });

  it("T03 Adorn with Jewels — this turn, cards may be played from the banished zone", () => {
    const t = d({ me: { ex: [JEWELS], banished: ["V1"], playPoints: 2 } }).play(`${JEWELS}@ex`);
    expect(t.play("V1@banished").field()).toEqual(["V1"]);
  });

  it("T04 Ginger's Curse — an enemy follower loses all abilities and becomes 1/1", () => {
    const t = d({ me: { ex: [CURSE], hand: ["KILL"], playPoints: 2 }, opp: { field: ["LW-DRAW"], deck: ["V1"] } }).play(`${CURSE}@ex`);
    expect(t.stats("opp:LW-DRAW")).toEqual([1, 1]);
    expect(t.play("KILL").hand("opp")).toEqual([]);
    expect(d({ me: { ex: [CURSE], playPoints: 1 }, opp: { field: ["V5"] } }).play(`${CURSE}@ex`).stats("opp:V5")).toEqual([1, 1]);
  });
});
