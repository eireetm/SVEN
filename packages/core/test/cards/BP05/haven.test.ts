import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP05 Havencraft (086–102). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5; AMULET is a plain 1-cost amulet;
// BOTH-20 deals 20 damage to each leader (0); QUICK-SAC destroys a follower of yours (0).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);

describe("BP05 Havencraft", () => {
  it("086 / 087 Marwynn — evolve for 4 or by skipping your next turn; evolved: Ward, Aura, max PP +1, leader +3, draw", () => {
    const t = d({ me: { field: ["BP05-086"], evolveDeck: ["BP05-087"], deck: ["V1"], playPoints: 4 } }).evolve("BP05-086");
    expect([t.pp(), t.game.state.players[0].maxPlayPoints, t.leader(), t.hand(), t.keywords("BP05-086")]).toEqual([
      0,
      5,
      23,
      ["V1"],
      ["ward", "aura"],
    ]);
    expect(t.game.state.players[0].skipNextTurn).toBe(false);
    const skip = d({ me: { field: ["BP05-086"], evolveDeck: ["BP05-087"], deck: ["V1"], playPoints: 0 } }).evolve("BP05-086");
    expect([skip.pp(), skip.game.state.players[0].skipNextTurn]).toEqual([0, true]);
  });

  it("088 Deus Ex Machina — end phase: discard your hand and draw 4, or recover 4", () => {
    const t = d({ me: { field: ["BP05-088"], hand: ["V1"], deck: ["V2", "V2", "V2", "V2"] }, opp: { deck: ["V1"] } });
    t.end().choose("draw");
    expect([t.hand(), t.cemetery()]).toEqual([["V2", "V2", "V2", "V2"], ["V1"]]);
    const pp = d({ me: { field: ["BP05-088"], hand: ["V3"] }, opp: { deck: ["V1"] } }).play("V3").end().choose("recover");
    expect(pp.pp()).toBe(3);
  });

  it("089 / 090 Apostle of Repose — recover 1 at each opponent's main phase; evolved banishes a reserved enemy follower", () => {
    const t = d({ me: { field: ["BP05-089"], hand: ["V3"] }, opp: { deck: ["V1"] } }).play("V3").end();
    expect(t.pp()).toBe(1);
    const evo = d({
      me: { field: ["BP05-089"], evolveDeck: ["BP05-090"], playPoints: 2 },
      opp: { field: ["V5", { card: "V3", engaged: true }] },
    }).evolve("BP05-089");
    expect([evo.field("opp"), evo.zone("opp", "banished")]).toEqual([["V3"], ["V5"]]);
  });

  it("091 Hakrabi — Ward; discard an amulet to put a 1-cost amulet from the deck onto the field", () => {
    const t = d({ me: { hand: ["BP05-091", "AMULET"], deck: ["V1", "BP05-101"] } }).play("BP05-091").none().yes().pick("BP05-101");
    expect([t.field(), t.cemetery()]).toEqual([["BP05-091", "BP05-101"], ["AMULET"]]);
  });

  it("092 Ancient Protector — you can't lose; at 0 defense it goes to the cemetery and your leader goes to 1", () => {
    const t = d({ me: { field: ["BP05-092"], hand: ["BOTH-20"] }, opp: { leaderDefense: 30 } }).play("BOTH-20");
    expect([t.game.state.result, t.leader(), t.cemetery()]).toEqual([null, 1, ["BOTH-20", "BP05-092"]]);
  });

  it("093 Disciple of Repose — 1 damage to an enemy follower at each opponent's main phase", () => {
    expect(d({ me: { field: ["BP05-093"] }, opp: { field: ["V5"], deck: ["V1"] } }).end().stats("opp:V5")).toEqual([5, 4]);
  });

  it("094 / 095 Unidentified Subject — +1/+1 per card drawn outside your start phase; evolved draws 2", () => {
    expect(d({ me: { field: ["BP05-094"], hand: ["FAN-DRAW"], deck: ["V1"] } }).play("FAN-DRAW").stats("BP05-094")).toEqual([4, 8]);
    const evo = d({ me: { field: ["BP05-094"], evolveDeck: ["BP05-095"], deck: ["V1", "V1"], playPoints: 2 } }).evolve("BP05-094").flush();
    expect(evo.stats("BP05-094")).toEqual([5, 9]);
    const start = d({ me: { field: ["BP05-094"], deck: ["V1"] }, opp: { deck: ["V1"] } }).end().end();
    expect([start.stats("BP05-094"), start.hand()]).toEqual([[3, 7], ["V1"]]);
  });

  it("096 Silver Cog Spinner — recover 2 at 5+ cards in hand, draw at 5 or less (both at exactly 5)", () => {
    const five = d({ me: { hand: ["BP05-096", "V1", "V1", "V1", "V1", "V1"], deck: ["V2"], playPoints: 4 } }).play("BP05-096");
    expect([five.pp(), five.hand().length]).toEqual([2, 6]);
    const four = d({ me: { hand: ["BP05-096", "V1", "V1", "V1", "V1"], deck: ["V2"], playPoints: 4 } }).play("BP05-096");
    expect([four.pp(), four.hand().length]).toEqual([0, 5]);
    const six = d({ me: { hand: ["BP05-096", "V1", "V1", "V1", "V1", "V1", "V1"], deck: ["V2"], playPoints: 4 } }).play("BP05-096");
    expect([six.pp(), six.hand().length]).toEqual([2, 6]);
  });

  it("097 Servant of Repose — leader +1 at each opponent's main phase", () => {
    expect(d({ me: { field: ["BP05-097"] }, opp: { deck: ["V1"] } }).end().leader()).toBe(21);
  });

  it("098 / 099 Demon's Epitaph — evolve by discarding a card; evolved: Bane, Last Words 2 to the enemy leader", () => {
    expect(d({ me: { field: ["BP05-098"], evolveDeck: ["BP05-099"] } }).canEvolve("BP05-098")).toBe(false);
    const t = d({ me: { field: ["BP05-098"], evolveDeck: ["BP05-099"], hand: ["V1"], playPoints: 0 } }).evolve("BP05-098");
    expect([t.cemetery(), t.keywords("BP05-098")]).toEqual([["V1"], ["bane"]]);
    const lw = d({ me: { field: [{ card: "BP05-098", evolvedInto: "BP05-099" }], hand: ["QUICK-SAC"] } }).play("QUICK-SAC");
    expect(lw.leader("opp")).toBe(18);
  });

  it("100 The Saviors — search Marwynn, or banish an enemy follower with 2 defense or less", () => {
    const t = d({ me: { hand: ["BP05-100"], deck: ["V1", "BP05-086"] }, opp: { field: ["V1", "V3"] } }).play("BP05-100");
    t.choose("search").pick("BP05-086");
    expect(t.hand()).toEqual(["BP05-086"]);
    const ban = d({ me: { hand: ["BP05-100"] }, opp: { field: ["V1", "V3"] } }).play("BP05-100").choose("banish");
    expect([ban.field("opp"), ban.zone("opp", "banished")]).toEqual([["V3"], ["V1"]]);
  });

  it("101 Realm of Repose — Quick: engage and bury it; this turn your leader takes at most 4 per instance", () => {
    const t = d({ me: { field: ["BP05-101"], hand: ["BOTH-20"] }, opp: { leaderDefense: 30 } }).activate("BP05-101").play("BOTH-20");
    expect([t.leader(), t.leader("opp")]).toEqual([16, 10]);
  });

  it("102 / T05 Ancient Amplifier — summon a Mystic Artifact (Ward, draws); pay 1, engage and bury it: a token +2/+1", () => {
    const t = d({ me: { hand: ["BP05-102"], deck: ["V1"], playPoints: 4 } }).play("BP05-102").none();
    expect([t.field(), t.hand(), t.keywords("BP05-T05")]).toEqual([["BP05-102", "BP05-T05"], ["V1"], ["ward"]]);
    t.activate("BP05-102");
    expect([t.stats("BP05-T05"), t.cemetery(), t.pp()]).toEqual([[4, 4], ["BP05-102"], 0]);
  });
});
