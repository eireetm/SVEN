import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// CP02 Havencraft (086–102), THE IDOLM@STER CINDERELLA GIRLS. V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral).
// CP02-T01 is a Magical Item (Lesson banishes them from the EX area). AMULET is a 1-cost amulet. iM@S CG followers without
// abilities besides Evolve: CP02-014 (Cute, 2c), CP02-026 (Cool, 2c; a Fanfare that does nothing alone), CP02-047 (Passion, 1c).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id: string) => Array<string>(count).fill(id);
const ITEM = "CP02-T01";

describe("CP02 Havencraft", () => {
  it("086 Kaede Takagaki — Ward; Fanfare: banish; end phase with 5 defense or less: +5 and draw; act (1), Lesson (1): Aura", () => {
    expect(d({ me: { hand: ["CP02-086"], playPoints: 5 }, opp: { field: ["V5"] } }).play("CP02-086").none().zone("opp", "banished")).toEqual(["V5"]);
    const low = d({ me: { field: ["CP02-086"], leaderDefense: 5, deck: ["V1"] }, opp: { deck: ["V1"] } }).end();
    expect([low.leader(), low.hand()]).toEqual([10, ["V1"]]);
    const high = d({ me: { field: ["CP02-086"], leaderDefense: 6, deck: ["V1"] }, opp: { deck: ["V1"] } }).end();
    expect([high.leader(), high.hand()]).toEqual([6, []]);
    expect(d({ me: { field: ["CP02-086"], ex: [ITEM], playPoints: 1 } }).activate("CP02-086").keywords("CP02-086")).toEqual(["ward", "aura"]);
  });

  it("087 / 088 Shin Sato — Fanfare: draw; evolve (6); evolved: a follower costing 8 or less from your cemetery", () => {
    expect(d({ me: { hand: ["CP02-087"], deck: ["V1"], playPoints: 3 } }).play("CP02-087").hand()).toEqual(["V1"]);
    expect(d({ me: { field: ["CP02-087"], evolveDeck: ["CP02-088"], playPoints: 5 } }).canEvolve("CP02-087")).toBe(false);
    const e = d({ me: { field: ["CP02-087"], evolveDeck: ["CP02-088"], cemetery: ["V5", "CP02-031"], playPoints: 6 } }).evolve("CP02-087");
    expect([e.field(), e.cemetery()]).toEqual([["CP02-087", "V5"], ["CP02-031"]]);
  });

  it("089 / 090 Nana Abe — Fanfare: an amulet from the top 5; evolved: may summon an amulet costing 3 or less from your hand", () => {
    expect(d({ me: { hand: ["CP02-089"], deck: ["V1", "AMULET", "V3"], playPoints: 3 } }).play("CP02-089").pick("AMULET").order().hand()).toEqual(["AMULET"]);
    const e = d({ me: { field: ["CP02-089"], evolveDeck: ["CP02-090"], hand: ["AMULET", "CP02-092"], playPoints: 1 } }).evolve("CP02-089").pick("AMULET");
    expect([e.field(), e.hand()]).toEqual([["CP02-089", "AMULET"], ["CP02-092"]]);
  });

  it("091 Akane Hino — Rush, Assail; Strike: 2 to the enemy leader; act (2), Lesson (1): Storm", () => {
    const t = d({ me: { field: ["CP02-091"], ex: [ITEM], playPoints: 2 } }).activate("CP02-091").attack("CP02-091", "opp:leader");
    expect([t.keywords("CP02-091"), t.leader("opp")]).toEqual([["rush", "assail", "storm"], 13]);
  });

  it("092 Classroom Lily — Fanfare: leader +2, draw; Quick act (2), engage and bury: an iM@S CG follower from your cemetery", () => {
    const t = d({ me: { hand: ["CP02-092"], deck: ["V1"], playPoints: 3 } }).play("CP02-092");
    expect([t.leader(), t.hand()]).toEqual([22, ["V1"]]);
    const a = d({ me: { field: ["CP02-092"], cemetery: ["CP02-014", "V1"], playPoints: 2 } }).activate("CP02-092");
    expect([a.hand(), a.field(), a.cemetery().sort()]).toEqual([["CP02-014"], [], ["CP02-092", "V1"]]);
  });

  it("093 Risa Matoba — Fanfare: may summon an iM@S CG follower costing 2 or less from the top 3", () => {
    const t = d({ me: { hand: ["CP02-093"], deck: ["V1", "CP02-014", "CP02-003"], playPoints: 3 } }).play("CP02-093").pick("CP02-014").order();
    expect([t.field(), t.zone("me", "deck").sort()]).toEqual([["CP02-093", "CP02-014"], ["CP02-003", "V1"]]);
  });

  it("094 / 095 Haru Yuuki — Fanfare with a Risa Matoba: +1/+1 and Storm; evolved: leader +2", () => {
    const t = d({ me: { hand: ["CP02-094"], field: ["CP02-093"], playPoints: 2 } }).play("CP02-094");
    expect([t.stats("CP02-094"), t.keywords("CP02-094")]).toEqual([[3, 3], ["storm"]]);
    expect(d({ me: { hand: ["CP02-094"], playPoints: 2 } }).play("CP02-094").stats("CP02-094")).toEqual([2, 2]);
    expect(d({ me: { field: ["CP02-094"], evolveDeck: ["CP02-095"], playPoints: 1 } }).evolve("CP02-094").leader()).toBe(22);
  });

  it("096 Psychic☆Maiden — Fanfare: banish an enemy follower with 4 defense or less; act (5), engage and bury: banish", () => {
    expect(d({ me: { hand: ["CP02-096"], playPoints: 3 }, opp: { field: ["V3", "V5"] } }).play("CP02-096").field("opp")).toEqual(["V5"]);
    const a = d({ me: { field: ["CP02-096"], playPoints: 5 }, opp: { field: ["V5"] } }).activate("CP02-096");
    expect([a.zone("opp", "banished"), a.field()]).toEqual([["V5"], []]);
  });

  it("097 Natalia — Storm; Fanfare: damage equal to your other Passion followers", () => {
    const t = d({ me: { hand: ["CP02-097"], field: ["CP02-047", "CP02-004"], playPoints: 2 }, opp: { field: ["V5"] } }).play("CP02-097");
    expect([t.stats("opp:V5"), t.keywords("CP02-097")]).toEqual([[5, 3], ["storm"]]);
  });

  it("098 Shizuku Oikawa — Fanfare: leader +2, +4 with 5 Passion cards in your cemetery", () => {
    const heal = (passion: number) => d({ me: { hand: ["CP02-098"], cemetery: n(passion, "CP02-047"), playPoints: 3 } }).play("CP02-098").leader();
    expect([heal(5), heal(4)]).toEqual([24, 22]);
  });

  it("099 / 100 Layla — evolved: a Cool follower and a Passion follower from the deck", () => {
    const e = d({ me: { field: ["CP02-099"], evolveDeck: ["CP02-100"], deck: ["CP02-014", "CP02-026", "CP02-047", "V1"], playPoints: 1 } });
    e.evolve("CP02-099").pick("CP02-026").pick("CP02-047");
    expect(e.hand().sort()).toEqual(["CP02-026", "CP02-047"]);
  });

  it("101 Sanae Katagiri — Rush, Ward; more than 3 damage becomes 3", () => {
    const t = d({ me: { hand: ["CP02-062"], field: ["CP02-101"], playPoints: 3 } }).play("CP02-062");
    expect([t.stats("CP02-101"), t.keywords("CP02-101")]).toEqual([[7, 4], ["rush", "ward"]]);
  });

  it("102 Winter Night Prayer — Quick; banish, and leader +3 with a Cute follower on your field", () => {
    const t = d({ me: { hand: ["CP02-102"], field: ["CP02-014"], playPoints: 4 }, opp: { field: ["V5"] } }).play("CP02-102");
    expect([t.zone("opp", "banished"), t.leader()]).toEqual([["V5"], 23]);
    expect(d({ me: { hand: ["CP02-102"], field: ["V1"], playPoints: 4 }, opp: { field: ["V5"] } }).play("CP02-102").leader()).toBe(20);
  });
});
