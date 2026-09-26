import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP17 Runecraft (037–054, T04, T05). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); KILL (1) is a spell; QUICK-SAC (0)
// destroys one of your followers. Machina: BP17-041, BP17-047, BP07-103 Technolord (6), BP07-037 Belphomet, Lord of
// Aiolon (7). BP07-041 is Delta Cannon; BP16-048 an Academic card. Tokens: BP07-T01 Assembly Droid, BP07-T02 Repair
// Mode, BP12-T03 Armored Tentacle, BP12-T04 Assault Tentacle, BP17-T04 Quadra Magic, BP17-T05 Elements of Creation.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const DROID = "BP07-T01";
const REPAIR = "BP07-T02";
const QUADRA = "BP17-T04";
const ELEMENTS = "BP17-T05";
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };
const n = (count: number, id = "V1") => Array<string>(count).fill(id);

describe("BP17 Runecraft", () => {
  it("037 / 038 Isabelle, Intrepid Mage — Fanfare, discard a card: 3 damage or draw; evolved: a Quadra Magic into the EX area", () => {
    const t = d({ me: { hand: ["BP17-037", "V1"], deck: ["V3"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP17-037").choose("damage").yes();
    expect([t.stats("opp:V5"), t.cemetery()]).toEqual([[5, 2], ["V1"]]);
    expect(d({ me: { field: ["BP17-037"], evolveDeck: ["BP17-038"], playPoints: 1 } }).evolve("BP17-037").ex()).toEqual([QUADRA]);
  });

  it("039 Eleanor, Glorious Flower — Fanfare, banish a Runecraft card from the cemetery: draw; act, engage: 1 damage with 5 banished cards, 4 with 10", () => {
    const t = d({ me: { hand: ["BP17-039"], cemetery: ["BP17-041"], deck: ["V1"], playPoints: 1 } }).play("BP17-039").yes();
    expect([t.hand(), t.zone("me", "banished")]).toEqual([["V1"], ["BP17-041"]]);
    const spec = (banished: number): DriveSpec => ({ me: { field: ["BP17-039"], banished: n(banished) }, opp: { field: ["V5"] } });
    expect(d(spec(10)).activate("BP17-039").stats("opp:V5")).toEqual([5, 1]);
    expect(d(spec(5)).activate("BP17-039").stats("opp:V5")).toEqual([5, 4]);
    expect(d(spec(4)).activate("BP17-039").stats("opp:V5")).toEqual([5, 5]);
  });

  it("040 Belphomet, Ultimate Creator — 5 less with a big Machina follower; Fanfare: bury them, an Assault Tentacle for a 6-cost one, 4 to each enemy follower and +2/+2 to your other Machina followers for a 7-cost one", () => {
    const t = d({ me: { hand: ["BP17-040"], field: ["BP07-103"], playPoints: 0 } }).play("BP17-040");
    expect([t.field(), t.cemetery()]).toEqual([["BP17-040", "BP12-T04"], ["BP07-103"]]);
    const seven = d({ me: { hand: ["BP17-040"], field: ["BP07-037", "BP17-041"], playPoints: 0 }, opp: { field: ["V5", "V3"] } }).play("BP17-040");
    expect([seven.field("opp"), seven.stats("opp:V5"), seven.stats("BP17-041"), seven.stats("BP17-040")]).toEqual([["V5"], [5, 1], [4, 4], [5, 5]]);
    expect(d({ me: { hand: ["BP17-040"], playPoints: 4 } }).canPlay("BP17-040")).toBe(false);
  });

  it("041 / 042 Tetra, Serene Sapphire — Fanfare: a Repair Mode; evolved: a Machina card and a Delta Cannon from the top 4; super-evolved: this turn, playing a Machina card deals 1 to each enemy", () => {
    expect(d({ me: { hand: ["BP17-041"], playPoints: 2 } }).play("BP17-041").ex()).toEqual([REPAIR]);
    const t = d({ me: { field: ["BP17-041"], evolveDeck: ["BP17-042"], deck: ["BP17-047", "BP07-041", "V1", "V3"], playPoints: 1 } });
    t.evolve("BP17-041").pick("BP17-047").pick("BP07-041").order();
    expect(t.hand()).toEqual(["BP17-047", "BP07-041"]);
    const s = d({ me: { field: ["BP17-041"], evolveDeck: ["BP17-042"], hand: ["BP17-047"], playPoints: 2, ...SUPER }, opp: { field: ["V5"] } });
    s.evolve("BP17-041", { sep: true }).flush().play("BP17-047").flush();
    expect([s.leader("opp"), s.stats("opp:V5")]).toEqual([19, [5, 4]]);
  });

  it("043 Mega Enforcer — end phase: an enemy follower, 3 damage and draw with 3 Machina cards in the EX area; Last Words: an Assembly Droid", () => {
    const t = d({ me: { field: ["BP17-043"], ex: [DROID, DROID, REPAIR], deck: ["V1"] }, opp: { field: ["V5"], deck: ["V1"] } }).end();
    expect([t.stats("opp:V5"), t.hand()]).toEqual([[5, 2], ["V1"]]);
    expect(d({ me: { field: ["BP17-043"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").ex()).toEqual([DROID]);
  });

  it("044 Nefarious Invasion — only with 3 Machina cards in the EX area (itself too); a Belphomet follower, an Armored Tentacle, and for 2 more an Assault Tentacle", () => {
    const t = d({ me: { hand: ["BP17-044"], ex: [DROID, DROID, DROID], deck: ["V1", "BP17-040"], playPoints: 5 } }).play("BP17-044").choose("plus2").pick("BP17-040").none();
    expect([t.hand(), t.field(), t.pp()]).toEqual([["BP17-040"], ["BP12-T03", "BP12-T04"], 0]);
    expect(d({ me: { hand: ["BP17-044"], ex: [DROID, DROID, DROID], playPoints: 3 } }).play("BP17-044").none().field()).toEqual(["BP12-T03"]);
    expect(d({ me: { hand: ["BP17-044"], ex: [DROID, DROID], playPoints: 3 } }).canPlay("BP17-044")).toBe(false);
    expect(d({ me: { ex: ["BP17-044", DROID, DROID], playPoints: 3 } }).canPlay("BP17-044@ex")).toBe(true);
  });

  it("045 / 046 Marie, Flowery Magician — Fanfare: bury 2, draw for a non-Runecraft card; evolved: 5 damage", () => {
    expect(d({ me: { hand: ["BP17-045"], deck: ["V1", "BP17-041", "V3"], playPoints: 4 } }).play("BP17-045").hand()).toEqual(["V3"]);
    expect(d({ me: { hand: ["BP17-045"], deck: ["BP17-041", "BP17-047", "V3"], playPoints: 4 } }).play("BP17-045").hand()).toEqual([]);
    expect(d({ me: { field: ["BP17-045"], evolveDeck: ["BP17-046"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP17-045").field("opp")).toEqual([]);
  });

  it("047 Enforcer — Rush; Fanfare: +3 attack and Assail with 3 Machina cards in the EX area; Last Words: an Assembly Droid", () => {
    const t = d({ me: { hand: ["BP17-047"], ex: [DROID, DROID, REPAIR], playPoints: 1 } }).play("BP17-047");
    expect([t.stats("BP17-047"), t.keywords("BP17-047")]).toEqual([[4, 1], ["rush", "assail"]]);
    expect(d({ me: { field: ["BP17-047"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").ex()).toEqual([DROID]);
  });

  it("048 Fruits of Wisdom — a Machina card on top may go into the EX area; an Assembly Droid", () => {
    expect(d({ me: { hand: ["BP17-048"], deck: ["BP17-041"], playPoints: 1 } }).play("BP17-048").pick("BP17-041").ex()).toEqual(["BP17-041", DROID]);
    const t = d({ me: { hand: ["BP17-048"], deck: ["V1"], playPoints: 1 } }).play("BP17-048");
    expect([t.ex(), t.zone("me", "deck")]).toEqual([[DROID], ["V1"]]);
  });

  it("049 / 050 Awakened Robot — Last Words: a Repair Mode; evolved: 2 damage", () => {
    expect(d({ me: { field: ["BP17-049"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").ex()).toEqual([REPAIR]);
    expect(d({ me: { field: ["BP17-049"], evolveDeck: ["BP17-050"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP17-049").stats("opp:V5")).toEqual([5, 3]);
  });

  it("051 Convenant Mage — X less for the cards in your banished zone; Fanfare: draw, banish a card from your hand", () => {
    expect(d({ me: { hand: ["BP17-051"], banished: n(4), playPoints: 0 } }).canPlay("BP17-051")).toBe(true);
    expect(d({ me: { hand: ["BP17-051"], banished: n(3), playPoints: 0 } }).canPlay("BP17-051")).toBe(false);
    const t = d({ me: { hand: ["BP17-051", "V3"], deck: ["V1"], playPoints: 4 } }).play("BP17-051").pick("V3");
    expect([t.hand(), t.zone("me", "banished")]).toEqual([["V1"], ["V3"]]);
  });

  it("052 Jetbroom Witch — Ward; Fanfare: a Repair Mode", () => {
    const t = d({ me: { hand: ["BP17-052"], playPoints: 1 } }).play("BP17-052").none();
    expect([t.ex(), t.keywords("BP17-052")]).toEqual([[REPAIR], ["ward"]]);
  });

  it("053 Panacea Alchemist — Fanfare: leader +5, or (2): 5 damage to each enemy follower", () => {
    expect(d({ me: { hand: ["BP17-053"], playPoints: 5 } }).play("BP17-053").choose("leader").leader()).toBe(25);
    expect(d({ me: { hand: ["BP17-053"], playPoints: 7 }, opp: { field: ["V5", "V3"] } }).play("BP17-053").choose("damage").yes().field("opp")).toEqual([]);
  });

  it("054 Mysterian Wisdom — reveal an Academic card and put it on the bottom of the deck; draw 2", () => {
    const t = d({ me: { hand: ["BP17-054", "BP16-048"], deck: ["V1", "V3"], playPoints: 1 } }).play("BP17-054");
    expect([t.hand(), t.zone("me", "deck")]).toEqual([["V1", "V3"], ["BP16-048"]]);
    expect(d({ me: { hand: ["BP17-054", "V1"], playPoints: 1 } }).canPlay("BP17-054")).toBe(false);
  });

  it("T04 Quadra Magic / T05 Elements of Creation — Spellchain (5): 1 less; 2 damage to up to 2 and an Elements of Creation; Spellchain (10): 7 to the enemy leader, leader +7", () => {
    expect(d({ me: { ex: [QUADRA], cemetery: n(5, "KILL"), playPoints: 1 } }).canPlay(`${QUADRA}@ex`)).toBe(true);
    const t = d({ me: { ex: [QUADRA], playPoints: 2 }, opp: { field: ["V5", "V3"] } }).play(`${QUADRA}@ex`).pick("opp:V5", "opp:V3");
    expect([t.stats("opp:V5"), t.stats("opp:V3"), t.ex()]).toEqual([[5, 3], [3, 2], [ELEMENTS]]);
    const e = d({ me: { ex: [ELEMENTS], cemetery: n(10, "KILL"), playPoints: 5 } }).play(`${ELEMENTS}@ex`);
    expect([e.leader("opp"), e.leader()]).toEqual([13, 27]);
    expect(d({ me: { ex: [ELEMENTS], cemetery: n(9, "KILL"), playPoints: 5 } }).play(`${ELEMENTS}@ex`).leader("opp")).toBe(20);
  });
});
