import { describe, expect, it } from "vitest";
import { drive, type DriveSpec, type Driver } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// ECP02 Havencraft (060–071), THE IDOLM@STER CINDERELLA GIRLS. V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). CP02-T01 is a Magical Item
// (Lesson banishes them from the EX area). iM@S CG followers with only Evolve: CP02-014 Kana Imai / CP02-060 Yuka Nakano (Cute, 2c /
// 1c), CP02-042 Hina Araki / CP02-039 Kanade Hayami (Cool, 2c / 3c), CP02-047 Rika Jougasaki (Passion, 1c). CP02-103 New
// Generations has all three types. CP02-028 Sparkling☆Days is a 1-cost Cool spell.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const ITEM = "CP02-T01";
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };

describe("ECP02 Havencraft", () => {
  it("060 / 061 Nana Abe — Fanfare, Lesson (1): -1/-1; evolved: discard an iM@S CG card: leader +2, draw", () => {
    expect(d({ me: { hand: ["ECP02-060"], ex: [ITEM], playPoints: 2 }, opp: { field: ["V5"] } }).play("ECP02-060").yes().stats("opp:V5")).toEqual([4, 4]);
    const e = d({ me: { field: ["ECP02-060"], evolveDeck: ["ECP02-061"], hand: ["CP02-014"], deck: ["V1"], playPoints: 1 } }).evolve("ECP02-060").yes();
    expect([e.leader(), e.hand()]).toEqual([22, ["V1"]]);
  });

  it("061 Nana Abe (Evolved) — On Super-Evolve: an enemy follower becomes an amulet with main-phase damage to its leader and act (1), discard 2: bury", () => {
    const s = d({ me: { field: ["ECP02-060"], evolveDeck: ["ECP02-061"], playPoints: 1, ...SUPER }, opp: { field: ["V5"], deck: ["V1", "V1"] } });
    s.evolve("ECP02-060", { sep: true }).flush();
    expect(s.game.reader().info(s.id("opp:V5")).type).toBe("amulet");
    expect(s.attackTargets("ECP02-060")).toEqual(["opp:leader"]);
    s.end();
    expect(s.leader("opp")).toBe(18);
  });

  it("062 Kaede Takagaki — Ward; Fanfare with 10 iM@S CG cards in the cemetery: destroy; act, Lesson (1), engage, discard a card: destroy", () => {
    expect(d({ me: { hand: ["ECP02-062"], cemetery: Array<string>(10).fill("CP02-042"), playPoints: 3 }, opp: { field: ["V5"] } }).play("ECP02-062").none().field("opp")).toEqual([]);
    expect(d({ me: { hand: ["ECP02-062"], playPoints: 3 }, opp: { field: ["V5"] } }).play("ECP02-062").none().field("opp")).toEqual(["V5"]);
    const a = d({ me: { field: ["ECP02-062"], ex: [ITEM], hand: ["V1"] }, opp: { field: ["V5"] } }).activate("ECP02-062");
    expect([a.field("opp"), a.hand(), a.engaged("ECP02-062")]).toEqual([[], [], true]);
  });

  it("063 Eve Santaclaus — Fanfare: arrange the top 2; act, Lesson (2), once per turn: may take the top card if iM@S CG", () => {
    expect(d({ me: { hand: ["ECP02-063"], deck: ["V1", "V3", "V5"], playPoints: 1 } }).play("ECP02-063").pick("V3").zone("me", "deck")).toEqual(["V3", "V5", "V1"]);
    const a = d({ me: { field: ["ECP02-063"], ex: [ITEM, ITEM], deck: ["CP02-042"] } }).activate("ECP02-063").pick("CP02-042");
    expect([a.hand(), a.canActivate("ECP02-063")]).toEqual([["CP02-042"], false]);
  });

  it("064 Miyu Mifune — Fanfare and act (1), Lesson (1), engage: a 1-cost iM@S CG follower from the deck onto the field", () => {
    expect(d({ me: { hand: ["ECP02-064"], deck: ["V1", "CP02-047"], playPoints: 3 } }).play("ECP02-064").pick("CP02-047").field()).toEqual(["ECP02-064", "CP02-047"]);
    expect(d({ me: { field: ["ECP02-064"], ex: [ITEM], deck: ["CP02-060"], playPoints: 1 } }).activate("ECP02-064").pick("CP02-060").field()).toEqual(["ECP02-064", "CP02-060"]);
  });

  it("065 / 066 Kako Takafuji — you may reroll each die you roll once (twice with two); evolved: roll a die", () => {
    const e = d({ me: { field: ["ECP02-065"], evolveDeck: ["ECP02-066"], deck: ["V1", "V3"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("ECP02-065");
    const first = e.game.decision;
    expect(first?.type === "choose" && first.reason).toBe("dieReroll");
    e.choose("reroll");
    // One Kako: no second reroll; only the final result is the die's (ruling).
    expect([e.game.decision?.type, e.game.reader().diceRolledThisTurn(0).length]).toEqual(["mainPhase", 1]);
    const two = d({ me: { field: ["ECP02-065", "ECP02-065"], evolveDeck: ["ECP02-066"], deck: ["V1", "V3"], playPoints: 1 } }).evolve("ECP02-065").choose("reroll");
    expect(two.game.decision?.type === "choose" && two.game.decision.reason).toBe("dieReroll");
    two.choose("keep");
    expect(two.game.reader().diceRolledThisTurn(0).length).toBe(1);
  });

  it("066 Kako Takafuji (Evolved) — On Evolve: roll a die; 1: draw 2; 2: 3 damage to the enemy leader, leader +3; 3: the opponent buries its follower with the highest attack", () => {
    // The die comes from the game's seeded random source (CR 5.20): find a seed that gives the wanted result, kept.
    const roll = (t: Driver) => t.events.flatMap((e) => (e.type === "dieRolled" ? [e.result] : []));
    const rolled = (n: number) => {
      for (let i = 0; i < 300; i++) {
        const t = d({
          seed: `k${i}`,
          me: { field: ["ECP02-065"], evolveDeck: ["ECP02-066"], deck: ["V1", "V3"], playPoints: 1 },
          opp: { field: ["V5", "V3"] },
        });
        t.evolve("ECP02-065").choose("keep");
        if (roll(t)[0] === n) return t;
      }
      throw new Error("no seed gives this roll");
    };
    expect(rolled(1).hand()).toEqual(["V1", "V3"]);
    const two = rolled(2);
    expect([two.leader("opp"), two.leader()]).toEqual([17, 23]);
    const three = rolled(3);
    expect([three.field("opp"), three.cemetery("opp")]).toEqual([["V3"], ["V5"]]);
  });

  it("067 / 068 Kotoka Saionji — Fanfare, Lesson (2): banish; evolved: banish", () => {
    expect(d({ me: { hand: ["ECP02-067"], ex: [ITEM, ITEM], playPoints: 5 }, opp: { field: ["V5"] } }).play("ECP02-067").yes().zone("opp", "banished")).toEqual(["V5"]);
    expect(d({ me: { field: ["ECP02-067"], evolveDeck: ["ECP02-068"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("ECP02-067").zone("opp", "banished")).toEqual(["V5"]);
  });

  it("069 Haru Yuuki — Rush and Assail with 3 Cool followers or a Risa Matoba; Fanfare with a Risa Matoba: a Magical Item", () => {
    expect(d({ me: { field: ["ECP02-069", "CP02-042", "CP02-039"] } }).keywords("ECP02-069")).toEqual(["rush", "assail"]);
    expect(d({ me: { field: ["ECP02-069", "CP02-093"] } }).keywords("ECP02-069")).toEqual(["rush", "assail"]);
    expect(d({ me: { field: ["ECP02-069", "CP02-042"] } }).keywords("ECP02-069")).toEqual([]);
    expect(d({ me: { hand: ["ECP02-069"], field: ["CP02-093"], playPoints: 1 } }).play("ECP02-069").ex()).toEqual([ITEM]);
  });

  it("070 Natalia — Rush; Assail and Bane with 5 Passion cards in the cemetery; Fanfare, discard a Passion card: draw", () => {
    expect(d({ me: { field: ["ECP02-070"], cemetery: Array<string>(5).fill("CP02-047") } }).keywords("ECP02-070")).toEqual(["rush", "assail", "bane"]);
    expect(d({ me: { hand: ["ECP02-070", "CP02-047"], deck: ["V1"], playPoints: 2 } }).play("ECP02-070").yes().hand()).toEqual(["V1"]);
  });

  it("071 A Sweet Romantic Summer — Fanfare with an iM@S CG follower: 4 damage and leader +2; act (1), engage, bury with 10 Passion cards: a Shin Sato", () => {
    const t = d({ me: { hand: ["ECP02-071"], field: ["CP02-014"], playPoints: 3 }, opp: { field: ["V5"] } }).play("ECP02-071");
    expect([t.stats("opp:V5"), t.leader()]).toEqual([[5, 1], 22]);
    expect(d({ me: { hand: ["ECP02-071"], playPoints: 3 }, opp: { field: ["V5"] } }).play("ECP02-071").leader()).toBe(20);
    const a = d({ me: { field: ["ECP02-071"], deck: ["V1", "CP02-087"], cemetery: Array<string>(10).fill("CP02-047"), playPoints: 1 } }).activate("ECP02-071").pick("CP02-087");
    expect([a.field(), a.hand()]).toEqual([["CP02-087"], ["V1"]]);
  });
});
