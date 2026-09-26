import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP08 Runecraft (035–051). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5; KILL destroys an enemy
// follower, QUICK-SAC one of yours. BP04-T01 Serpent; BP08-042 Elusa is a Mage card, BP08-044 Morra
// an Arcanaform follower, BP01-051 a card with Earth Rite, BP05-T01 / T02 Idolatry amulets.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const SERPENT = "BP04-T01";
const MORRA = "BP08-044";
// One card of each base cost 1–10.
const COSTS_1_TO_10 = ["BP01-012", "BP01-002", "BP01-008", "BP01-021", "BP01-006", "BP01-091", "BP01-007", "BP01-001", "BP01-061", "BP01-154"];

describe("BP08 Runecraft", () => {
  it("035 Sweet-Tooth Medusa — Fanfare searches a card that costs 2 or less; on your turn each enemy follower to the cemetery summons a Serpent", () => {
    const fan = d({ me: { hand: ["BP08-035"], deck: ["V5", "V1"], playPoints: 4 } }).play("BP08-035").pick("V1");
    expect(fan.hand()).toEqual(["V1"]);
    const t = d({ me: { field: ["BP08-035"], hand: ["KILL"], playPoints: 1 }, opp: { field: ["V3"] } }).play("KILL");
    expect(t.field()).toEqual(["BP08-035", SERPENT]);
  });

  it("036 Sweet-Tooth Medusa (Evolved) — 5 divided between up to 2; Quick act burying 2 Serpents: the next card costs 2 less (twice: 4 less)", () => {
    const t = d({ me: { field: ["BP08-035"], evolveDeck: ["BP08-036"], playPoints: 2 }, opp: { field: ["V3", "V1"] } });
    t.evolve("BP08-035").pick("opp:V3", "opp:V1").choose("3");
    // V1 died on your turn: a Serpent.
    expect([t.field(), t.field("opp"), t.stats("opp:V3")]).toEqual([["BP08-035", SERPENT], ["V3"], [3, 1]]);
    const act = d({ me: { field: [{ card: "BP08-035", evolvedInto: "BP08-036" }, SERPENT, SERPENT, SERPENT, SERPENT], hand: ["V5"], playPoints: 1 } });
    // The second time only 2 Serpents are left, so they are buried without a choice.
    act.activate("BP08-035").pick(SERPENT, SERPENT).activate("BP08-035");
    expect([act.field(), act.canPlay("V5")]).toEqual([["BP08-035"], true]);
    act.play("V5");
    expect(act.pp()).toBe(0);
  });

  it("037 Prophetess of Creation — banishing one card of each cost 1–10 makes it cost 10 less; Ward, Aura; not destroyed by abilities; hand act: draw, discard", () => {
    const t = d({ me: { hand: ["BP08-037"], cemetery: COSTS_1_TO_10, playPoints: 0 } }).play("BP08-037").none();
    expect([t.field(), t.zone("me", "banished").length, t.keywords("BP08-037")]).toEqual([["BP08-037"], 10, ["ward", "aura"]]);
    expect(d({ me: { hand: ["BP08-037"], cemetery: COSTS_1_TO_10.slice(1), playPoints: 9 } }).canPlay("BP08-037")).toBe(false);
    const sac = d({ me: { field: ["BP08-037"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC");
    expect(sac.field()).toEqual(["BP08-037"]);
    const act = d({ me: { hand: ["BP08-037", "V1"], deck: ["V3"] } }).activate("BP08-037").pick("V1");
    expect([act.hand(), act.cemetery()]).toEqual([["V3"], ["BP08-037", "V1"]]);
  });

  it("038 / 039 Unbodied Witch — Fanfare draws deck size minus 5 (never negative); evolved buries every other card on the field", () => {
    const t = d({ me: { hand: ["BP08-038"], deck: ["V1", "V1", "V1", "V1", "V1", "V1", "V1"], playPoints: 8 } }).play("BP08-038");
    expect(t.hand()).toEqual(["V1", "V1"]);
    const few = d({ me: { hand: ["BP08-038"], deck: ["V1", "V1", "V1", "V1"], playPoints: 8 } }).play("BP08-038");
    expect(few.hand()).toEqual([]);
    const evo = d({ me: { field: ["BP08-038", "V1", "BP08-024"], evolveDeck: ["BP08-039"], playPoints: 1 }, opp: { field: ["V5", "BP08-037"] } });
    evo.evolve("BP08-038");
    expect([evo.field(), evo.field("opp"), evo.cemetery("opp").sort()]).toEqual([["BP08-038"], [], ["BP08-037", "V5"]]);
  });

  it("040 Lovely Heart Monika — Fanfare: a Morra from the deck or from your hand; act: engage it and a Morra for 3 damage", () => {
    const deck = d({ me: { hand: ["BP08-040"], deck: ["V1", MORRA], playPoints: 3 } }).play("BP08-040").choose("deck").pick(MORRA);
    expect(deck.field()).toEqual(["BP08-040", MORRA]);
    const hand = d({ me: { hand: ["BP08-040", MORRA], deck: ["V3"], playPoints: 3 } }).play("BP08-040").choose("hand").pick(MORRA);
    expect([hand.field(), hand.cemetery()]).toEqual([["BP08-040", MORRA], ["V3"]]);
    const act = d({ me: { field: ["BP08-040", MORRA] }, opp: { field: ["V3"] } }).activate("BP08-040");
    expect([act.stats("opp:V3"), act.engaged("BP08-040"), act.engaged(MORRA)]).toEqual([[3, 1], true, true]);
    expect(d({ me: { field: ["BP08-040"] }, opp: { field: ["V3"] } }).canActivate("BP08-040")).toBe(false);
  });

  it("041 Edict of Truth — up to 2 cards costing 3 or less from the top 5 into the EX area, 3 less this turn; in the cemetery, Raio entering: banish it for 1 EP", () => {
    const t = d({ me: { hand: ["BP08-041"], deck: ["V1", "V5", "V3", "BP08-045", "V2", "V1"], playPoints: 5 } });
    t.play("BP08-041").pick("V3", "BP08-045").order();
    expect([t.ex(), t.pp(), t.canPlay("V3"), t.canPlay("BP08-045")]).toEqual([["V3", "BP08-045"], 0, true, true]);
    const raio = d({ me: { hand: ["BP05-035"], cemetery: ["BP08-041"], playPoints: 7, evolutionPoints: 1 } });
    raio.play("BP05-035").pending("BP08-041").yes().flush();
    expect([raio.game.state.players[0].evolutionPoints, raio.zone("me", "banished")]).toEqual([2, ["BP08-041"]]);
    // A copy in the hand when Raio enters doesn't trigger.
    const inHand = d({ me: { hand: ["BP05-035", "BP08-041"], playPoints: 7, evolutionPoints: 1 } }).play("BP05-035");
    expect([inHand.decision?.type, inHand.game.state.players[0].evolutionPoints]).toEqual(["mainPhase", 1]);
  });

  it("042 / 043 Elusa — evolved searches an Arcanaform follower", () => {
    const t = d({ me: { field: ["BP08-042"], evolveDeck: ["BP08-043"], deck: ["V1", MORRA], playPoints: 2 } });
    t.evolve("BP08-042").pick(MORRA);
    expect(t.hand()).toEqual([MORRA]);
  });

  it("044 Morra — Fanfare: draw, then discard a card", () => {
    const t = d({ me: { hand: [MORRA, "V1"], deck: ["V3"], playPoints: 1 } }).play(MORRA).pick("V1");
    expect([t.hand(), t.cemetery()]).toEqual([["V3"], ["V1"]]);
  });

  it("045 Veridic Discovery — Quick; draw 2, discard 1", () => {
    const t = d({ me: { hand: ["BP08-045", "V1"], deck: ["V3", "V5"], playPoints: 2 } }).play("BP08-045").pick("V1");
    expect([t.hand(), t.cemetery()]).toEqual([["V3", "V5"], ["V1", "BP08-045"]]);
    // Played in the opponent's end phase quick window.
    const quick = d({ turn: 6, me: { hand: ["BP08-045"], deck: ["V3", "V5"], playPoints: 2 }, opp: { deck: ["V1"] } });
    quick.game.act({ type: "mainPhase", action: { type: "endMainPhase" } });
    quick.quick("BP08-045").pick("V3");
    expect(quick.hand()).toEqual(["V5"]);
  });

  it("046 Moonshade Mage — Ward; Fanfare: draw 3, discard 2; act (engage, discard a card): 6 damage", () => {
    const t = d({ me: { hand: ["BP08-046"], deck: ["V1", "V2", "V3"], playPoints: 8 } }).play("BP08-046").none().pick("V1", "V2");
    expect([t.hand(), t.keywords("BP08-046")]).toEqual([["V3"], ["ward"]]);
    const act = d({ me: { field: ["BP08-046"], hand: ["V1"] }, opp: { field: ["V5"] } }).activate("BP08-046");
    expect([act.field("opp"), act.hand(), act.engaged("BP08-046")]).toEqual([[], [], true]);
    expect(d({ me: { field: ["BP08-046"] }, opp: { field: ["V5"] } }).canActivate("BP08-046")).toBe(false);
  });

  it("047 Zealot of Truth — Storm; +1/+1 with 5 Mage cards in the cemetery", () => {
    const five = Array<string>(5).fill("BP08-042");
    const t = d({ me: { hand: ["BP08-047"], cemetery: five, playPoints: 3 } }).play("BP08-047");
    expect([t.stats("BP08-047"), t.keywords("BP08-047")]).toEqual([[3, 5], ["storm"]]);
    expect(d({ me: { hand: ["BP08-047"], cemetery: five.slice(1), playPoints: 3 } }).play("BP08-047").stats("BP08-047")).toEqual([2, 4]);
  });

  it("048 / 049 Rabbit Mage — Fanfare: a Magic Sediment; evolved takes a card with Earth Rite from the top 4", () => {
    expect(d({ me: { hand: ["BP08-048"], playPoints: 2 } }).play("BP08-048").field()).toEqual(["BP08-048", "BP01-T10"]);
    const t = d({ me: { field: ["BP08-048"], evolveDeck: ["BP08-049"], deck: ["V1", "BP01-051", "V3"], playPoints: 1 } });
    t.evolve("BP08-048").pick("BP01-051").order();
    expect(t.hand()).toEqual(["BP01-051"]);
  });

  it("050 Zealot of Destruction — with 3 Idolatry cards on your field (itself too): destroy, 2 to its leader, leader +2", () => {
    const t = d({ me: { hand: ["BP08-050"], field: ["BP05-T01", "BP05-T02"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP08-050");
    expect([t.field("opp"), t.leader("opp"), t.leader()]).toEqual([[], 18, 22]);
    const two = d({ me: { hand: ["BP08-050"], field: ["BP05-T01"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP08-050");
    expect([two.field("opp"), two.leader()]).toEqual([["V5"], 20]);
  });

  it("051 Joy of Destruction — an Idolatry card recovers 1 PP; Lishenna draws a card; both, or neither", () => {
    const both = d({ me: { hand: ["BP08-051"], field: ["BP05-037"], deck: ["V1"], playPoints: 1, maxPlayPoints: 5 } }).play("BP08-051");
    expect([both.pp(), both.hand()]).toEqual([2, ["V1"]]);
    const neither = d({ me: { hand: ["BP08-051"], field: ["V1"], deck: ["V1"], playPoints: 1, maxPlayPoints: 5 } }).play("BP08-051");
    expect([neither.pp(), neither.hand()]).toEqual([1, []]);
  });
});
