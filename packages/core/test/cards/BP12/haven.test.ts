import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP12 Havencraft (086–102). V1 is 1c 2/2, V5 5c 5/5 (Neutral); AMULET a 1-cost amulet; WARD 2c 1/3 with
// Ward; QUICK-SAC destroys one of your followers. BP07-086 Limonia, Flawed Saint (its Fanfare puts a
// Repair Mode into the EX area); BP02-089 Heavenly Aegis; BP07-100 / 102 Meowskers cards; BP12-083 a
// 3-cost Machina follower. Tokens: BP07-T01 Assembly Droid, BP07-T02 Repair Mode, BP01-T16 Holy Falcon,
// BP01-T17 Holy Tiger.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const DROID = "BP07-T01";
const REPAIR = "BP07-T02";
const FALCON = "BP01-T16";
const TIGER = "BP01-T17";
const evolved = (t: ReturnType<typeof d>, ref: string) => t.game.reader().info(t.id(ref)).evolved;

describe("BP12 Havencraft", () => {
  it("086 / 087 Rola — a Repair Mode into the EX area; put onto the field by an ability it evolves; evolved: damage per Machina follower, or Storm", () => {
    const played = d({ me: { hand: ["BP12-086"], evolveDeck: ["BP12-087"], playPoints: 2 } }).play("BP12-086");
    expect([played.ex(), evolved(played, "BP12-086")]).toEqual([[REPAIR], false]);
    // Summoned by Gullias's Fanfare: it evolves; 2 Machina followers deal 2 (rulings).
    const t = d({ me: { hand: ["BP12-089"], cemetery: ["BP12-086"], evolveDeck: ["BP12-087"], playPoints: 6 }, opp: { field: ["V5"] } });
    t.play("BP12-089").yes().choose("damage");
    expect([evolved(t, "BP12-086"), t.stats("opp:V5"), t.ex()]).toEqual([true, [5, 3], [REPAIR]]);
    // Without an enemy follower (1) can't be chosen: Storm.
    expect(d({ me: { field: ["BP12-086"], evolveDeck: ["BP12-087"], playPoints: 2 } }).evolve("BP12-086").keywords("BP12-086")).toEqual(["storm"]);
  });

  it("088 Charaton — bury an amulet: 4 damage and recover 4; once on each of your turns an amulet of yours leaving deals 1 to the enemy leader", () => {
    const t = d({ me: { hand: ["BP12-088"], field: ["AMULET"], playPoints: 5, maxPlayPoints: 9 }, opp: { field: ["V5"] } }).play("BP12-088").yes();
    expect([t.stats("opp:V5"), t.pp(), t.field(), t.leader("opp")]).toEqual([[5, 1], 4, ["BP12-088"], 19]);
    expect(d({ me: { hand: ["BP12-088"], field: ["AMULET"], playPoints: 5 } }).play("BP12-088").field()).toEqual(["AMULET", "BP12-088"]);
  });

  it("089 / 090 Gullias — summons a Machina follower that costs 2 or less from the cemetery; banish 2 Repair Modes: Storm; evolved: 5 damage or other Machina followers +1/+1", () => {
    const act = d({ me: { field: ["BP12-089"], ex: [REPAIR, REPAIR] } }).activate("BP12-089");
    expect([act.keywords("BP12-089"), act.ex()]).toEqual([["storm"], []]);
    expect(d({ me: { field: ["BP12-089"], ex: [REPAIR] } }).canActivate("BP12-089")).toBe(false);
    const buff = d({ me: { field: ["BP12-089", DROID], evolveDeck: ["BP12-090"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP12-089").choose("buff");
    expect([buff.stats(DROID), buff.stats("BP12-089")]).toEqual([[2, 2], [4, 5]]);
    const dmg = d({ me: { field: ["BP12-089"], evolveDeck: ["BP12-090"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP12-089").choose("damage");
    expect(dmg.field("opp")).toEqual([]);
  });

  it("091 Robowhip Reverend — a Repair Mode; put onto the field by an ability, Machina followers +1/+1", () => {
    const played = d({ me: { hand: ["BP12-091"], field: [DROID], playPoints: 2 } }).play("BP12-091");
    expect([played.ex(), played.stats(DROID)]).toEqual([[REPAIR], [1, 1]]);
    const t = d({ me: { hand: ["BP12-089"], cemetery: ["BP12-091"], field: [DROID], playPoints: 6 } }).play("BP12-089");
    expect([t.stats("BP12-089"), t.stats(DROID), t.stats("BP12-091")]).toEqual([[4, 5], [2, 2], [3, 3]]);
  });

  it("092 Major Prayers — leader +2 and draw 2, or up to 2 different Meowskers cards onto the field", () => {
    const draw = d({ me: { hand: ["BP12-092"], deck: ["V1", "V5"], playPoints: 3 } }).play("BP12-092").choose("draw");
    expect([draw.leader(), draw.hand()]).toEqual([22, ["V1", "V5"]]);
    const t = d({ me: { hand: ["BP12-092"], deck: ["BP07-100", "V1", "BP07-102"], playPoints: 3 } }).play("BP12-092").choose("meowskers").pick("BP07-100").pick("BP07-102");
    expect(t.field()).toEqual(["BP07-100", "BP07-102"]);
  });

  it("093 / 094 Holylight Convert — Ward; end phase +1 attack per Ward follower; evolved: summons a Ward follower that costs 3 or less", () => {
    expect(d({ me: { field: ["BP12-093", "WARD"] }, opp: { deck: ["V1"] } }).end().stats("BP12-093")).toEqual([3, 4]);
    const evo = d({ me: { field: ["BP12-093"], evolveDeck: ["BP12-094"], deck: ["V1", "WARD"], playPoints: 1 } }).evolve("BP12-093").pick("WARD").none();
    expect(evo.field()).toEqual(["BP12-093", "WARD"]);
  });

  it("095 Smilecure Priest — not from the EX area; Fanfare leader +2; from the EX area (1), banish it: leader +1 and draw; Last Words into the EX area", () => {
    expect(d({ me: { hand: ["BP12-095"], playPoints: 3 } }).play("BP12-095").none().leader()).toBe(22);
    expect(d({ me: { ex: ["BP12-095"], playPoints: 3 } }).canPlay("BP12-095@ex")).toBe(false);
    const act = d({ me: { ex: ["BP12-095"], deck: ["V1"], playPoints: 1 } }).activate("BP12-095");
    expect([act.leader(), act.hand(), act.zone("me", "banished")]).toEqual([21, ["V1"], ["BP12-095"]]);
    expect(d({ me: { field: ["BP12-095"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").ex()).toEqual(["BP12-095"]);
  });

  it("096 Salvation Ex Limonia — a Machina follower that costs 3 or less from the cemetery, a Repair Mode for Limonia; 2 less by discarding a Heavenly Aegis", () => {
    const t = d({ me: { hand: ["BP12-096"], cemetery: ["BP07-086"], playPoints: 2 } }).play("BP12-096");
    expect([t.field(), t.ex()]).toEqual([["BP07-086"], [REPAIR, REPAIR]]);
    // A full field keeps Limonia in the cemetery, the Repair Mode still comes (ruling).
    const full = d({ me: { hand: ["BP12-096"], field: ["V1", "V1", "V1", "V1", "V1"], cemetery: ["BP07-086"], playPoints: 2 } }).play("BP12-096");
    expect([full.ex(), full.cemetery()]).toEqual([[REPAIR], ["BP07-086", "BP12-096"]]);
    const aegis = d({ me: { hand: ["BP12-096", "BP02-089"], cemetery: ["BP12-083"], playPoints: 0 } }).play("BP12-096");
    expect([aegis.field(), aegis.cemetery()]).toEqual([["BP12-083"], ["BP02-089", "BP12-096"]]);
  });

  it("097 / 098 Sol Sister — Ward; evolved: damage equal to your amulets plus 1", () => {
    const t = d({ me: { field: ["BP12-097", "AMULET", "AMULET"], evolveDeck: ["BP12-098"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP12-097");
    expect([t.stats("opp:V5"), t.keywords("BP12-097")]).toEqual([[5, 2], ["ward"]]);
  });

  it("099 Robowing Precant — a Repair Mode, a draw with 3 in the EX area; playing a Repair Mode gives a follower Bane", () => {
    const t = d({ me: { hand: ["BP12-099"], ex: [REPAIR, REPAIR], deck: ["V1"], playPoints: 2 } }).play("BP12-099");
    expect([t.hand(), t.ex()]).toEqual([["V1"], [REPAIR, REPAIR, REPAIR]]);
    const bane = d({ me: { field: ["BP12-099", "V1"], ex: [REPAIR], playPoints: 1 } }).play(REPAIR).pick("V1");
    expect([bane.keywords("V1"), bane.leader()]).toEqual([["bane"], 21]);
  });

  it("100 Fortune Fowl — Rush; Last Words (1): a Holy Falcon", () => {
    expect(d({ me: { field: ["BP12-100"], hand: ["QUICK-SAC"], playPoints: 1 } }).play("QUICK-SAC").yes().field()).toEqual([FALCON]);
    expect(d({ me: { field: ["BP12-100"], hand: ["QUICK-SAC"], playPoints: 1 } }).play("QUICK-SAC").no().field()).toEqual([]);
  });

  it("101 Pilgrims' Path — (4), bury it: leader +2 and draw 2; Last Words a Holy Falcon", () => {
    const t = d({ me: { field: ["BP12-101"], deck: ["V1", "V5"], playPoints: 4 } }).activate("BP12-101");
    expect([t.leader(), t.hand(), t.field()]).toEqual([22, ["V1", "V5"], [FALCON]]);
  });

  it("102 Fiery Paean — a Holy Tiger into the EX area; engage: a Holy Tiger gets Storm", () => {
    expect(d({ me: { hand: ["BP12-102"], playPoints: 2 } }).play("BP12-102").ex()).toEqual([TIGER]);
    expect(d({ me: { field: ["BP12-102", TIGER] } }).activate("BP12-102").keywords(TIGER)).toEqual(["rush", "storm"]);
  });
});
