import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP06 Neutral (107–121) and tokens. V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5; KILL a 1-cost
// spell; AMULET a 1-cost amulet; QUICK-SAC destroys a follower of yours (0).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);

describe("BP06 Neutral", () => {
  it("107 Mammoth God's Colosseum — each player keeps one follower and buries the rest; Last Words: summon a Colosseum on High", () => {
    const t = d({ me: { hand: ["BP06-107"], field: ["V1", "V3"], playPoints: 7 }, opp: { field: ["V1", "V5"] } });
    t.play("BP06-107").pick("BP06-107").pick("opp:V5");
    expect([t.field(), t.field("opp"), t.cemetery()]).toEqual([["BP06-107"], ["V5"], ["V1", "V3"]]);
    const lw = d({ me: { field: ["BP06-107"], hand: ["QUICK-SAC"], deck: ["V1", "BP06-113"] }, opp: { deck: ["V2"] } });
    lw.play("QUICK-SAC").pick("BP06-113");
    expect(lw.field()).toEqual(["BP06-113"]);
  });

  it("108 / 109 Badb Catha — +1/+1 to another follower, leader +2, or arrange the top 3; evolved: engage all, 2 to the leader, or top card to EX", () => {
    const heal = d({ me: { hand: ["BP06-108"] } }).play("BP06-108").choose("heal");
    expect(heal.leader()).toBe(22);
    const arrange = d({ me: { hand: ["BP06-108"], deck: ["V1", "V2", "V3", "V5"] } }).play("BP06-108").choose("arrange");
    arrange.pick("V3", "V1").order("V1", "V3");
    expect(arrange.zone("me", "deck")).toEqual(["V1", "V3", "V5", "V2"]);
    const evo = d({ me: { field: ["BP06-108"], evolveDeck: ["BP06-109"], playPoints: 2 }, opp: { field: ["V1", "V5"] } });
    evo.evolve("BP06-108").choose("engage");
    expect([evo.engaged("opp:V1"), evo.engaged("opp:V5")]).toEqual([true, true]);
  });

  it("110 Mithra — each player rolls: 1–3 draw 2, 4–6 discard 2 at random", () => {
    const t = d({ me: { hand: ["BP06-110", "V1", "V1"], deck: ["V2", "V2"], playPoints: 6 }, opp: { hand: ["V1", "V1", "V1"], deck: ["V2", "V2"] } });
    t.play("BP06-110");
    const rolls = t.events.flatMap((e) => (e.type === "dieRolled" ? [e] : []));
    expect(rolls.map((r) => r.player)).toEqual([0, 1]);
    expect(t.hand().length).toBe(rolls[0]!.result <= 3 ? 4 : 0);
    expect(t.hand("opp").length).toBe(rolls[1]!.result <= 3 ? 5 : 1);
  });

  it("111 Mithra (Evolved) — roll the declared number: leader +5, any card into the EX area, recover all PP", () => {
    const spec = { me: { field: ["BP06-110"], evolveDeck: ["BP06-111"], deck: ["V1", "V5"], playPoints: 3 } };
    const miss = d(spec).evolve("BP06-110");
    const probe = d(spec).evolve("BP06-110").choose("1");
    const rolled = probe.events.flatMap((e) => (e.type === "dieRolled" ? [e.result] : []))[0]!;
    miss.choose(String(rolled === 6 ? 1 : rolled + 1));
    expect([miss.leader(), miss.ex(), miss.pp()]).toEqual([20, [], 2]);
    const hit = d(spec).evolve("BP06-110").choose(String(rolled)).pick("V5");
    expect([hit.leader(), hit.ex(), hit.pp()]).toEqual([25, ["V5"], 3]);
  });

  it("112 Fall from Grace — Quick; banish a follower on either side; its leader +2 and its player draws", () => {
    const t = d({ me: { hand: ["BP06-112"] }, opp: { field: ["V5"], deck: ["V1"] } }).play("BP06-112");
    expect([t.zone("opp", "banished"), t.leader("opp"), t.hand("opp")]).toEqual([["V5"], 22, ["V1"]]);
  });

  it("113 Colosseum on High — each player may summon a follower from their top 3, burying the rest", () => {
    const t = d({ me: { hand: ["BP06-113"], deck: ["V1", "KILL", "V3", "V5"], playPoints: 6 }, opp: { deck: ["V2", "V1", "KILL", "V5"] } });
    t.play("BP06-113").pick("V3").pick("opp:V2");
    expect([t.field(), t.field("opp"), t.cemetery(), t.cemetery("opp"), t.zone("me", "deck")]).toEqual([
      ["BP06-113", "V3"],
      ["V2"],
      ["V1", "KILL"],
      ["V1", "KILL"],
      ["V5"],
    ]);
  });

  it("114 / 115 Chaht — 3 less with Colosseum on High on your field; evolved searches an Arena card", () => {
    expect(d({ me: { hand: ["BP06-114"], field: ["BP06-113"], playPoints: 0 } }).canPlay("BP06-114")).toBe(true);
    const evo = d({ me: { field: ["BP06-114"], evolveDeck: ["BP06-115"], deck: ["V1", "BP06-113"], playPoints: 1 } }).evolve("BP06-114").pick("BP06-113");
    expect(evo.hand()).toEqual(["BP06-113"]);
  });

  it("116 Clash of Heroes — the two selected followers deal their attack to each other", () => {
    const t = d({ me: { hand: ["BP06-116"], field: ["V3"] }, opp: { field: ["V5"] } }).play("BP06-116");
    expect([t.field(), t.stats("opp:V5")]).toEqual([[], [5, 2]]);
  });

  it("117 Biofabrication — a faceup evolved follower in your evolve deck turns facedown; draw", () => {
    const t = d({ me: { hand: ["BP06-117"], faceUpEvolveDeck: ["BP06-002"], deck: ["V1"] } }).play("BP06-117");
    expect([t.game.reader().faceUpEvolveDeck(0), t.hand()]).toEqual([[], ["V1"]]);
    expect(d({ me: { hand: ["BP06-117"], evolveDeck: ["BP06-002"] } }).canPlay("BP06-117")).toBe(false);
  });

  it("118 Sweet-Tooth Sleuth — the opponent reveals their hand", () => {
    const t = d({ me: { hand: ["BP06-118"] }, opp: { hand: ["V1", "KILL"] } }).play("BP06-118");
    const revealed = t.events.flatMap((e) => (e.type === "cardsRevealed" ? e.cards.map((c) => c.def) : []));
    expect(revealed).toEqual(["V1", "KILL"]);
  });

  it("119 / 120 Bazooka Goblins — destroy an enemy card costing 2 or less (amulets too)", () => {
    const t = d({ me: { hand: ["BP06-119"], playPoints: 4 }, opp: { field: ["AMULET", "V3"] } }).play("BP06-119");
    expect(t.field("opp")).toEqual(["V3"]);
    const evo = d({ me: { field: ["BP06-119"], evolveDeck: ["BP06-120"], playPoints: 2 }, opp: { field: ["V2", "V5"] } }).evolve("BP06-119");
    expect(evo.field("opp")).toEqual(["V5"]);
  });

  it("121 Sentry Gate — an attacking enemy follower takes 2 unless its player pays 2 to destroy the gate", () => {
    const t = d({ me: { field: ["BP06-121"], deck: ["V1"] }, opp: { field: ["V5", "V3"], deck: ["V1"], maxPlayPoints: 3 } }).end();
    t.attack("opp:V5", "leader").no();
    expect([t.stats("opp:V5"), t.leader()]).toEqual([[5, 3], 15]);
    t.attack("opp:V3", "leader").yes();
    expect([t.field(), t.pp("opp"), t.stats("opp:V3")]).toEqual([[], 2, [3, 4]]);
  });

  it("T01 / T02 / T03 — Celestial Shikigami: Aura; Paper Shikigami: Last Words draw and discard; One-Tailed Fox: Rush, Ward", () => {
    const t = d({ me: { field: ["BP06-T01", "BP06-T02", "BP06-T03"], hand: ["QUICK-SAC"], deck: ["V1"] } });
    expect([t.keywords("BP06-T01"), t.keywords("BP06-T03")]).toEqual([["aura"], ["rush", "ward"]]);
    t.play("QUICK-SAC").pick("BP06-T02");
    expect([t.hand(), t.cemetery()]).toEqual([[], ["QUICK-SAC", "V1"]]);
  });
});
