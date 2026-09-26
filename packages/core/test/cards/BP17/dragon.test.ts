import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP17 Dragoncraft (055–072, T06). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); QUICK-SAC (0) destroys one of your
// followers. Overflow: max play points 7 or more. Marine: BP17-065, BP17-067, BP15-069 (a follower). Natura: BP17-009,
// BP17-015; Natura spells BP17-048, BP17-117. BP16-067 Marion (Fanfare: draw, discard). Tokens: BP07-T03 Naterran Great
// Tree (leaving the field: draw, discard), BP17-T06 Curse of the Black Dragon.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const TREE = "BP07-T03";
const CURSE = "BP17-T06";
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };

describe("BP17 Dragoncraft", () => {
  it("055 Rowen, Dragon Lance — Rush, Assail; Fanfare: a Curse of the Black Dragon; Strike: 2 damage, 1 to its leader with Overflow; act (4): 3 damage and 1 to its leader", () => {
    expect(d({ me: { hand: ["BP17-055"], playPoints: 3 } }).play("BP17-055").ex()).toEqual([CURSE]);
    const t = d({ me: { field: ["BP17-055"], maxPlayPoints: 7 }, opp: { field: ["V5"] } }).attack("BP17-055", "opp:leader");
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[5, 3], 15]);
    expect(d({ me: { field: ["BP17-055"], maxPlayPoints: 6 }, opp: { field: ["V5"] } }).attack("BP17-055", "opp:leader").leader("opp")).toBe(16);
    const act = d({ me: { field: ["BP17-055"], playPoints: 4 }, opp: { field: ["V5"] } }).activate("BP17-055");
    expect([act.stats("opp:V5"), act.leader("opp"), act.keywords("BP17-055")]).toEqual([[5, 2], 19, ["rush", "assail"]]);
  });

  it("056 Valdain, Forest Shadow — Rush; Fanfare, banish X Naterran Great Trees: up to X of destroy, 2 Natura spells into the EX area, leader +2", () => {
    const t = d({ me: { hand: ["BP17-056"], field: [TREE, TREE], deck: ["BP17-117", "BP17-048", "V1", "V3"], playPoints: 6 }, opp: { field: ["V5"] } });
    t.play("BP17-056").choose("2").choose("destroy", "search").pick("BP17-117").pick("BP17-048").flush();
    expect([t.field(), t.field("opp"), t.ex(), t.leader()]).toEqual([["BP17-056"], [], ["BP17-117", "BP17-048"], 20]);
    const one = d({ me: { hand: ["BP17-056"], field: [TREE, TREE], deck: ["V1", "V3"], playPoints: 6 }, opp: { field: ["V5"] } });
    one.play("BP17-056").choose("1").choose("leader").pick(TREE).flush();
    expect([one.leader(), one.field(), one.field("opp")]).toEqual([22, [TREE, "BP17-056"], ["V5"]]);
  });

  it("057 / 058 Disrestan, Ocean Harbinger — Fanfare, discard a Marine card: 3 times the top card into the EX area; evolved: -X/-X per Marine card in the EX area; act (2) once per turn, bury a Marine card from the EX area: +2/+2 and Storm", () => {
    const t = d({ me: { hand: ["BP17-057", "BP17-067"], deck: ["V1", "V3", "V5", "V1"], playPoints: 5 } }).play("BP17-057").yes();
    expect(t.ex()).toEqual(["V1", "V3", "V5"]);
    expect(d({ me: { field: ["BP17-057"], evolveDeck: ["BP17-058"], ex: ["BP17-067", "BP17-065", "V1"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP17-057").stats("opp:V5")).toEqual([3, 3]);
    const act = d({ me: { field: [{ card: "BP17-057", evolvedInto: "BP17-058" }], ex: ["BP17-067"], playPoints: 2 } }).activate("BP17-057");
    expect([act.stats("BP17-057"), act.keywords("BP17-057"), act.cemetery(), act.canActivate("BP17-057")]).toEqual([[8, 8], ["storm"], ["BP17-067"], false]);
  });

  it("059 / 060 Djeana, the Stouthearted — Fanfare: a Naterran Great Tree; evolved, discard 2 Natura cards: max play points +1; super-evolved: up to 2 Natura cards from the top 4", () => {
    expect(d({ me: { hand: ["BP17-059"], playPoints: 2 } }).play("BP17-059").field()).toEqual(["BP17-059", TREE]);
    const t = d({ me: { field: ["BP17-059"], evolveDeck: ["BP17-060"], hand: ["BP17-009", "BP17-015"], maxPlayPoints: 5, playPoints: 1 } }).evolve("BP17-059").yes();
    expect([t.game.state.players[0].maxPlayPoints, t.hand()]).toEqual([6, []]);
    const s = d({ me: { field: ["BP17-059"], evolveDeck: ["BP17-060"], deck: ["BP17-009", "V1", "BP17-015", "V3"], playPoints: 1, ...SUPER } });
    s.evolve("BP17-059", { sep: true }).flush().pick("BP17-009", "BP17-015").order();
    expect(s.hand()).toEqual(["BP17-009", "BP17-015"]);
  });

  it("061 Verdant Rebirth — 1 less per Naterran Great Tree that left your field this turn; 5 damage", () => {
    const t = d({ me: { hand: ["BP17-061"], leftFieldThisTurn: [TREE, TREE], playPoints: 1 }, opp: { field: ["V5"] } });
    expect(t.canPlay("BP17-061")).toBe(true);
    expect(t.play("BP17-061").field("opp")).toEqual([]);
    expect(d({ me: { hand: ["BP17-061"], leftFieldThisTurn: ["V1"], playPoints: 2 }, opp: { field: ["V5"] } }).canPlay("BP17-061")).toBe(false);
  });

  it("062 Dragonslayer Spear — Fanfare: 2 damage; act, engage and bury it: Rowen doesn't take the next damage this turn", () => {
    expect(d({ me: { hand: ["BP17-062"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP17-062").stats("opp:V5")).toEqual([5, 3]);
    const t = d({ me: { field: ["BP17-062", "BP17-055"] }, opp: { field: [{ card: "V5", engaged: true }] } }).activate("BP17-062").attack("BP17-055", "opp:V5");
    expect([t.stats("BP17-055"), t.field("opp")]).toEqual([[4, 2], []]);
  });

  it("063 / 064 Forestclaw Sentinel — Fanfare: a Naterran Great Tree; evolved: 3 damage", () => {
    expect(d({ me: { hand: ["BP17-063"], playPoints: 3 } }).play("BP17-063").field()).toEqual(["BP17-063", TREE]);
    expect(d({ me: { field: ["BP17-063"], evolveDeck: ["BP17-064"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP17-063").stats("opp:V5")).toEqual([5, 2]);
  });

  it("065 Rock Whale — Ward; Fanfare, discard a Marine card: draw 2, recover 3 when played from the EX area", () => {
    const t = d({ me: { hand: ["BP17-065", "BP17-067"], deck: ["V1", "V3"], playPoints: 4 } }).play("BP17-065").none().yes();
    expect([t.hand(), t.pp()]).toEqual([["V1", "V3"], 0]);
    expect(d({ me: { ex: ["BP17-065"], hand: ["BP17-067"], deck: ["V1", "V3"], playPoints: 4 } }).play("BP17-065@ex").none().yes().pp()).toBe(3);
  });

  it("066 Newfound Allies — shuffle, up to 2 followers from the top 2 onto the field, bury the rest", () => {
    const t = d({ me: { hand: ["BP17-066"], deck: ["V1", "V3"], playPoints: 8 } }).play("BP17-066").pick("V1", "V3");
    expect([...t.field()].sort()).toEqual(["V1", "V3"]);
    const one = d({ me: { hand: ["BP17-066"], deck: ["V1", "KILL"], playPoints: 8 } }).play("BP17-066").pick("V1");
    expect([one.field(), one.cemetery()]).toEqual([["V1"], ["KILL", "BP17-066"]]);
  });

  it("067 / 068 Shark Warrior — Fanfare: 2 damage when played from the EX area; evolved: 2 damage", () => {
    expect(d({ me: { hand: ["BP17-067"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP17-067").stats("opp:V5")).toEqual([5, 5]);
    expect(d({ me: { ex: ["BP17-067"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP17-067@ex").stats("opp:V5")).toEqual([5, 3]);
    expect(d({ me: { field: ["BP17-067"], evolveDeck: ["BP17-068"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP17-067").stats("opp:V5")).toEqual([5, 3]);
  });

  it("069 Poisonous Dilophosaurus — Bane; Fanfare, banish a Naterran Great Tree: destroy; Last Words: a Naterran Great Tree", () => {
    const t = d({ me: { hand: ["BP17-069"], field: [TREE], deck: ["V1"], playPoints: 6 }, opp: { field: ["V5"] } }).play("BP17-069").yes();
    expect([t.field(), t.field("opp"), t.cemetery()]).toEqual([["BP17-069"], [], ["V1"]]);
    expect(d({ me: { field: ["BP17-069"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").field()).toEqual([TREE]);
  });

  it("070 Mánagarmr Scout — Fanfare: a Naterran Great Tree; act (1) twice per turn, banish a tree: 2 damage", () => {
    expect(d({ me: { hand: ["BP17-070"], playPoints: 3 } }).play("BP17-070").field()).toEqual(["BP17-070", TREE]);
    const t = d({ me: { field: ["BP17-070", TREE, TREE, TREE], deck: ["V1", "V3", "V5"], playPoints: 3 }, opp: { field: ["V5"] } });
    t.activate("BP17-070").pick(TREE).activate("BP17-070").pick(TREE);
    expect([t.stats("opp:V5"), t.canActivate("BP17-070")]).toEqual([[5, 1], false]);
  });

  it("071 Mermaid Archer — act, engage and put a Marine card from the hand into the EX area: damage per Marine follower of yours", () => {
    const t = d({ me: { field: ["BP17-071", "BP15-069"], hand: ["BP17-067"] }, opp: { field: ["V5"] } }).activate("BP17-071");
    expect([t.stats("opp:V5"), t.ex()]).toEqual([[5, 3], ["BP17-067"]]);
    expect(d({ me: { field: ["BP17-071"], hand: ["BP17-067"], ex: ["V1", "V1", "V1", "V1", "V1"] }, opp: { field: ["V5"] } }).canActivate("BP17-071")).toBe(false);
  });

  it("072 Touching Thoughts — discarded, may go into the EX area; a Naterran Great Tree, and with Overflow leader +1 and recover 1", () => {
    const t = d({ me: { hand: ["BP17-072"], maxPlayPoints: 7, playPoints: 2 } }).play("BP17-072");
    expect([t.field(), t.leader(), t.pp()]).toEqual([[TREE], 21, 1]);
    const dis = d({ me: { hand: ["BP17-072", "BP16-067"], deck: ["V1"], playPoints: 2 } }).play("BP16-067").pick("BP17-072").yes();
    expect(dis.ex()).toEqual(["BP17-072"]);
  });

  it("T06 Curse of the Black Dragon — only with Overflow; Rowen deals 1 more damage this turn; end phase in the EX area without Overflow: 1 to your leader", () => {
    expect(d({ me: { ex: [CURSE], field: ["BP17-055"], maxPlayPoints: 6 } }).canPlay(`${CURSE}@ex`)).toBe(false);
    const t = d({ me: { ex: [CURSE], field: ["BP17-055"], maxPlayPoints: 7 }, opp: { field: [{ card: "V5", engaged: true }, "V3"] } }).play(`${CURSE}@ex`);
    t.attack("BP17-055", "opp:V5").pick("opp:V3");
    expect([t.field("opp"), t.stats("opp:V3")]).toEqual([["V3"], [3, 1]]);
    expect(d({ me: { ex: [CURSE], maxPlayPoints: 6 }, opp: { deck: ["V1"] } }).end().leader()).toBe(19);
  });
});
