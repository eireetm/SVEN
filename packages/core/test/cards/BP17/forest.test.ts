import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP17 Forestcraft (001–018, T01–T03). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); QUICK-SAC (0) destroys one of your
// followers. Natura / Beast: BP17-002, 009, 015 (Natura and Beast), BP17-004 Setus (Beast). Tokens: BP07-T03 Naterran
// Great Tree (leaving the field: draw, discard), BP05-T03 Puppet, BP17-T01 Lococo's Teddy Bear, T02 Gale Arrow, T03 Storm
// Arrow.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const TREE = "BP07-T03";
const PUPPET = "BP05-T03";
const TEDDY = "BP17-T01";
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };

describe("BP17 Forestcraft", () => {
  it("001 Arisa, Evergreen Arrow — Fanfare: a Gale Arrow or Storm Arrow into the EX area; act, engage, after playing 5 cards this turn: a Forest Guardian's Bow from the deck", () => {
    expect(d({ me: { hand: ["BP17-001"], playPoints: 1 } }).play("BP17-001").choose("Storm Arrow").ex()).toEqual(["BP17-T03"]);
    const t = d({ me: { field: ["BP17-001"], deck: ["V1", "BP17-008"], playedThisTurn: 5 } }).activate("BP17-001").pick("BP17-008");
    expect(t.field()).toEqual(["BP17-001", "BP17-008"]);
    expect(d({ me: { field: ["BP17-001"], deck: ["BP17-008"], playedThisTurn: 4 } }).canActivate("BP17-001")).toBe(false);
  });

  it("002 / 003 Ladica, Verdant Claw — Fanfare: a Natura card from the top 5; evolved: a Naterran Great Tree into the EX area, then damage per tree there; super-evolved: to its leader too", () => {
    expect(d({ me: { hand: ["BP17-002"], deck: ["V1", "BP17-009", "V3", "V5", "V1"], playPoints: 3 } }).play("BP17-002").pick("BP17-009").order().hand()).toEqual(["BP17-009"]);
    const t = d({ me: { field: ["BP17-002"], evolveDeck: ["BP17-003"], ex: [TREE], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP17-002");
    expect([t.stats("opp:V5"), t.ex()]).toEqual([[5, 3], [TREE, TREE]]);
    const s = d({ me: { field: ["BP17-002"], evolveDeck: ["BP17-003"], ex: [TREE], playPoints: 1, ...SUPER }, opp: { field: ["V5"] } }).evolve("BP17-002", { sep: true }).flush();
    expect([s.field("opp"), s.leader("opp")]).toEqual([[], 17]);
  });

  it("004 Setus, Sunlit Hero — Ward; recover 1 once on your turn when you play a Beast card; Fanfare: twice, the top card into the EX area, leader +2 for a Beast card", () => {
    const t = d({ me: { hand: ["BP17-004"], deck: ["BP17-002", "V1"], playPoints: 4 } }).play("BP17-004").none();
    expect([t.ex(), t.leader()]).toEqual([["BP17-002", "V1"], 22]);
    const beasts = d({ me: { field: ["BP17-004"], hand: ["BP17-009", "BP17-002"], deck: ["V1", "V3", "V5"], playPoints: 5 } }).play("BP17-009").flush();
    expect(beasts.pp()).toBe(4);
    expect(beasts.play("BP17-002").flush().pp()).toBe(1);
  });

  it("005 / 006 Lococo, Little Puppeteer — evolved: destroy each other follower; each player gets a Lococo's Teddy Bear per destroyed follower of theirs", () => {
    const t = d({ me: { field: ["BP17-005", "V1", "V3"], evolveDeck: ["BP17-006"], playPoints: 3 }, opp: { field: ["V5"] } }).evolve("BP17-005");
    expect([t.field(), t.field("opp")]).toEqual([["BP17-005", TEDDY, TEDDY], [TEDDY]]);
  });

  it("007 Friendly Embrace — 2 less for engaging 2 Naterran Great Trees; leader +1, draw", () => {
    const t = d({ me: { hand: ["BP17-007"], field: [TREE, TREE], deck: ["V1"], playPoints: 0 } }).play("BP17-007");
    expect([t.leader(), t.hand(), t.engaged(TREE)]).toEqual([21, ["V1"], true]);
  });

  it("008 Forest Guardian's Bow — Fanfare: 2 arrow counters with Arisa; one when a Forestcraft follower comes, once per turn; act, engage and bury it: its arrow counters in damage", () => {
    expect(d({ me: { hand: ["BP17-008"], field: ["BP17-001"], playPoints: 1 } }).play("BP17-008").counters("BP17-008", "arrow")).toBe(2);
    const t = d({ me: { field: ["BP17-008"], hand: ["BP17-009", "BP17-002"], playPoints: 5 } }).play("BP17-009").flush().play("BP17-002").flush();
    expect(t.counters("BP17-008", "arrow")).toBe(1);
    const act = d({ me: { field: [{ card: "BP17-008", counters: { arrow: 3 } }] }, opp: { field: ["V5"] } }).activate("BP17-008");
    expect([act.stats("opp:V5"), act.cemetery()]).toEqual([[5, 2], ["BP17-008"]]);
  });

  it("009 / 010 Beastfolk Harvester — Fanfare: a Naterran Great Tree into the EX area, leader +1 with 3 Natura cards there; evolved: 2 damage", () => {
    expect(d({ me: { hand: ["BP17-009"], ex: ["BP17-002", "V1"], playPoints: 2 } }).play("BP17-009").leader()).toBe(20);
    expect(d({ me: { hand: ["BP17-009"], ex: ["BP17-002", "BP17-015"], playPoints: 2 } }).play("BP17-009").leader()).toBe(21);
    expect(d({ me: { field: ["BP17-009"], evolveDeck: ["BP17-010"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP17-009").stats("opp:V5")).toEqual([5, 3]);
  });

  it("011 Heroic Resolve — 1 less from the EX area, 1 less with a Setus follower; 4 damage to an enemy follower, +1/+1 to a Beast follower of yours", () => {
    const t = d({ me: { hand: ["BP17-011"], field: ["BP17-002"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP17-011");
    expect([t.stats("opp:V5"), t.stats("BP17-002")]).toEqual([[5, 1], [4, 4]]);
    expect(d({ me: { ex: ["BP17-011"], field: ["BP17-004"], playPoints: 0 }, opp: { field: ["V5"] } }).canPlay("BP17-011@ex")).toBe(true);
    expect(d({ me: { hand: ["BP17-011"], field: ["BP17-002"], playPoints: 1 }, opp: { field: ["V5"] } }).canPlay("BP17-011")).toBe(false);
  });

  it("012 Inverted Manipulation — +2/+2 to a Puppetry token follower, or 2 Puppets into the EX area", () => {
    expect(d({ me: { hand: ["BP17-012"], playPoints: 1 } }).play("BP17-012").ex()).toEqual([PUPPET, PUPPET]);
    expect(d({ me: { hand: ["BP17-012"], field: [PUPPET], playPoints: 1 } }).play("BP17-012").choose("buff").stats(PUPPET)).toEqual([3, 3]);
  });

  it("013 / 014 Blossom Treant — Ward; Last Words: draw; evolved: leader +4", () => {
    expect(d({ me: { field: ["BP17-013"], hand: ["QUICK-SAC"], deck: ["V1"] } }).play("QUICK-SAC").hand()).toEqual(["V1"]);
    expect(d({ me: { field: ["BP17-013"], evolveDeck: ["BP17-014"], playPoints: 3 } }).evolve("BP17-013").leader()).toBe(24);
  });

  it("015 Sköll Lookout — Fanfare: a Naterran Great Tree into the EX area; act, engage and banish a tree from your field: draw", () => {
    expect(d({ me: { hand: ["BP17-015"], playPoints: 2 } }).play("BP17-015").ex()).toEqual([TREE]);
    // The tree's own "leaves the field: draw, discard" follows.
    const t = d({ me: { field: ["BP17-015", TREE], deck: ["V1", "V3"] } }).activate("BP17-015").pick("V1");
    expect([t.field(), t.hand(), t.engaged("BP17-015")]).toEqual([["BP17-015"], ["V3"], true]);
  });

  it("016 Elf Sorcerer — Fanfare / Last Words: -5/-5 to an enemy follower", () => {
    expect(d({ me: { hand: ["BP17-016"], playPoints: 6 }, opp: { field: ["V5"] } }).play("BP17-016").field("opp")).toEqual([]);
    expect(d({ me: { field: ["BP17-016"], hand: ["QUICK-SAC"] }, opp: { field: ["V5"] } }).play("QUICK-SAC").field("opp")).toEqual([]);
  });

  it("017 Threadsnipper Puppet — act, engage: a Puppet into the EX area; act, engage and banish a Puppet there: draw", () => {
    expect(d({ me: { field: ["BP17-017"] } }).activate("BP17-017").ex()).toEqual([PUPPET]);
    const t = d({ me: { field: ["BP17-017"], ex: [PUPPET], deck: ["V1"] } }).activate("BP17-017", 1);
    expect([t.hand(), t.ex()]).toEqual([["V1"], []]);
  });

  it("018 Heroic Fairy Champion — Ward; Fanfare (2): +2/+2; Strike: no damage this turn", () => {
    expect(d({ me: { hand: ["BP17-018"], playPoints: 6 } }).play("BP17-018").none().yes().stats("BP17-018")).toEqual([6, 6]);
    const t = d({ me: { field: ["BP17-018"] }, opp: { field: [{ card: "V5", engaged: true }] } }).attack("BP17-018", "opp:V5");
    expect([t.stats("BP17-018"), t.stats("opp:V5")]).toEqual([[4, 4], [5, 1]]);
  });

  it("T01 Lococo's Teddy Bear — Last Words: 1 damage to your leader", () => {
    expect(d({ me: { field: [TEDDY], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").leader()).toBe(19);
  });

  it("T02 Gale Arrow / T03 Storm Arrow — Combo (3): 2 damage to the selected follower; Combo (5): 2 to the enemy leader", () => {
    expect(d({ me: { ex: ["BP17-T02"], playedThisTurn: 2, playPoints: 1 }, opp: { field: ["V5"] } }).play("BP17-T02@ex").stats("opp:V5")).toEqual([5, 3]);
    expect(d({ me: { ex: ["BP17-T02"], playedThisTurn: 1, playPoints: 1 }, opp: { field: ["V5"] } }).play("BP17-T02@ex").stats("opp:V5")).toEqual([5, 5]);
    expect(d({ me: { ex: ["BP17-T03"], playedThisTurn: 4, playPoints: 1 } }).play("BP17-T03@ex").leader("opp")).toBe(18);
  });
});
