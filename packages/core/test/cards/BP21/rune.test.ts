import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP21 Runecraft (037–054, T03–T05). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). Academic (学院): BP21-037 (1c 0/3),
// BP21-041 (2c 2/2), BP21-045 (1c 1/1), BP21-052 (a spell). BP21-040 Ceridwen is a 3-cost Alchemist. BP20-070 (act 0, once
// per turn: 1 damage to a follower of yours). Tokens: BP01-T09 Guardform Golem, BP01-T10 Magic Sediment, BP05-T05 Mystic
// Artifact, BP13-T01 Anne's Summoning (Rush, Ward; Fanfare: leader +2), BP16-T01 Guardian Golem.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id: string) => Array<string>(count).fill(id);
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };

describe("BP21 Runecraft", () => {
  it("037 Amaryllis, the Princess — end phase: may bury the top card; once per turn, ability damage: +2/+0; Fanfare with 10 Academic cards: a Curse of Suffering", () => {
    expect(d({ me: { field: ["BP21-037"], deck: ["V1", "V3"] }, opp: { deck: ["V1"] } }).end().yes().cemetery()).toEqual(["V1"]);
    const t = d({ me: { field: ["BP21-037", "BP20-070", "BP20-070"] } }).activate("BP20-070").pick("BP21-037");
    expect(t.stats("BP21-037")).toEqual([2, 2]);
    t.activate("BP20-070").pick("BP21-037");
    expect(t.stats("BP21-037")).toEqual([2, 1]);
    expect(d({ me: { hand: ["BP21-037"], cemetery: n(10, "BP21-045"), playPoints: 1 } }).play("BP21-037").ex()).toEqual(["BP21-T03"]);
    expect(d({ me: { hand: ["BP21-037"], cemetery: n(9, "BP21-045"), playPoints: 1 } }).play("BP21-037").ex()).toEqual([]);
  });

  it("T03 Curse of Suffering — 2 damage to each enemy leader and follower and each of your Amaryllis", () => {
    const t = d({ me: { ex: ["BP21-T03"], field: ["BP21-037"], playPoints: 1 }, opp: { field: ["V5", "V1"] } }).play("BP21-T03@ex");
    expect([t.leader("opp"), t.field("opp"), t.stats("opp:V5"), t.stats("BP21-037")]).toEqual([18, ["V5"], [5, 3], [2, 1]]);
  });

  it("038 / 039 Anne, Brilliant Mage — Fanfare, discard an Academic card: draw; evolved: an Anne's Summoning (Assail with 10 Academic cards); super-evolved: the next Anne's Sorcery costs 5 less", () => {
    const t = d({ me: { hand: ["BP21-038", "BP21-045"], deck: ["V1"], playPoints: 3 } }).play("BP21-038").yes();
    expect([t.hand(), t.cemetery()]).toEqual([["V1"], ["BP21-045"]]);
    const e = d({ me: { field: ["BP21-038"], evolveDeck: ["BP21-039"], cemetery: n(10, "BP21-045"), playPoints: 1 } }).evolve("BP21-038").none();
    expect([e.field(), e.keywords("BP13-T01"), e.leader()]).toEqual([["BP21-038", "BP13-T01"], ["rush", "ward", "assail"], 22]);
    const s = d({ me: { field: ["BP21-038"], evolveDeck: ["BP21-039"], playPoints: 1, ...SUPER } }).evolve("BP21-038", { sep: true }).flush().none().flush();
    expect([s.field(), s.game.state.nextPlay.length]).toEqual([["BP21-038", "BP13-T01"], 1]);
  });

  it("040 Ceridwen, Eternal Duality — Fanfare, Earth Rite: a 1-cost follower with Earth Rite from the deck; end phase after an Earth Rite: 2 damage", () => {
    const t = d({ me: { hand: ["BP21-040"], field: ["BP01-T10"], deck: ["BP21-045", "V1"], playPoints: 3 }, opp: { deck: ["V1"] } });
    t.play("BP21-040").yes().pick("BP21-045");
    expect(t.field()).toEqual(["BP21-040", "BP21-045", "BP01-T10"]);
    expect(t.end().leader("opp")).toBe(18);
    expect(d({ me: { field: ["BP21-040"] }, opp: { deck: ["V1"] } }).end().leader("opp")).toBe(20);
  });

  it("041 / 042 Grea, Crimson Promise — evolved: 2 damage, or 4 and 1 to its leader with 10 Academic cards", () => {
    const e = d({ me: { field: ["BP21-041"], evolveDeck: ["BP21-042"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP21-041");
    expect([e.stats("opp:V5"), e.leader("opp")]).toEqual([[5, 3], 20]);
    const t = d({ me: { field: ["BP21-041"], evolveDeck: ["BP21-042"], cemetery: n(10, "BP21-045"), playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP21-041");
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[5, 1], 19]);
  });

  it("043 Mysterian Exchange Party — discarded by an Academic card's ability: draw; up to 3 Academic followers costing 6 or less in total from the top 5", () => {
    const t = d({ me: { hand: ["BP21-038", "BP21-043"], deck: ["V1", "V3"], playPoints: 3 } }).play("BP21-038").yes().flush();
    expect(t.hand().sort()).toEqual(["V1", "V3"]);
    const other = d({ me: { hand: ["BP21-022", "BP21-034", "BP21-034", "BP21-043"], deck: ["V1", "V3", "V5"], playPoints: 3 } });
    other.play("BP21-022").choose("draw").yes().pick("BP21-043");
    expect(other.hand()).toEqual(["BP21-034", "BP21-034", "V1", "V3"]);
    const s = d({ me: { hand: ["BP21-043"], deck: ["BP21-037", "BP21-041", "V1", "BP21-037", "V3"], playPoints: 7 } }).play("BP21-043");
    s.pick("BP21-037").pick("BP21-041").pick("BP21-037").order().flush();
    expect(s.field()).toEqual(["BP21-037", "BP21-041", "BP21-037"]);
  });

  it("044 Mystic Rune / T04 Emergency Summoning / T05 Reactive Barrier — Stack amulets; Golems and draws, more with a 3-cost Alchemist follower", () => {
    const t = d({ me: { hand: ["BP21-044"], playPoints: 2 } }).play("BP21-044").choose("barrier");
    expect([t.ex(), t.counters("BP21-044", "stack")]).toEqual([["BP21-T05"], 1]);
    const e = d({ me: { ex: ["BP21-T04"], field: ["BP21-040"] } }).play("BP21-T04@ex").none();
    expect([e.field(), e.ex()]).toEqual([["BP21-040", "BP21-T04", "BP01-T09"], ["BP16-T01"]]);
    expect(d({ me: { ex: ["BP21-T05"], field: ["BP21-040"], deck: ["V1", "V3"] } }).play("BP21-T05@ex").hand()).toEqual(["V1", "V3"]);
    expect(d({ me: { ex: ["BP21-T05"], deck: ["V1", "V3"] } }).play("BP21-T05@ex").hand()).toEqual(["V1"]);
  });

  it("045 / 046 Gruinne, Leonardian Provost — Fanfare / evolved: add 1 to a Stack; act, engage, Earth Rite (2): 1 damage to each enemy follower", () => {
    expect(d({ me: { hand: ["BP21-045"], field: ["BP21-054"], playPoints: 1 } }).play("BP21-045").counters("BP21-054", "stack")).toBe(2);
    const t = d({ me: { field: ["BP21-045", { card: "BP21-054", counters: { stack: 2 } }] }, opp: { field: ["V5", "V1"] } }).activate("BP21-045");
    expect([t.stats("opp:V5"), t.stats("opp:V1"), t.field()]).toEqual([[5, 4], [2, 1], ["BP21-045"]]);
    expect(d({ me: { field: ["BP21-045", "BP21-054"] }, opp: { field: ["V5"] } }).canActivate("BP21-045")).toBe(false);
    const e = d({ me: { field: ["BP21-045", "BP21-054"], evolveDeck: ["BP21-046"], playPoints: 1 } }).evolve("BP21-045");
    expect(e.counters("BP21-054", "stack")).toBe(2);
  });

  it("047 Leeds, Pining Witch — Fanfare: banish the top card; act with 5 banished cards, engage and banish this: 4 damage and draw", () => {
    expect(d({ me: { hand: ["BP21-047"], deck: ["V1", "V3"], playPoints: 2 } }).play("BP21-047").zone("me", "banished")).toEqual(["V1"]);
    const t = d({ me: { field: ["BP21-047"], banished: n(5, "V1"), deck: ["V3"] }, opp: { field: ["V5"] } }).activate("BP21-047");
    expect([t.stats("opp:V5"), t.hand(), t.field()]).toEqual([[5, 1], ["V3"], []]);
    expect(d({ me: { field: ["BP21-047"], banished: n(4, "V1") }, opp: { field: ["V5"] } }).canActivate("BP21-047")).toBe(false);
  });

  it("048 Bell Witch — Fanfare: an Academic follower and an Academic spell from the top 4 into the EX area", () => {
    const t = d({ me: { hand: ["BP21-048"], deck: ["BP21-045", "BP21-052", "V1", "BP21-041"], playPoints: 3 } }).play("BP21-048");
    t.pick("BP21-041").pick("BP21-052").order();
    expect(t.ex()).toEqual(["BP21-041", "BP21-052"]);
  });

  it("049 / 050 Wolf Whisperer — evolved: up to 2 followers of different classes costing 4 or less from the top 5", () => {
    const t = d({ me: { field: ["BP21-049"], evolveDeck: ["BP21-050"], deck: ["V1", "V3", "BP21-041", "V5", "BP21-049"], playPoints: 1 } });
    t.evolve("BP21-049").pick("V1");
    expect(() => t.pick("V3")).toThrow(/not a candidate/);
    t.pick("BP21-041").order();
    expect(t.field()).toEqual(["BP21-049", "V1", "BP21-041"]);
  });

  it("051 Evamia, Spinner of Threads — Fanfare: banish the top card, then a Mystic Artifact with 5 banished cards", () => {
    const t = d({ me: { hand: ["BP21-051"], banished: n(4, "V1"), deck: ["V3", "V5"], playPoints: 2 } }).play("BP21-051").none();
    expect([t.field(), t.hand()]).toEqual([["BP21-051", "BP05-T05"], ["V5"]]);
    expect(d({ me: { hand: ["BP21-051"], banished: n(3, "V1"), deck: ["V3", "V5"], playPoints: 2 } }).play("BP21-051").field()).toEqual(["BP21-051"]);
  });

  it("052 Arcane Instruction — engage 2 Academic followers: 2 less; +1/+1 to a follower of yours and draw", () => {
    const t = d({ me: { hand: ["BP21-052"], field: ["BP21-045", "BP21-041"], deck: ["V1"], playPoints: 0 } }).play("BP21-052").pick("BP21-045");
    expect([t.stats("BP21-045"), t.hand(), t.engaged("BP21-041")]).toEqual([[2, 2], ["V1"], true]);
  });

  it("053 Aqueous Sphere — Quick; Spellchain (10): 2 less; 4 damage", () => {
    const t = d({ me: { hand: ["BP21-053"], cemetery: n(10, "BP21-052"), playPoints: 1 }, opp: { field: ["V5"] } }).play("BP21-053");
    expect(t.stats("opp:V5")).toEqual([5, 1]);
    expect(d({ me: { hand: ["BP21-053"], cemetery: n(9, "BP21-052"), playPoints: 1 }, opp: { field: ["V5"] } }).canPlay("BP21-053")).toBe(false);
  });

  it("054 Binding Ritual — Stack; Fanfare: engage an enemy follower, it doesn't refresh in its controller's next start phase", () => {
    const t = d({ me: { hand: ["BP21-054"], playPoints: 1 }, opp: { field: ["V5"], deck: ["V1"] } }).play("BP21-054");
    expect(t.engaged("opp:V5")).toBe(true);
    expect(t.end().engaged("opp:V5")).toBe(true);
  });
});
