import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP07 Havencraft (086–102). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5; AMULET a 1-cost amulet;
// QUICK-SAC destroys a follower of yours (0). BP07-T02 Repair Mode is a Machina spell token;
// BP07-081 Bone Drone a 2-cost Machina follower.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const REPAIR = "BP07-T02";

describe("BP07 Havencraft", () => {
  it("086 / 087 Limonia — Evolve 7; banish a Repair Mode from the EX area: Evolve 1 less this turn, each time; evolved: destroy each enemy follower", () => {
    const t = d({ me: { field: ["BP07-086"], evolveDeck: ["BP07-087"], ex: [REPAIR, REPAIR, REPAIR, REPAIR, REPAIR], playPoints: 2 }, opp: { field: ["V5", "V1"] } });
    expect(t.canEvolve("BP07-086")).toBe(false);
    for (let i = 0; i < 4; i++) t.activate("BP07-086").pick(REPAIR);
    expect(t.canEvolve("BP07-086")).toBe(false); // 7 - 4 = 3
    t.activate("BP07-086");
    t.evolve("BP07-086");
    expect([t.field("opp"), t.pp()]).toEqual([[], 0]);
    expect(d({ me: { hand: ["BP07-086"] } }).play("BP07-086").ex()).toEqual([REPAIR]);
  });

  it("087 Limonia (Evolved) — once per turn, 0: summon a Machina follower costing 2 or less from the cemetery", () => {
    const t = d({ me: { field: [{ card: "BP07-086", evolvedInto: "BP07-087" }], cemetery: ["BP07-081", "BP07-080"], playPoints: 0 } });
    t.activate("BP07-086");
    expect([t.field(), t.canActivate("BP07-086")]).toEqual([["BP07-086", "BP07-081"], false]);
  });

  it("088 Lapis — Ward; end phase: a prayer counter on a card on your field and leader +2; leaving: draw per prayer counter", () => {
    const t = d({ me: { field: ["BP07-088", "V1"] }, opp: { deck: ["V1"] } }).end().pick("BP07-088").none();
    expect([t.counters("BP07-088", "prayer"), t.leader()]).toEqual([1, 22]);
    const leave = d({ me: { field: [{ card: "BP07-088", counters: { prayer: 2 } }], hand: ["QUICK-SAC"], deck: ["V1", "V2", "V3"] } }).play("QUICK-SAC");
    expect(leave.hand()).toEqual(["V1", "V2"]);
  });

  it("089 Father Refinement — Rush; 2 Repair Modes and recover 2 PP (EX full too); Strike: draw, 2 with 5 Repair Modes", () => {
    const t = d({ me: { hand: ["BP07-089"], ex: ["V1", "V1", "V1", "V1", "V1"], playPoints: 5 } }).play("BP07-089");
    expect([t.ex().length, t.pp(), t.keywords("BP07-089")]).toEqual([5, 2, ["rush"]]);
    const five = d({ me: { field: ["BP07-089"], ex: [REPAIR, REPAIR, REPAIR, REPAIR, REPAIR], deck: ["V1", "V2"] } }).attack("BP07-089", "opp:leader");
    expect(five.hand()).toEqual(["V1", "V2"]);
    const four = d({ me: { field: ["BP07-089"], ex: [REPAIR, REPAIR, REPAIR, REPAIR], deck: ["V1", "V2"] } }).attack("BP07-089", "opp:leader");
    expect(four.hand()).toEqual(["V1"]);
  });

  it("090 / 091 Marlone — each player puts a Repair Mode into their EX area; evolved: destroy an enemy follower costing up to your EX area's cards", () => {
    const t = d({ me: { hand: ["BP07-090"] } }).play("BP07-090");
    expect([t.ex(), t.ex("opp")]).toEqual([[REPAIR], [REPAIR]]);
    const evo = d({ me: { field: ["BP07-090"], evolveDeck: ["BP07-091"], ex: ["V1", "V1", "V1"], playPoints: 1 }, opp: { field: ["V3", "V5"] } });
    expect(evo.evolve("BP07-090").field("opp")).toEqual(["V5"]);
  });

  it("092 Augmentation Bestowal — banish 2 / 5 Repair Modes: summon a Machina follower costing 3 / 6 or less from the deck", () => {
    const t = d({ me: { hand: ["BP07-092"], ex: [REPAIR, REPAIR], deck: ["BP07-080", "BP07-081"] } }).play("BP07-092").choose("three").yes().pick("BP07-081");
    expect([t.field(), t.ex()]).toEqual([["BP07-081"], []]);
    // The option can be chosen without 5 Repair Modes; then nothing happens (CR 10.4.7.5).
    const none = d({ me: { hand: ["BP07-092"], ex: [REPAIR, REPAIR], deck: ["BP07-080"] } }).play("BP07-092").choose("six");
    expect([none.field(), none.ex()]).toEqual([[], [REPAIR, REPAIR]]);
  });

  it("093 Bunny-Eared Administrator — 3 damage if not from the hand; from the hand: pay 1 and discard it for leader +1, 3rd from the top of the deck", () => {
    expect(d({ me: { hand: ["BP07-093"] }, opp: { field: ["V5"] } }).play("BP07-093").stats("opp:V5")).toEqual([5, 5]);
    expect(d({ me: { ex: ["BP07-093"] }, opp: { field: ["V5"] } }).play("BP07-093").stats("opp:V5")).toEqual([5, 2]);
    const t = d({ me: { hand: ["BP07-093"], deck: ["V1", "V2", "V3"] } }).activate("BP07-093");
    expect([t.leader(), t.zone("me", "deck"), t.pp()]).toEqual([21, ["V1", "V2", "BP07-093", "V3"], 2]);
    expect(d({ me: { hand: ["BP07-093"], deck: ["V1"] } }).activate("BP07-093").zone("me", "deck")).toEqual(["V1", "BP07-093"]);
  });

  it("094 / 095 Robofalcon — Storm; Strike: a Repair Mode, then +1/+0 with 3 Repair Modes in the EX area; evolved: a Repair Mode", () => {
    const t = d({ me: { field: ["BP07-094"], ex: [REPAIR, REPAIR] } }).attack("BP07-094", "opp:leader");
    expect([t.ex(), t.leader("opp")]).toEqual([[REPAIR, REPAIR, REPAIR], 18]);
    const two = d({ me: { field: ["BP07-094"], ex: [REPAIR] } }).attack("BP07-094", "opp:leader");
    expect(two.leader("opp")).toBe(19);
    const evo = d({ me: { field: ["BP07-094"], evolveDeck: ["BP07-095"], playPoints: 1 } }).evolve("BP07-094");
    expect(evo.ex()).toEqual([REPAIR]);
  });

  it("096 Marcotte — Ward; draw, or with 5 cards in the EX area any card from the deck (not revealed)", () => {
    expect(d({ me: { hand: ["BP07-096"], deck: ["V1", "V5"] } }).play("BP07-096").none().hand()).toEqual(["V1"]);
    const t = d({ me: { hand: ["BP07-096"], ex: ["V1", "V1", "V1", "V1", "V1"], deck: ["V1", "V5"] } }).play("BP07-096").none().pick("V5");
    expect([t.hand(), t.events.some((e) => e.type === "cardsRevealed")]).toEqual([["V5"], false]);
  });

  it("097 Ironknuckle Nun — Ward; Fanfare and Last Words: a Repair Mode", () => {
    const t = d({ me: { hand: ["BP07-097", "QUICK-SAC"] } }).play("BP07-097").none();
    t.play("QUICK-SAC");
    expect(t.ex()).toEqual([REPAIR, REPAIR]);
  });

  it("098 / 099 Dark Bishop — evolved: summon a Fable follower or amulet costing 5 or less from the top 5", () => {
    const t = d({ me: { field: ["BP07-098"], evolveDeck: ["BP07-099"], deck: ["V1", "BP07-093", "BP07-012", "V5"], playPoints: 1 } }).evolve("BP07-098");
    t.pick("BP07-093").order();
    expect(t.field()).toEqual(["BP07-098", "BP07-093"]);
  });

  it("100 Meowskers — Storm; Strike: 1 damage to an enemy leader or follower", () => {
    const t = d({ me: { hand: ["BP07-100"] }, opp: { field: ["V1"] } }).play("BP07-100").attack("BP07-100", "opp:leader").pick("opp:V1");
    expect([t.stats("opp:V1"), t.leader("opp")]).toEqual([[2, 1], 19]);
  });

  it("101 Saintly Core — a Machina card from the top 2; engage and bury it with 2 Machina followers on your field: a Repair Mode", () => {
    expect(d({ me: { hand: ["BP07-101"], deck: ["BP07-081", "V1"] } }).play("BP07-101").pick("BP07-081").hand()).toEqual(["BP07-081"]);
    expect(d({ me: { field: ["BP07-101", "BP07-081"] } }).canActivate("BP07-101")).toBe(false);
    const act = d({ me: { field: ["BP07-101", "BP07-081", "BP07-081"] } }).activate("BP07-101");
    expect([act.ex(), act.cemetery()]).toEqual([[REPAIR], ["BP07-101"]]);
  });

  it("102 Meowskers Ambush! — a Havencraft follower from the top 3; pay 1, engage and bury it: may summon a Meowskers follower from the hand", () => {
    expect(d({ me: { hand: ["BP07-102"], deck: ["V1", "BP07-096", "V3"] } }).play("BP07-102").pick("BP07-096").order().hand()).toEqual(["BP07-096"]);
    const t = d({ me: { field: ["BP07-102"], hand: ["BP07-100", "V1"] } }).activate("BP07-102").pick("BP07-100");
    expect([t.field(), t.cemetery(), t.hand()]).toEqual([["BP07-100"], ["BP07-102"], ["V1"]]);
    // It can be activated without a Meowskers follower in the hand (ruling).
    expect(d({ me: { field: ["BP07-102"], hand: ["V1"] } }).canActivate("BP07-102")).toBe(true);
  });
});
