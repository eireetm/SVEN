import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP09 Neutral (103–117) and tokens (T01, T02). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5; KILL is a spell;
// AMULET an amulet. BP01-159 Bellringer Angel is an Angel follower, BP03-119 Harbinger of the Night a
// Fallen Angel follower, BP01-068 Crafty Warlock a 2-cost Runecraft follower (Last Words: a Magic
// Sediment).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const FIVE_SPELLS = ["KILL", "KILL", "KILL", "KILL", "KILL"];
const FIVE_AMULETS = ["AMULET", "AMULET", "AMULET", "AMULET", "AMULET"];
const ANGELS = ["BP01-159", "BP01-159", "BP01-159", "BP01-159", "BP01-159"];

describe("BP09 Neutral", () => {
  it("103 / 104 Marduk — buries the top 2; evolved: 5 spells in the cemetery: leader +5 and a draw; 5 amulets: 5 to each enemy follower and a draw", () => {
    const t = d({ me: { hand: ["BP09-103"], deck: ["V1", "V3", "V5"], playPoints: 6 } }).play("BP09-103");
    expect(t.cemetery()).toEqual(["V1", "V3"]);
    const both = d({ me: { field: ["BP09-103"], evolveDeck: ["BP09-104"], cemetery: [...FIVE_SPELLS, ...FIVE_AMULETS], deck: ["V1", "V3"] }, opp: { field: ["V5"] } });
    both.evolve("BP09-103").flush();
    expect([both.leader(), both.field("opp"), both.hand()]).toEqual([25, [], ["V1", "V3"]]);
    const spells = d({ me: { field: ["BP09-103"], evolveDeck: ["BP09-104"], cemetery: FIVE_SPELLS, deck: ["V1", "V3"] }, opp: { field: ["V5"] } }).evolve("BP09-103");
    expect([spells.leader(), spells.field("opp"), spells.hand()]).toEqual([25, ["V5"], ["V1"]]);
  });

  it("105 Moon and Sun — summons an Amaterasu or Tsukuyomi from the deck; from the cemetery, pay 4 and banish it: both from the cemetery (both needed)", () => {
    const t = d({ me: { hand: ["BP09-105"], deck: ["BP09-108", "BP09-109", "V1"] } }).play("BP09-105").pick("BP09-109");
    expect(t.field()).toEqual(["BP09-109"]);
    const act = d({ me: { cemetery: ["BP09-105", "BP09-108", "BP09-109"], playPoints: 4 } }).activate("BP09-105").none();
    expect([act.field(), act.zone("me", "banished"), act.pp()]).toEqual([["BP09-108", "BP09-109"], ["BP09-105"], 0]);
    expect(d({ me: { cemetery: ["BP09-105", "BP09-108"], playPoints: 4 } }).canActivate("BP09-105")).toBe(false);
    // With room for one, its player picks which one (ruling).
    const full = d({ me: { cemetery: ["BP09-105", "BP09-108", "BP09-109"], field: ["V1", "V1", "V1", "V1"], playPoints: 4 } });
    full.activate("BP09-105").pick("BP09-109");
    expect([full.field(), full.cemetery()]).toEqual([["V1", "V1", "V1", "V1", "BP09-109"], ["BP09-108"]]);
  });

  it("106 / 107 Paradise Vanguard — with 5 Angel cards in the cemetery banish an enemy follower; evolved banishes one costing 4 or less", () => {
    const t = d({ me: { hand: ["BP09-106"], cemetery: ANGELS }, opp: { field: ["V5"] } }).play("BP09-106");
    expect(t.zone("opp", "banished")).toEqual(["V5"]);
    expect(d({ me: { hand: ["BP09-106"], cemetery: ANGELS.slice(1) }, opp: { field: ["V5"] } }).play("BP09-106").field("opp")).toEqual(["V5"]);
    const evo = d({ me: { field: ["BP09-106"], evolveDeck: ["BP09-107"] }, opp: { field: ["V3", "V5"] } }).evolve("BP09-106");
    expect(evo.zone("opp", "banished")).toEqual(["V3"]);
  });

  it("108 / 109 Amaterasu and Tsukuyomi — when engaged: leader +1 / 1 damage to each enemy leader, 2 with the other on your field", () => {
    const ama = d({ me: { field: ["BP09-108"] }, opp: { field: [{ card: "V1", engaged: true }] } }).attack("BP09-108", "opp:V1");
    expect(ama.leader()).toBe(21);
    const pair = d({ me: { field: ["BP09-108", "BP09-109"] }, opp: { field: [{ card: "V1", engaged: true }, { card: "V3", engaged: true }] } });
    pair.attack("BP09-108", "opp:V1").attack("BP09-109", "opp:V3");
    expect([pair.leader(), pair.leader("opp")]).toEqual([22, 18]);
    // Ward engaging it in the end phase triggers too (ruling).
    const ward = d({ me: { field: ["BP09-108"] }, opp: { deck: ["V1"] } }).end().pick("BP09-108");
    expect(ward.leader()).toBe(21);
  });

  it("110 / 111 Suttungr — engages up to 2 enemy followers that then don't refresh; evolved: Follower Strike +2/+2", () => {
    const t = d({ me: { hand: ["BP09-110"], playPoints: 5, deck: ["V1"] }, opp: { field: ["V1", "V3", { card: "V5", engaged: true }], deck: ["V1"] } });
    t.play("BP09-110").pick("opp:V1", "opp:V5").end();
    expect([t.engaged("opp:V1"), t.engaged("opp:V3"), t.engaged("opp:V5")]).toEqual([true, false, true]);
    const evo = d({ me: { field: [{ card: "BP09-110", evolvedInto: "BP09-111" }] }, opp: { field: [{ card: "V1", engaged: true }] } }).attack("BP09-110", "opp:V1");
    expect(evo.stats("BP09-110")).toEqual([7, 5]);
    const leader = d({ me: { field: [{ card: "BP09-110", evolvedInto: "BP09-111" }] } }).attack("BP09-110", "opp:leader");
    expect(leader.stats("BP09-110")).toEqual([5, 5]);
  });

  it("112 Oceanus — a follower of yours evolving: 2 damage to an enemy follower or leader +1 (only (2) without a target)", () => {
    const t = d({ me: { field: ["BP09-112", "BP09-114"], evolveDeck: ["BP09-115"] }, opp: { field: ["V3"] } }).evolve("BP09-114").choose("damage");
    expect(t.stats("opp:V3")).toEqual([3, 2]);
    const none = d({ me: { field: ["BP09-112", "BP09-114"], evolveDeck: ["BP09-115"] } }).evolve("BP09-114");
    expect(none.leader()).toBe(21);
  });

  it("113 Divine Retribution — Quick: destroy an enemy follower; with an evolved follower of yours it goes to the EX area (full: cemetery)", () => {
    const valkyrie = { card: "BP09-114", evolvedInto: "BP09-115" };
    const t = d({ me: { hand: ["BP09-113"], field: [valkyrie], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP09-113");
    expect([t.field("opp"), t.ex(), t.cemetery()]).toEqual([[], ["BP09-113"], []]);
    const plain = d({ me: { hand: ["BP09-113"], field: ["BP09-114"], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP09-113");
    expect([plain.ex(), plain.cemetery()]).toEqual([[], ["BP09-113"]]);
    const full = d({ me: { hand: ["BP09-113"], field: [valkyrie], ex: ["V1", "V1", "V1", "V1", "V1"], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP09-113");
    expect(full.cemetery()).toEqual(["BP09-113"]);
  });

  it("114 / 115 Valkyrie of Chaos — Rush; evolved has Ward", () => {
    expect(d({ me: { hand: ["BP09-114"] } }).play("BP09-114").keywords("BP09-114")).toEqual(["rush"]);
    expect(d({ me: { field: ["BP09-114"], evolveDeck: ["BP09-115"] } }).evolve("BP09-114").keywords("BP09-114")).toEqual(["ward"]);
  });

  it("116 Valkyrie of Order — Fanfare, pay X: +X/+X", () => {
    const t = d({ me: { hand: ["BP09-116"], playPoints: 4 } }).play("BP09-116").yes().choose("X = 3");
    expect([t.stats("BP09-116"), t.pp()]).toEqual([[5, 4], 0]);
    const declined = d({ me: { hand: ["BP09-116"], playPoints: 4 } }).play("BP09-116").no();
    expect([declined.stats("BP09-116"), declined.pp()]).toEqual([[2, 1], 3]);
  });

  it("117 Fount of Angels — an Angel or Fallen Angel card from the top 3; engage and bury it: leader +1 with 2 such followers on your field", () => {
    const t = d({ me: { hand: ["BP09-117"], deck: ["V1", "BP03-119", "V3"] } }).play("BP09-117").pick("BP03-119").order();
    expect(t.hand()).toEqual(["BP03-119"]);
    expect(d({ me: { field: ["BP09-117", "BP01-159"] } }).canActivate("BP09-117")).toBe(false);
    const act = d({ me: { field: ["BP09-117", "BP01-159", "BP03-119"] } }).activate("BP09-117");
    expect([act.leader(), act.cemetery()]).toEqual([21, ["BP09-117"]]);
  });

  it("T01 Instant Poison — 4 damage to an enemy follower and 2 to its leader; needs a target", () => {
    const t = d({ me: { ex: ["BP09-T01"] }, opp: { field: ["V5"] } }).play("BP09-T01");
    expect([t.stats("opp:V5"), t.leader("opp"), t.cemetery()]).toEqual([[5, 1], 18, []]);
    expect(d({ me: { ex: ["BP09-T01"] } }).canPlay("BP09-T01")).toBe(false);
  });

  it("T02 Eternal Potion — summons a Runecraft follower costing 3 or less from your cemetery with Rush; it is destroyed at your end phase", () => {
    const t = d({ me: { ex: ["BP09-T02"], cemetery: ["BP01-068", "V1"] }, opp: { deck: ["V1"] } }).play("BP09-T02");
    expect([t.field(), t.keywords("BP01-068")]).toEqual([["BP01-068"], ["rush"]]);
    t.end();
    expect([t.field(), t.cemetery()]).toEqual([["BP01-T10"], ["V1", "BP01-068"]]);
  });
});
