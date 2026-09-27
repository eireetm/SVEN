import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// CP04 Runecraft (037–054, T05–T07), Princess Connect! Re: Dive. Both decks are based on the universe (CR 14.5.1.2). V1 is 1c
// 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). CP04-105 Suzume (2c; UB Fanfare: leader +2) executes a Union Burst ability. Friendship
// Club cards: CP04-047 Chieru (2c 2/3), CP04-053 Chellerific Carnival (a 2-cost PriConne spell, Quick: 3 damage). CP04-018 Aurora
// Healing is a PriConne spell; KILL (1c, destroy an enemy follower) and GIVE-STORM (0c, your follower gets Storm) are spells.
const E = cardEngine();
const PC = { universe: "princessConnect" as const };
const d = (spec: DriveSpec) => drive(E, { ...spec, me: { ...PC, ...spec.me }, opp: { ...PC, ...spec.opp } });
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };
/** Two Union Burst abilities already executed this turn. */
const twoBefore = (t: ReturnType<typeof d>) => {
  t.game.state.players[0].thisTurn = { ...t.game.state.players[0].thisTurn, turn: t.game.state.turn, unionBursts: 2 };
  return t;
};

describe("CP04 Runecraft", () => {
  it("037 / T06 Karyl — UB Fanfare, discard a spell: 3 damage, draw; Fanfare (2): a Chaos Grimoire (twice per turn: half its attack to the leader)", () => {
    const t = d({ me: { hand: ["CP04-037", "KILL"], deck: ["V1"], playPoints: 6 }, opp: { field: ["V5"] } }).play("CP04-037").flush().yes().yes();
    expect([t.stats("opp:V5"), t.hand(), t.zone("me", "equipmentZone"), t.pp()]).toEqual([[5, 2], ["V1"], ["CP04-T06"], 0]);
    const g = d({ me: { field: [{ card: "CP04-037", equipped: ["CP04-T06"] }], hand: ["GIVE-STORM", "GIVE-STORM", "GIVE-STORM"] } });
    g.play("GIVE-STORM").play("GIVE-STORM").play("GIVE-STORM");
    expect(g.leader("opp")).toBe(16);
  });

  it("038 Karyl (Evolved) — On Evolve: 5 damage; super-evolved: up to 2 spells with different names from the cemetery, 2 less", () => {
    const t = d({ me: { field: ["CP04-037"], evolveDeck: ["CP04-038"], cemetery: ["KILL", "GIVE-STORM", "KILL"], playPoints: 1, ...SUPER }, opp: { field: ["V5"] } });
    t.evolve("CP04-037", { sep: true }).flush().pick("KILL").pick("GIVE-STORM");
    expect([t.field("opp"), t.ex(), t.cemetery()]).toEqual([[], ["KILL", "GIVE-STORM"], ["KILL"]]);
  });

  it("039 Yuni — UB Fanfare: up to 2 Friendship Club cards with different names costing 2 or less, 2 less; another's UB: the next PriConne spell 2 less", () => {
    const t = d({ me: { hand: ["CP04-039"], deck: ["CP04-047", "CP04-047", "CP04-053"], playPoints: 5 } }).play("CP04-039").pick("CP04-047").pick("CP04-053");
    expect([t.ex(), t.canPlay("CP04-047")]).toEqual([["CP04-047", "CP04-053"], true]);
    const u = d({ me: { field: ["CP04-039"], hand: ["CP04-105", "CP04-053"], playPoints: 2 }, opp: { field: ["V5"] } }).play("CP04-105");
    expect(u.canPlay("CP04-053")).toBe(true);
  });

  it("040 / T05 / T07 Neneka — UB Fanfare: a Mirror Image Neneka if there is none; a Mirage Wand gives both 1 more ability damage", () => {
    const t = d({ me: { hand: ["CP04-040"], playPoints: 2 } }).play("CP04-040").flush().none();
    expect(t.field()).toEqual(["CP04-040", "CP04-T05"]);
    const again = d({ me: { hand: ["CP04-040"], field: ["CP04-T05"], playPoints: 2 } }).play("CP04-040").flush();
    expect(again.field()).toEqual(["CP04-T05", "CP04-040"]);
    const w = d({ me: { field: [{ card: "CP04-040", equipped: ["CP04-T07"] }, "CP04-T05"] }, opp: { field: ["V5"] } });
    w.activate("CP04-040");
    expect(w.stats("opp:V5")).toEqual([5, 3]);
    w.activate("CP04-T05");
    expect(w.stats("opp:V5")).toEqual([5, 1]);
  });

  it("041 / 042 Maho — UB Fanfare: your leader or another follower +1 defense; evolved: one of the top 4 into the EX area", () => {
    expect(d({ me: { hand: ["CP04-041"], field: ["V1"], playPoints: 2 } }).play("CP04-041").pick("leader").leader()).toBe(21);
    const e = d({ me: { field: ["CP04-041"], evolveDeck: ["CP04-042"], deck: ["V1", "V3", "V5", "V1"], playPoints: 1 } }).evolve("CP04-041").pick("V3").order();
    expect([e.ex(), e.zone("me", "deck").length]).toEqual([["V3"], 3]);
  });

  it("043 Precia — UB Fanfare: damage equal to your other followers; draws after 2 other Union Bursts this turn", () => {
    const t = d({ me: { hand: ["CP04-043"], field: ["V1", "V1"], deck: ["V3"], playPoints: 2 }, opp: { field: ["V5"] } }).play("CP04-043");
    expect([t.stats("opp:V5"), t.hand()]).toEqual([[5, 3], []]);
    expect(twoBefore(d({ me: { hand: ["CP04-043"], deck: ["V3"], playPoints: 2 }, opp: { field: ["V5"] } })).play("CP04-043").hand()).toEqual(["V3"]);
  });

  it("044 Construct of Truth and Being — Quick; discard a PriConne card: draw 2, leader +2 with a Friendship Club follower", () => {
    const t = d({ me: { hand: ["CP04-044", "CP04-001"], field: ["CP04-047"], deck: ["V1", "V3"], playPoints: 2 } }).play("CP04-044").yes();
    expect([t.hand().sort(), t.leader(), t.cemetery().sort()]).toEqual([["V1", "V3"], 22, ["CP04-001", "CP04-044"]]);
    expect(d({ me: { hand: ["CP04-044"], deck: ["V1"], playPoints: 2 } }).play("CP04-044").hand()).toEqual([]);
  });

  it("045 / 046 Kyoka — Fanfare: a PriConne spell from the cemetery into the EX area, buried at your end phase; evolved UB: 2 damage (+2 to the leader after a spell)", () => {
    const t = d({ me: { hand: ["CP04-045"], cemetery: ["CP04-018"], playPoints: 2 }, opp: { deck: ["V1"] } }).play("CP04-045");
    expect(t.ex()).toEqual(["CP04-018"]);
    t.end();
    expect([t.ex(), t.cemetery()]).toEqual([[], ["CP04-018"]]);
    const e = d({ me: { field: ["CP04-045"], evolveDeck: ["CP04-046"], hand: ["GIVE-STORM"], playPoints: 1 }, opp: { field: ["V5"] } });
    e.play("GIVE-STORM").evolve("CP04-045");
    expect([e.stats("opp:V5"), e.leader("opp")]).toEqual([[5, 3], 18]);
  });

  it("047 Chieru — UB Fanfare: a Friendship Club card or PriConne spell from the top 4", () => {
    expect(d({ me: { hand: ["CP04-047"], deck: ["V1", "CP04-053", "V3", "V5"], playPoints: 2 } }).play("CP04-047").pick("CP04-053").order().hand()).toEqual(["CP04-053"]);
  });

  it("048 Chloe — UB Fanfare: damage equal to your Friendship Club followers; playing a Friendship Club card or PriConne spell: 1 to the leader", () => {
    const t = d({ me: { hand: ["CP04-048", "CP04-047"], field: ["CP04-047"], playPoints: 4 }, opp: { field: ["V5"] } }).play("CP04-048");
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[5, 3], 20]);
    t.play("CP04-047").flush();
    expect(t.leader("opp")).toBe(19);
  });

  it("049 / 050 Yuki — Fanfare: a spell from the deck; evolved UB: -2/-2", () => {
    expect(d({ me: { hand: ["CP04-049"], deck: ["V1", "KILL"], playPoints: 3 } }).play("CP04-049").pick("KILL").hand()).toEqual(["KILL"]);
    expect(d({ me: { field: ["CP04-049"], evolveDeck: ["CP04-050"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("CP04-049").stats("opp:V5")).toEqual([3, 3]);
  });

  it("051 Hatsune — Ward; Fanfare: engage this; UB Activate: 2 damage to each enemy", () => {
    expect(d({ me: { hand: ["CP04-051"], playPoints: 3 } }).play("CP04-051").none().engaged("CP04-051")).toBe(true);
    const t = d({ me: { field: ["CP04-051"] }, opp: { field: ["V5", "V1"] } }).activate("CP04-051");
    expect([t.field("opp"), t.stats("opp:V5"), t.leader("opp")]).toEqual([["V5"], [5, 3], 18]);
  });

  it("052 Nanaka — UB Fanfare, discard a spell: 5 damage; once per turn, another's UB: a PriConne spell from the cemetery into the EX area", () => {
    const t = d({ me: { hand: ["CP04-052", "KILL"], playPoints: 3 }, opp: { field: ["V5"] } }).play("CP04-052").yes();
    expect([t.field("opp"), t.cemetery()]).toEqual([[], ["KILL"]]);
    const u = d({ me: { field: ["CP04-052"], hand: ["CP04-105", "CP04-105"], cemetery: ["CP04-018", "CP04-053"], playPoints: 4 } });
    u.play("CP04-105").pick("CP04-018").play("CP04-105");
    expect(u.ex()).toEqual(["CP04-018"]);
  });

  it("053 Chellerific Carnival — Quick; 3 damage, draw with a Friendship Club follower", () => {
    const t = d({ me: { hand: ["CP04-053"], field: ["CP04-047"], deck: ["V1"], playPoints: 2 }, opp: { field: ["V5"] } }).play("CP04-053");
    expect([t.stats("opp:V5"), t.hand()]).toEqual([[5, 2], ["V1"]]);
  });

  it("054 Dark Eclipse — a PriConne follower +3 attack, Rush and Assail; discarded: 1 damage", () => {
    const t = d({ me: { hand: ["CP04-054"], field: ["CP04-001"], playPoints: 2 } }).play("CP04-054");
    expect([t.stats("CP04-001"), t.keywords("CP04-001")]).toEqual([[4, 1], ["rush", "assail"]]);
    expect(d({ me: { hand: ["CP04-017", "CP04-054"], playPoints: 3 }, opp: { field: ["V5"] } }).play("CP04-017").stats("opp:V5")).toEqual([5, 4]);
  });
});
