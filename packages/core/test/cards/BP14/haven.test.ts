import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP14 Havencraft (088–104, T06, T07). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral); KILL destroys
// an enemy follower; QUICK-SAC destroys one of your followers. Zealot: BP14-088 (4), BP14-093 (4), BP14-095 (2),
// Fox of Invitation. BP14-086 is a 2-cost Abysscraft spell: 5 damage to an enemy follower and 3 to your leader.
// Tokens: BP14-T06 Fox of Invitation (Ward; Fanfare: leader +1), BP14-T07 Mercurial Might, BP01-T16 Holy Falcon.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const FOX = "BP14-T06";
const FALCON = "BP01-T16";
const n = (count: number, id = "V1") => Array<string>(count).fill(id);

describe("BP14 Havencraft", () => {
  it("088 / 089 All-Feeling Divine — Fanfare: a Fox of Invitation; from the cemetery, (2): another Fox and every Fox +2/+1; evolved: 2 x your Zealot followers", () => {
    const t = d({ me: { hand: ["BP14-088"], playPoints: 4 } }).play("BP14-088").none();
    expect([t.field(), t.leader()]).toEqual([["BP14-088", FOX], 21]);
    const act = d({ me: { cemetery: ["BP14-088"], field: [FOX], playPoints: 2 } }).activate("BP14-088@cemetery").none();
    expect([act.field(), act.zone("me", "banished"), act.ids(`${FOX}@field`).map((id) => act.game.reader().info(id).attack)]).toEqual([
      [FOX, FOX],
      ["BP14-088"],
      [2, 2],
    ]);
    const evo = d({ me: { field: ["BP14-088", FOX], evolveDeck: ["BP14-089"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP14-088");
    expect(evo.stats("opp:V5")).toEqual([5, 1]);
  });

  it("090 Shion — Ward; not destroyed by abilities; it and your leader take 1 less damage; Fanfare: a Mercurial Might", () => {
    const hit = d({ me: { hand: ["BP14-086"], playPoints: 2 }, opp: { field: ["BP14-090"] } }).play("BP14-086");
    expect([hit.stats("opp:BP14-090"), hit.leader()]).toEqual([[3, 3], 17]);
    expect(d({ me: { field: ["BP14-090"], hand: ["BP14-086"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP14-086").leader()).toBe(18);
    expect(d({ me: { hand: ["KILL"], playPoints: 1 }, opp: { field: ["BP14-090"] } }).play("KILL").field("opp")).toEqual(["BP14-090"]);
    expect(d({ me: { hand: ["BP14-090"], playPoints: 6 } }).play("BP14-090").none().ex()).toEqual(["BP14-T07"]);
  });

  it("091 / 092 Nekhbet — not from the EX area; in the EX area at the opponent's end phase, (2): 2 to the enemy leader, leader +2; evolved: recover 2; Last Words: into the EX area", () => {
    expect(d({ me: { ex: ["BP14-091"], playPoints: 3 } }).canPlay("BP14-091@ex")).toBe(false);
    // My play points left from my turn pay for it in the opponent's end phase.
    const t = d({ me: { ex: ["BP14-091"], deck: n(2), playPoints: 2 }, opp: { deck: n(2) } }).end().end().yes();
    expect([t.leader("opp"), t.leader()]).toEqual([18, 22]);
    const poor = d({ me: { ex: ["BP14-091"], deck: n(2), playPoints: 1 }, opp: { deck: n(2) } }).end().end();
    expect([poor.leader("opp"), poor.leader()]).toEqual([20, 20]);
    const evo = d({ me: { field: ["BP14-091"], evolveDeck: ["BP14-092"], playPoints: 1 } }).evolve("BP14-091");
    expect(evo.pp()).toBe(2);
    expect(d({ me: { field: [{ card: "BP14-091", evolvedInto: "BP14-092" }], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").ex()).toEqual(["BP14-091"]);
  });

  it("093 Impious Bishop — Ward; Fanfare: a Zealot card (2 or less) from the top 5 into the EX area, 2 less; once per turn when your leader gains defense: 4 damage", () => {
    const t = d({ me: { hand: ["BP14-093"], deck: ["V1", "BP14-095", "V3", "V5", "V2"], playPoints: 4 } }).play("BP14-093").none().pick("BP14-095").order();
    expect([t.ex(), t.canPlay("BP14-095@ex")]).toEqual([["BP14-095"], true]);
    const gain = d({ me: { field: ["BP14-093"], ex: [FOX, FOX], playPoints: 2 }, opp: { field: ["V5"] } });
    gain.play(`${FOX}@ex`).none();
    expect(gain.stats("opp:V5")).toEqual([5, 1]);
    gain.play(`${FOX}@ex`).none();
    expect([gain.stats("opp:V5"), gain.leader()]).toEqual([[5, 1], 22]);
  });

  it("094 Chamber of Cleansing — Fanfare: 2 Foxes into the EX area; act, engage and bury it: summon a Fox from the EX area, with a Zealot follower (2 or more) on your field", () => {
    expect(d({ me: { hand: ["BP14-094"], playPoints: 1 } }).play("BP14-094").ex()).toEqual([FOX, FOX]);
    const t = d({ me: { field: ["BP14-094", "BP14-093"], ex: [FOX, FOX] } }).activate("BP14-094").pick(FOX).none();
    expect([t.field(), t.ex(), t.leader()]).toEqual([["BP14-093", FOX], [FOX], 21]);
    expect(d({ me: { field: ["BP14-094", "BP14-095"], ex: [FOX] } }).canActivate("BP14-094")).toBe(true);
    expect(d({ me: { field: ["BP14-094", FOX], ex: [FOX] } }).canActivate("BP14-094")).toBe(false);
  });

  it("095 / 096 Winged Gatekeeper — Fanfare: a Fox into the EX area; evolved: 2 damage; 1 to the enemy leader whenever your leader gains defense", () => {
    expect(d({ me: { hand: ["BP14-095"], playPoints: 2 } }).play("BP14-095").ex()).toEqual([FOX]);
    const t = d({ me: { field: ["BP14-095"], evolveDeck: ["BP14-096"], ex: [FOX], playPoints: 2 }, opp: { field: ["V5"] } }).evolve("BP14-095");
    expect(t.stats("opp:V5")).toEqual([5, 3]);
    t.play(`${FOX}@ex`).none();
    expect([t.leader(), t.leader("opp")]).toEqual([21, 19]);
  });

  it("097 Boomerang Sister — Fanfare / act (2): banish an EX card to put an enemy follower into its owner's EX area", () => {
    const t = d({ me: { hand: ["BP14-097"], ex: ["V1", "V2"], playPoints: 5 }, opp: { field: [{ card: "V5", damage: 2 }, "V3"] } }).play("BP14-097").yes().pick("opp:V5").pick("V1");
    expect([t.ex("opp"), t.zone("me", "banished"), t.field("opp")]).toEqual([["V5"], ["V1"], ["V3"]]);
    t.activate("BP14-097");
    expect([t.ex("opp"), t.ex(), t.pp()]).toEqual([["V5", "V3"], [], 0]);
    expect(d({ me: { field: ["BP14-097"], playPoints: 2 }, opp: { field: ["V5"] } }).canActivate("BP14-097")).toBe(false);
  });

  it("098 Spiritual Blow — Quick; banish an enemy follower", () => {
    const t = d({ me: { hand: ["BP14-098"], playPoints: 3 }, opp: { field: ["V5"] } });
    expect(t.keywords("BP14-098")).toEqual(["quick"]);
    expect(t.play("BP14-098").zone("opp", "banished")).toEqual(["V5"]);
  });

  it("099 / 100 Twinblade Featherfolk — Fanfare: bury the top card, 4 damage if it wasn't Havencraft; evolved: 4 damage", () => {
    expect(d({ me: { hand: ["BP14-099"], deck: ["V1"], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP14-099").stats("opp:V5")).toEqual([5, 1]);
    expect(d({ me: { hand: ["BP14-099"], deck: ["BP14-098"], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP14-099").stats("opp:V5")).toEqual([5, 5]);
    expect(d({ me: { field: ["BP14-099"], evolveDeck: ["BP14-100"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP14-099").stats("opp:V5")).toEqual([5, 1]);
  });

  it("101 Fox of Fortune — Ward; Fanfare: a Fox into the EX area; engage it to draw when your leader gains defense", () => {
    const t = d({ me: { hand: ["BP14-101"], deck: ["V1"], playPoints: 3 } }).play("BP14-101").none();
    expect(t.ex()).toEqual([FOX]);
    t.play(`${FOX}@ex`).none().yes();
    expect([t.hand(), t.engaged("BP14-101")]).toEqual([["V1"], true]);
  });

  it("102 Pegasus Knight — Rush; once on your turn when your leader gains defense: a Holy Falcon; a Havencraft token follower onto your field: engage an enemy follower", () => {
    const t = d({ me: { field: ["BP14-102"], ex: [FOX, FOX], playPoints: 2 }, opp: { field: ["V5"] } });
    t.play(`${FOX}@ex`).none().flush();
    expect([t.field(), t.engaged("opp:V5"), t.leader()]).toEqual([["BP14-102", FOX, FALCON], true, 21]);
    t.play(`${FOX}@ex`).none().flush();
    expect(t.field()).toEqual(["BP14-102", FOX, FALCON, FOX]);
  });

  it("103 Al-mi'raj Defender — Ward; Fanfare: a card from the top 5 into the EX area, 4 less if a Beast follower (4 or less)", () => {
    const t = d({ me: { hand: ["BP14-103"], deck: ["V1", "BP14-102", "V3", "V5", "V2"], playPoints: 5 } }).play("BP14-103").none().pick("BP14-102").order();
    expect([t.ex(), t.canPlay("BP14-102@ex")]).toEqual([["BP14-102"], true]);
    const other = d({ me: { hand: ["BP14-103"], deck: ["V1", "BP14-102", "V3", "V5", "V2"], playPoints: 5 } }).play("BP14-103").none().pick("V1").order();
    expect(other.canPlay("V1@ex")).toBe(false);
  });

  it("104 White Eagle Baptism — Fanfare: 2 Holy Falcons; each Holy Falcon put onto your field +1/+1", () => {
    const t = d({ me: { hand: ["BP14-104"], playPoints: 6 } }).play("BP14-104").flush();
    expect([t.field(), t.ids(`${FALCON}@field`).map((id) => t.game.reader().info(id).attack)]).toEqual([["BP14-104", FALCON, FALCON], [3, 3]]);
  });

  it("T06 / T07 Fox of Invitation, Mercurial Might — Ward, Fanfare: leader +1; Quick: your leader takes 1 less damage this turn, draw", () => {
    expect(d({ me: { ex: [FOX], playPoints: 1 } }).play(`${FOX}@ex`).none().leader()).toBe(21);
    const t = d({ me: { ex: ["BP14-T07"], hand: ["BP14-086"], deck: ["V1"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP14-T07@ex").play("BP14-086");
    expect([t.leader(), t.hand()]).toEqual([18, ["V1"]]);
  });
});
