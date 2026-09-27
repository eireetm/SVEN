import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// CP04 Forestcraft (001–018, T01), Princess Connect! Re: Dive. Both decks are based on the universe, so Union Burst abilities
// are valid (CR 14.5.1.2). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). CP04-105 Suzume (2c; UB Fanfare: leader +2) executes a
// Union Burst ability for "whenever a {[ub]} ability of another follower on your field is executed". QUICK-SAC destroys a
// follower of yours.
const E = cardEngine();
const PC = { universe: "princessConnect" as const };
const d = (spec: DriveSpec) => drive(E, { ...spec, me: { ...PC, ...spec.me }, opp: { ...PC, ...spec.opp } });
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };

describe("CP04 Forestcraft", () => {
  it("001 / 002 / T01 Kokkoro — UB Fanfare: leader +1; Fanfare (2): an Ameth Amulet, whose ability gives each follower +1/+1; evolved draws", () => {
    const t = d({ me: { hand: ["CP04-001"], field: ["V1"], playPoints: 3 } }).play("CP04-001").flush().yes();
    expect([t.leader(), t.zone("me", "equipmentZone"), t.pp()]).toEqual([21, ["CP04-T01"], 0]);
    t.activate("CP04-001");
    expect([t.stats("CP04-001"), t.stats("V1"), t.engaged("CP04-001")]).toEqual([[2, 2], [3, 3], true]);
    const e = d({ me: { field: ["CP04-001"], evolveDeck: ["CP04-002"], deck: ["V1", "V3", "V5"], playPoints: 2, ...SUPER } });
    e.evolve("CP04-001", { sep: true }).flush();
    expect([e.hand().length, e.leader()]).toEqual([2, 22]);
  });

  it("003 Eris — UB Activate: another PriConne follower +1/+1; Fanfare: a PriConne card from the top 4, the next PriConne card costs 2 less", () => {
    const a = d({ me: { field: ["CP04-003", "CP04-001"] } }).activate("CP04-003");
    expect([a.stats("CP04-001"), a.keywords("CP04-001")]).toEqual([[2, 2], []]);
    const t = d({ me: { hand: ["CP04-003", "CP04-105"], deck: ["V1", "CP04-001", "V3", "V5"], playPoints: 4 } }).play("CP04-003").pick("CP04-001").order();
    expect([t.hand().sort(), t.pp(), t.canPlay("CP04-105"), t.canPlay("CP04-001")]).toEqual([["CP04-001", "CP04-105"], 0, true, true]);
  });

  it("004 Nephi Nela — UB Fanfare: 4 damage and the top card into the EX area; 1-cost PriConne followers from the EX area cost 1 less", () => {
    const t = d({ me: { hand: ["CP04-004"], deck: ["V1", "V3"], playPoints: 5 }, opp: { field: ["V5"] } }).play("CP04-004");
    expect([t.stats("opp:V5"), t.ex()]).toEqual([[5, 1], ["V1"]]);
    expect(d({ me: { field: ["CP04-004"], ex: ["CP04-001"], playPoints: 0 } }).canPlay("CP04-001")).toBe(true);
    const u = d({ me: { field: ["CP04-004"], hand: ["CP04-105"], deck: ["V1"], playPoints: 2 } }).play("CP04-105");
    expect([u.ex(), u.leader()]).toEqual([["V1"], 22]);
  });

  it("005 / 006 Shiori — Fanfare: refresh a PriConne follower, it can't attack enemies; evolved UB: 2 damage to the enemy leader", () => {
    const t = d({ me: { field: [{ card: "CP04-001", engaged: true }], hand: ["CP04-005"], playPoints: 2 }, opp: { field: [{ card: "V1", engaged: true }] } });
    t.play("CP04-005").pick("CP04-001");
    expect([t.engaged("CP04-001"), t.attackTargets("CP04-001")]).toEqual([false, []]);
    expect(d({ me: { field: ["CP04-005"], evolveDeck: ["CP04-006"], playPoints: 1 } }).evolve("CP04-005").leader("opp")).toBe(18);
  });

  it("007 Anemone — Ward; UB Fanfare: 1 damage to the enemy leader, leader +1; the same when put into your EX area", () => {
    const t = d({ me: { hand: ["CP04-007"], playPoints: 1 } }).play("CP04-007").none();
    expect([t.leader(), t.leader("opp"), t.keywords("CP04-007")]).toEqual([21, 19, ["ward"]]);
    const x = d({ me: { hand: ["CP04-004"], deck: ["CP04-007"], playPoints: 5 }, opp: { field: ["V5"] } }).play("CP04-004");
    expect([x.ex(), x.leader(), x.leader("opp")]).toEqual([["CP04-007"], 21, 19]);
  });

  it("008 Makoto — UB Fanfare, engage 3 cards on your field: 4 damage to a follower and 2 to its leader", () => {
    const t = d({ me: { hand: ["CP04-008"], field: ["V1", "V3"], playPoints: 2 }, opp: { field: ["V5"] } }).play("CP04-008").yes();
    expect([t.stats("opp:V5"), t.leader("opp"), t.engaged("V1"), t.engaged("CP04-008")]).toEqual([[5, 1], 18, true, true]);
  });

  it("009 / 010 Rino — played from the EX area it evolves; evolved UB: 1 damage to each enemy follower", () => {
    const t = d({ me: { ex: ["CP04-009"], evolveDeck: ["CP04-010"], playPoints: 1 }, opp: { field: ["V5", "V1"] } }).play("CP04-009").yes();
    expect([t.stats("CP04-009"), t.stats("opp:V5"), t.stats("opp:V1")]).toEqual([[2, 2], [5, 4], [2, 1]]);
    expect(d({ me: { hand: ["CP04-009"], evolveDeck: ["CP04-010"], playPoints: 1 } }).play("CP04-009").stats("CP04-009")).toEqual([1, 1]);
  });

  it("011 Cleuru — 2 Bunclie counters unless from the hand; 1 more at your end phase; UB Activate, remove 2: leader +2, draw", () => {
    expect(d({ me: { ex: ["CP04-011"], playPoints: 2 } }).play("CP04-011").counters("CP04-011", "bunclie")).toBe(2);
    expect(d({ me: { hand: ["CP04-011"], playPoints: 2 } }).play("CP04-011").counters("CP04-011", "bunclie")).toBe(0);
    expect(d({ me: { field: ["CP04-011"] }, opp: { deck: ["V1"] } }).end().counters("CP04-011", "bunclie")).toBe(1);
    const t = d({ me: { field: [{ card: "CP04-011", counters: { bunclie: 2 } }], deck: ["V1"] } }).activate("CP04-011");
    expect([t.leader(), t.hand(), t.counters("CP04-011", "bunclie")]).toEqual([22, ["V1"], 0]);
  });

  it("012 Nea — UB Activate: in the opponent's next turn, while it is engaged, their followers must attack if able; Last Words: no refresh", () => {
    const t = d({ me: { field: ["CP04-012"], deck: ["V1"] }, opp: { field: ["V3"], deck: ["V1", "V1"] } }).activate("CP04-012").end();
    const canEnd = () => t.decision?.type === "mainPhase" && t.decision.actions.some((a) => a.type === "endMainPhase");
    expect(canEnd()).toBe(false);
    // Nea is engaged and has Ward, so V3 must attack it; Nea is destroyed and its Last Words keeps V3 engaged.
    t.attack("opp:V3", "CP04-012").flush();
    expect([canEnd(), t.field(), t.engaged("opp:V3")]).toEqual([true, [], true]);
    const reserved = d({ me: { field: ["CP04-012"], deck: ["V1"] }, opp: { field: ["V3"], deck: ["V1", "V1"] } }).end().none();
    expect(reserved.decision?.type === "mainPhase" && reserved.decision.actions.some((a) => a.type === "endMainPhase")).toBe(true);
  });

  it("013 / 014 Lima — only playable on your 5th turn or later; Ward; evolved UB: leader +3", () => {
    expect(d({ me: { hand: ["CP04-013"], playPoints: 1 } }).canPlay("CP04-013")).toBe(false);
    expect(d({ me: { hand: ["CP04-013"], playPoints: 1, turnsPassed: 5 } }).canPlay("CP04-013")).toBe(true);
    const e = d({ me: { field: ["CP04-013"], evolveDeck: ["CP04-014"], playPoints: 1 } }).evolve("CP04-013");
    expect([e.leader(), e.keywords("CP04-013")]).toEqual([23, ["ward"]]);
  });

  it("015 Aoi — UB Activate: an enemy follower -1/-1", () => {
    expect(d({ me: { field: ["CP04-015"] }, opp: { field: ["V5"] } }).activate("CP04-015").stats("opp:V5")).toEqual([4, 4]);
  });

  it("016 Nebbia — Rush; Fanfare, another card of yours into the EX area: engage an enemy follower; UB Strike: no damage this turn", () => {
    const t = d({ me: { hand: ["CP04-016"], field: ["V1"], playPoints: 2 }, opp: { field: ["V5"] } }).play("CP04-016").yes();
    expect([t.engaged("opp:V5"), t.ex(), t.keywords("CP04-016")]).toEqual([true, ["V1"], ["rush"]]);
    const s = d({ me: { field: ["CP04-016"] }, opp: { field: [{ card: "V5", engaged: true }] } }).attack("CP04-016", "opp:V5");
    expect([s.stats("CP04-016"), s.stats("opp:V5")]).toEqual([[3, 2], [5, 2]]);
  });

  it("017 Suzuna — Fanfare: discard a card; UB Activate: 3 damage", () => {
    expect(d({ me: { hand: ["CP04-017", "V1"], playPoints: 3 } }).play("CP04-017").cemetery()).toEqual(["V1"]);
    expect(d({ me: { field: ["CP04-017"] }, opp: { field: ["V5"] } }).activate("CP04-017").stats("opp:V5")).toEqual([5, 2]);
  });

  it("018 Aurora Healing — refresh a PriConne follower that can't attack enemies this turn; a 1-cost one draws", () => {
    const t = d({ me: { field: [{ card: "CP04-001", engaged: true }], hand: ["CP04-018"], deck: ["V1"], playPoints: 1 } }).play("CP04-018");
    expect([t.engaged("CP04-001"), t.hand()]).toEqual([false, ["V1"]]);
  });
});
