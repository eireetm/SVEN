import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP12 Abysscraft (069–085, T05). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); KILL a 1-cost spell;
// QUICK-SAC destroys one of your followers. BP01-108 Dire Bond (1 damage to your leader, draw) turns
// Sanguine on. BP07-069 Mono, Garnet Rebel; BP07-072 Aenea, Amethyst Rebel; BP12-083 Mechasaw
// Deathbringer is a 3-cost Machina / Departed follower. Tokens: BP07-T01 Assembly Droid, BP01-T15 Forest
// Bat, BP04-T01 Serpent (Demon), BP12-T05 Medusiana.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const DROID = "BP07-T01";
const BAT = "BP01-T15";
const SERPENT = "BP04-T01";
const MEDUSIANA = "BP12-T05";
const n = (count: number, id = "V1") => Array<string>(count).fill(id);

describe("BP12 Abysscraft", () => {
  it("069 / 070 Neun — summons a Droid or Bat and puts one into the EX area; evolved: 1-cost followers on the field and in the EX area +1 attack", () => {
    const t = d({ me: { hand: ["BP12-069"], playPoints: 3 } }).play("BP12-069").choose("droid").choose("bat");
    expect([t.field(), t.ex()]).toEqual([["BP12-069", DROID], [BAT]]);
    const evo = d({ me: { field: ["BP12-069", DROID, "V3"], ex: [BAT, "V1"], evolveDeck: ["BP12-070"], playPoints: 2 } }).evolve("BP12-069");
    expect([evo.stats(DROID), evo.stats("V3"), evo.stats(BAT)]).toEqual([[2, 1], [3, 4], [2, 1]]);
    // A card in the EX area keeps it when played (CR 10.6.2.1.3).
    expect(evo.play("V1@ex").stats("V1")).toEqual([3, 2]);
  });

  it("071 Gremory — Ward; Fanfare buries 2; from the cemetery (1) with 10 cards there and no Gremory on your field: summoned, banished when it leaves", () => {
    expect(d({ me: { hand: ["BP12-071"], deck: ["V1", "V3", "V5"], playPoints: 2 } }).play("BP12-071").none().cemetery()).toEqual(["V1", "V3"]);
    const t = d({ me: { cemetery: ["BP12-071", ...n(9)], hand: ["QUICK-SAC"], playPoints: 1 } }).activate("BP12-071").none();
    expect(t.field()).toEqual(["BP12-071"]);
    expect(t.play("QUICK-SAC").zone("me", "banished")).toEqual(["BP12-071"]);
    expect(d({ me: { cemetery: ["BP12-071", ...n(8)], playPoints: 1 } }).canActivate("BP12-071")).toBe(false);
    expect(d({ me: { cemetery: ["BP12-071", ...n(9)], field: ["BP12-071"], playPoints: 1 } }).canActivate("BP12-071@cemetery")).toBe(false);
  });

  it("072 / 073 Jackshovel Gravedigger — Bane; put onto the field by an ability it evolves; evolved: a Droid and bury 1", () => {
    const t = d({ me: { hand: ["BP12-075"], cemetery: ["BP12-072"], evolveDeck: ["BP12-073"], deck: ["V1"], playPoints: 5 } });
    t.play("BP12-075").pick("BP12-072").yes();
    expect([t.game.reader().info(t.id("BP12-072")).evolved, t.field(), t.cemetery()]).toEqual([true, ["BP12-072", DROID], ["BP12-075", "V1"]]);
    const played = d({ me: { hand: ["BP12-072"], evolveDeck: ["BP12-073"], playPoints: 2 } }).play("BP12-072");
    expect([played.game.reader().info(played.id("BP12-072")).evolved, played.keywords("BP12-072")]).toEqual([false, ["bane"]]);
  });

  it("074 Medusa — a Medusiana into the EX area; engage and bury a Demon token from the field or EX area: destroy an enemy follower", () => {
    expect(d({ me: { hand: ["BP12-074"], playPoints: 3 } }).play("BP12-074").ex()).toEqual([MEDUSIANA]);
    // Buried from the EX area, Medusiana's Last Words don't trigger (ruling).
    const t = d({ me: { field: ["BP12-074"], ex: [MEDUSIANA] }, opp: { field: ["V5", "V3"] } }).activate("BP12-074").pick("opp:V5");
    expect([t.field("opp"), t.ex(), t.engaged("BP12-074")]).toEqual([["V3"], [], true]);
    expect(d({ me: { field: ["BP12-074", SERPENT] }, opp: { field: ["V5"] } }).activate("BP12-074").field()).toEqual(["BP12-074"]);
    expect(d({ me: { field: ["BP12-074"] }, opp: { field: ["V5"] } }).canActivate("BP12-074")).toBe(false);
  });

  it("075 Friends Forever — up to 2 Machina followers costing 5 or less in total from the cemetery", () => {
    const t = d({ me: { hand: ["BP12-075"], cemetery: ["BP12-083", "BP12-072", "BP12-038"], playPoints: 5 } }).play("BP12-075").pick("BP12-083").pick("BP12-072");
    expect([t.field(), t.cemetery()]).toEqual([["BP12-083", "BP12-072"], ["BP12-038", "BP12-075"]]);
  });

  it("076 / 077 Liberté — evolved: with Sanguine, leader +2 and a draw", () => {
    const t = d({ me: { field: ["BP12-076"], hand: ["BP01-108"], evolveDeck: ["BP12-077"], deck: ["V1", "V3"], playPoints: 2 } }).play("BP01-108").evolve("BP12-076");
    expect([t.leader(), t.hand()]).toEqual([21, ["V1", "V3"]]);
    const plain = d({ me: { field: ["BP12-076"], evolveDeck: ["BP12-077"], deck: ["V1"], playPoints: 1 } }).evolve("BP12-076");
    expect([plain.leader(), plain.hand()]).toEqual([20, []]);
  });

  it("078 Hellfire Hound — banish 6 cards from the cemetery: 6 damage divided between any number of enemy followers", () => {
    const t = d({ me: { hand: ["BP12-078"], cemetery: n(6), playPoints: 4 }, opp: { field: ["V5", "V3"] } }).play("BP12-078").yes().pick("opp:V5", "opp:V3").choose("5");
    expect([t.field("opp"), t.stats("opp:V3"), t.cemetery(), t.zone("me", "banished").length]).toEqual([["V3"], [3, 3], [], 6]);
  });

  it("079 Garnet Waltz — 2 to the enemy leader and 1 to yours, or a Droid onto the field and one into the EX area (both onto the field with Mono)", () => {
    const dmg = d({ me: { hand: ["BP12-079"], playPoints: 1 } }).play("BP12-079").choose("damage");
    expect([dmg.leader("opp"), dmg.leader()]).toEqual([18, 19]);
    const droids = d({ me: { hand: ["BP12-079"], playPoints: 1 } }).play("BP12-079").choose("droids");
    expect([droids.field(), droids.ex()]).toEqual([[DROID], [DROID]]);
    const mono = d({ me: { hand: ["BP12-079"], field: ["BP07-069"], playPoints: 1 } }).play("BP12-079").choose("droids");
    expect([mono.field(), mono.ex()]).toEqual([["BP07-069", DROID, DROID], []]);
  });

  it("080 / 081 Bloodstained Berserker — Storm; +X/+X for each one in the cemetery; evolved: destroys an enemy follower", () => {
    const t = d({ me: { hand: ["BP12-080"], cemetery: ["BP12-080", "BP12-080"], playPoints: 6 } }).play("BP12-080");
    expect([t.stats("BP12-080"), t.keywords("BP12-080")]).toEqual([[7, 6], ["storm"]]);
    expect(d({ me: { field: ["BP12-080"], evolveDeck: ["BP12-081"], playPoints: 2 }, opp: { field: ["V5"] } }).evolve("BP12-080").field("opp")).toEqual([]);
  });

  it("082 Roly-Poly Mk I — Ward; with Aenea it takes 1 instead of more; from the cemetery (1) with Aenea: summoned with +1 attack, banished when it leaves", () => {
    const t = d({ turn: 6, me: { field: [{ card: "BP12-082", engaged: true }, "BP07-072"] }, opp: { field: ["V5"] } }).attack("opp:V5", "BP12-082");
    expect(t.stats("BP12-082")).toEqual([1, 2]);
    expect(d({ turn: 6, me: { field: [{ card: "BP12-082", engaged: true }] }, opp: { field: ["V5"] } }).attack("opp:V5", "BP12-082").field()).toEqual([]);
    const act = d({ me: { cemetery: ["BP12-082"], field: ["BP07-072"], hand: ["QUICK-SAC"], playPoints: 1 } }).activate("BP12-082").none();
    expect([act.field(), act.stats("BP12-082")]).toEqual([["BP07-072", "BP12-082"], [2, 3]]);
    expect(act.play("QUICK-SAC").pick("BP12-082").zone("me", "banished")).toEqual(["BP12-082"]);
    expect(d({ me: { cemetery: ["BP12-082"], playPoints: 1 } }).canActivate("BP12-082")).toBe(false);
  });

  it("083 Mechasaw Deathbringer — (1), bury it: bury the top 2; Last Words destroys an enemy follower", () => {
    const t = d({ me: { field: ["BP12-083"], deck: ["V1", "V3", "V5"], playPoints: 1 }, opp: { field: ["V5"] } }).activate("BP12-083");
    expect([t.cemetery(), t.field("opp")]).toEqual([["BP12-083", "V1", "V3"], []]);
  });

  it("084 Ghoul — bury another Departed follower: draw 2, discard 1", () => {
    const t = d({ me: { hand: ["BP12-084", "V5"], field: ["BP12-083"], deck: ["V1", "V3"], playPoints: 2 } }).play("BP12-084").yes().pick("V5");
    expect([t.field(), t.hand(), t.cemetery()]).toEqual([["BP12-084"], ["V1", "V3"], ["BP12-083", "V5"]]);
  });

  it("085 Viper Lash — Quick; 5 damage, a Serpent onto the field and one into the EX area", () => {
    const t = d({ me: { hand: ["BP12-085"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP12-085");
    expect([t.field("opp"), t.field(), t.ex()]).toEqual([[], [SERPENT], [SERPENT]]);
  });

  it("T05 Medusiana — Rush, Assail, Bane; Fanfare leader +1 per Demon follower; Last Words: each opponent buries a follower", () => {
    const t = d({ me: { ex: [MEDUSIANA], field: ["BP12-074"], playPoints: 3 } }).play(MEDUSIANA);
    expect([t.leader(), t.keywords(MEDUSIANA)]).toEqual([22, ["rush", "assail", "bane"]]);
    const lw = d({ me: { field: [MEDUSIANA], hand: ["QUICK-SAC"] }, opp: { field: ["V5", "V3"] } }).play("QUICK-SAC").pick("opp:V3");
    expect([lw.field("opp"), lw.cemetery("opp")]).toEqual([["V5"], ["V3"]]);
  });
});
