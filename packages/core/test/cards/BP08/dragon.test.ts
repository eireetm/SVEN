import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP08 Dragoncraft (052–068). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5;
// QUICK-SAC destroys one of your followers.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const VANGUARD = "BP08-T03";
const faceup = (n: number) => Array.from({ length: n }, () => "BP06-002");

describe("BP08 Dragoncraft", () => {
  it("052 Dragon Empress Otohime — 1 Vanguard (3 in Overflow); each other Dragoncraft follower sent to the cemetery deals 1", () => {
    expect(d({ me: { hand: ["BP08-052"], playPoints: 4 } }).play("BP08-052").field()).toEqual(["BP08-052", VANGUARD]);
    const over = d({ me: { hand: ["BP08-052"], playPoints: 7 } }).play("BP08-052");
    expect(over.field()).toEqual(["BP08-052", VANGUARD, VANGUARD, VANGUARD]);

    const trigger = d({ me: { field: ["BP08-052", "BP06-063"], hand: ["QUICK-SAC"] }, opp: { field: ["V5"] } });
    trigger.play("QUICK-SAC").pick("BP06-063").pick("opp:leader");
    expect(trigger.leader("opp")).toBe(19);
  });

  it("053 Azi Dahaka — turns 3 facedown evolved followers faceup as its Fanfare cost, then destroys", () => {
    const enough = d({
      me: { hand: ["BP08-053"], evolveDeck: faceup(3), playPoints: 6 },
      opp: { field: ["V5"] },
    });
    enough.play("BP08-053").yes();
    expect([
      enough.game.reader().faceUpEvolveDeck(0).length,
      enough.game.reader().faceDownEvolveDeck(0).length,
      enough.field("opp"),
    ]).toEqual([3, 0, []]);

    const short = d({
      me: { hand: ["BP08-053"], evolveDeck: faceup(2), playPoints: 6 },
      opp: { field: ["V5"] },
    });
    short.play("BP08-053");
    expect([
      short.game.reader().faceUpEvolveDeck(0).length,
      short.game.reader().faceDownEvolveDeck(0).length,
      short.field("opp"),
    ]).toEqual([0, 2, ["V5"]]);
  });

  it("054 Azi Dahaka (Evolved) — Storm; Strike applies both faceup-evolve-deck thresholds", () => {
    const eight = d({ me: { field: [{ card: "BP08-053", evolvedInto: "BP08-054" }], faceUpEvolveDeck: faceup(8) } });
    eight.attack("BP08-053", "opp:leader");
    expect([eight.leader(), eight.leader("opp"), eight.keywords("BP08-053")]).toEqual([23, 10, ["storm"]]);
    const five = d({ me: { field: [{ card: "BP08-053", evolvedInto: "BP08-054" }], faceUpEvolveDeck: faceup(5) } });
    five.attack("BP08-053", "opp:leader");
    expect([five.leader(), five.leader("opp")]).toEqual([23, 13]);
  });

  it("055 / 056 Annerose — Overflow top 3 Dragonewt; evolved deals 2", () => {
    const t = d({ me: { hand: ["BP08-055"], deck: ["V1", "BP08-055", "V3"], playPoints: 7 } });
    t.play("BP08-055").pick("BP08-055").order("V1", "V3");
    expect(t.hand()).toEqual(["BP08-055"]);
    const evo = d({ me: { field: ["BP08-055"], evolveDeck: ["BP08-056"], playPoints: 1 }, opp: { field: ["V5"] } });
    evo.evolve("BP08-055");
    expect(evo.stats("opp:V5")).toEqual([5, 3]);
  });

  it("057 Ouroboros — without a target its whole Fanfare does nothing; Last Words discards 2 to return to EX", () => {
    const noTarget = d({ me: { hand: ["BP08-057"], playPoints: 7 } }).play("BP08-057");
    expect([noTarget.field(), noTarget.leader()]).toEqual([["BP08-057"], 20]);
    const t = d({
      me: { hand: ["BP08-057", "QUICK-SAC", "V1", "V2"], playPoints: 7 },
      opp: { field: ["V5"] },
    });
    t.play("BP08-057");
    expect([t.field("opp"), t.leader()]).toEqual([[], 25]);
    t.play("QUICK-SAC").yes();
    expect(t.ex()).toEqual(["BP08-057"]);
  });

  it("058 Powerforge — both targets are required; damage equals your selected follower's attack", () => {
    const t = d({ me: { hand: ["BP08-058"], ex: ["V5"], playPoints: 1 }, opp: { field: ["V5"] } });
    t.play("BP08-058");
    expect(t.field("opp")).toEqual([]);
    expect(d({ me: { hand: ["BP08-058"], playPoints: 1 }, opp: { field: ["V5"] } }).canPlay("BP08-058")).toBe(false);
  });

  it("059 / 060 Elios — positive and lethal damage trigger leader +1; zero attack does not; evolved has Storm and Ward", () => {
    const lethal = d({ me: { field: ["BP08-059"] }, opp: { field: [{ card: "V5", engaged: true }] } });
    lethal.attack("BP08-059", "opp:V5");
    expect([lethal.field(), lethal.leader()]).toEqual([[], 21]);
    const zero = d({ me: { field: ["BP08-059"] }, opp: { field: [{ card: "ZERO", engaged: true }] } });
    zero.attack("BP08-059", "opp:ZERO");
    expect([zero.stats("BP08-059"), zero.leader()]).toEqual([[2, 4], 20]);
    const evolved = d({ me: { field: [{ card: "BP08-059", evolvedInto: "BP08-060" }] } });
    expect(evolved.keywords("BP08-059")).toEqual(["storm", "ward"]);
  });

  it("061 Dragonsoul Princess — Wyrmkin follower to EX, costing 3 less during Overflow", () => {
    const t = d({ me: { hand: ["BP08-061"], deck: ["BP08-067", "V1"], playPoints: 7 } });
    t.play("BP08-061").pick("BP08-067");
    expect([t.ex(), t.canPlay("BP08-067")]).toEqual([["BP08-067"], true]);
    t.play("BP08-067");
    expect(t.pp()).toBe(4);
  });

  it("062 Vile Violet Dragon — Overflow +1/+1 and Rush; damage draws 2 only once on your turn", () => {
    const t = d({
      me: { hand: ["BP08-062", "BP08-063"], deck: ["V1", "V2", "V3", "V5"], playPoints: 11 },
      opp: { field: [{ card: "V1", engaged: true }] },
    });
    t.play("BP08-062");
    expect([t.stats("BP08-062"), t.keywords("BP08-062")]).toEqual([[5, 5], ["rush"]]);
    t.attack("BP08-062", "opp:V1");
    expect(t.hand()).toEqual(["BP08-063", "V1", "V2"]);
    t.play("BP08-063");
    expect(t.hand()).toEqual(["V1", "V2"]);
  });

  it("063 Zealot of Disdain — Fanfare hits every follower; lethal ability damage still deals 1 to the enemy leader", () => {
    const t = d({
      me: { field: [{ card: "BP08-063", damage: 1 }], hand: ["BP08-068"], playPoints: 1 },
      opp: { field: ["V5"] },
    });
    t.play("BP08-068").pick("BP08-063");
    expect([t.field(), t.leader("opp")]).toEqual([[], 19]);
    const fanfare = d({ me: { hand: ["BP08-063"], playPoints: 2 }, opp: { field: ["V1"] } }).play("BP08-063");
    expect([fanfare.stats("BP08-063"), fanfare.stats("opp:V1"), fanfare.leader("opp")]).toEqual([[2, 1], [2, 1], 19]);
  });

  it("064 Righteous Dragoon — Overflow modes deal 4 to one or 2 to all; no target leaves only the all mode", () => {
    const one = d({ me: { hand: ["BP08-064"], playPoints: 7 }, opp: { field: ["V5"] } });
    one.play("BP08-064").choose("four");
    expect(one.stats("opp:V5")).toEqual([5, 1]);
    const all = d({ me: { hand: ["BP08-064"], playPoints: 7 }, opp: { field: ["V1", "V3"] } });
    all.play("BP08-064").choose("all");
    expect([all.field("opp"), all.stats("opp:V3")]).toEqual([["V3"], [3, 2]]);
    expect(d({ me: { hand: ["BP08-064"], playPoints: 7 } }).play("BP08-064").decision?.type).toBe("mainPhase");
  });

  it("065 / 066 Geovore — mill 2 then non-Dragoncraft check; evolved Strike may banish 5 for +2 attack", () => {
    const t = d({ me: { hand: ["BP08-065"], deck: ["BP08-067", "V1", "V3"], playPoints: 6 } }).play("BP08-065");
    expect([t.cemetery(), t.hand(), t.leader()]).toEqual([["BP08-067", "V1"], ["V3"], 22]);
    const evo = d({
      me: { field: [{ card: "BP08-065", evolvedInto: "BP08-066" }], cemetery: Array<string>(5).fill("V1") },
    });
    evo.attack("BP08-065", "opp:leader").yes();
    expect([evo.stats("BP08-065"), evo.leader("opp"), evo.zone("me", "banished").length]).toEqual([[7, 7], 13, 5]);
  });

  it("067 Marionette Dragon — Rush; destroys itself at the start of your end phase", () => {
    const t = d({ me: { field: ["BP08-067"], deck: ["V1"] }, opp: { deck: ["V1"] } });
    expect(t.keywords("BP08-067")).toEqual(["rush"]);
    t.end();
    expect([t.field(), t.cemetery()]).toEqual([[], ["BP08-067"]]);
  });

  it("068 Sneer of Disdain — spell deals 1; cemetery copy may be banished when Galmieux enters", () => {
    const spell = d({ me: { hand: ["BP08-068"], field: ["V3"], playPoints: 1 } }).play("BP08-068");
    expect(spell.stats("V3")).toEqual([3, 3]);
    const cemetery = d({ me: { hand: ["BP05-052"], field: ["V3"], cemetery: ["BP08-068"], playPoints: 5 } });
    cemetery.play("BP05-052").yes().pick("V3");
    expect([cemetery.zone("me", "banished"), cemetery.stats("V3")]).toEqual([["BP08-068"], [3, 3]]);
  });
});
