import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP16 Dragoncraft (056–074, T03). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); EVOLVER evolves into EVOLVER-E.
// Overflow: max play points 7 or more. BP16-063 is a 7-cost Dragoncraft card; BP04-078 Dragon's Nest (act: engage
// and bury it); BP11-T04 Bullet Bike a Mount amulet; BP11-052 Reggie a Wasteland follower with {[evolve]} (evolved:
// +1 attack to your other Wasteland followers); BP15-069 a Marine follower. Tokens: BP01-T11 Dragon, BP02-T05
// Megalorca, BP16-T03 Fire Drake Whelp.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };
const n = (count: number, id = "V1") => Array<string>(count).fill(id);

describe("BP16 Dragoncraft", () => {
  it("056 Forte, Blackwing Dragoon — Storm, Intimidate; Fanfare: +1 attack and Aura with 10 max play points", () => {
    const t = d({ me: { hand: ["BP16-056"], maxPlayPoints: 10, playPoints: 5 } }).play("BP16-056");
    expect([t.stats("BP16-056"), t.keywords("BP16-056")]).toEqual([[7, 5], ["storm", "intimidate", "aura"]]);
    expect(d({ me: { hand: ["BP16-056"], maxPlayPoints: 9, playPoints: 5 } }).play("BP16-056").stats("BP16-056")).toEqual([6, 5]);
  });

  it("057 / 058 Burnite, Anathema of Flame — 2 less with 4 big Dragoncraft cards in the cemetery; Fanfare / evolved, discard a card: its cost in damage, draw; super-evolved: leader +5; end phase with 7: 7 to the enemy leader", () => {
    expect(d({ me: { hand: ["BP16-057"], cemetery: n(4, "BP16-063"), playPoints: 5 } }).canPlay("BP16-057")).toBe(true);
    expect(d({ me: { hand: ["BP16-057"], cemetery: n(3, "BP16-063"), playPoints: 5 } }).canPlay("BP16-057")).toBe(false);
    const t = d({ me: { hand: ["BP16-057", "BP16-063"], deck: ["V1"], playPoints: 7 }, opp: { field: ["V5", "V3"] } }).play("BP16-057").yes().pick("opp:V5");
    expect([t.field("opp"), t.hand(), t.cemetery()]).toEqual([["V3"], ["V1"], ["BP16-063"]]);
    const s = d({ me: { field: ["BP16-057"], evolveDeck: ["BP16-058"], hand: ["V1"], playPoints: 1, ...SUPER } }).evolve("BP16-057", { sep: true }).flush();
    expect(s.leader()).toBe(25);
    expect(d({ me: { field: [{ card: "BP16-057", evolvedInto: "BP16-058" }], cemetery: n(7, "BP16-063") }, opp: { deck: ["V1"] } }).end().leader("opp")).toBe(13);
  });

  it("059 / 060 Nirle, Draconic Prodigy — evolves only with Overflow; Fanfare: max play points +1 with a Mount card; evolved: evolve another Wasteland follower with {[evolve]}", () => {
    expect(d({ me: { field: ["BP16-059"], evolveDeck: ["BP16-060"], maxPlayPoints: 6, playPoints: 1 } }).canEvolve("BP16-059")).toBe(false);
    expect(d({ me: { field: ["BP16-059"], evolveDeck: ["BP16-060"], maxPlayPoints: 7, playPoints: 1 } }).canEvolve("BP16-059")).toBe(true);
    const t = d({ me: { hand: ["BP16-059"], field: ["BP11-T04"], maxPlayPoints: 5, playPoints: 2 } }).play("BP16-059");
    expect(t.game.state.players[0].maxPlayPoints).toBe(6);
    const evo = d({ me: { field: ["BP16-059", "BP11-052"], evolveDeck: ["BP16-060", "BP11-053"], maxPlayPoints: 7, playPoints: 1 } }).evolve("BP16-059").yes();
    expect([evo.stats("BP11-052"), evo.stats("BP16-059")]).toEqual([[3, 3], [6, 5]]);
  });

  it("061 / 062 Liu Feng, Goldennote Ward — evolved: 3 damage; super-evolved: max play points +1, leader +2", () => {
    expect(d({ me: { field: ["BP16-061"], evolveDeck: ["BP16-062"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP16-061").stats("opp:V5")).toEqual([5, 2]);
    const s = d({ me: { field: ["BP16-061"], evolveDeck: ["BP16-062"], maxPlayPoints: 8, playPoints: 1, ...SUPER } }).evolve("BP16-061", { sep: true }).flush();
    expect([s.game.state.players[0].maxPlayPoints, s.leader()]).toEqual([9, 22]);
  });

  it("063 Genesis Dragon Reborn — Storm", () => {
    expect(d({ me: { field: ["BP16-063"] } }).keywords("BP16-063")).toEqual(["storm"]);
  });

  it("064 Fan of Otohime — act, engage and bury it: a Megalorca; act (1), engage and bury it, with a Marine follower: 4 damage", () => {
    const t = d({ me: { field: ["BP16-064"] } }).activate("BP16-064");
    expect([t.field(), t.cemetery()]).toEqual([["BP02-T05"], ["BP16-064"]]);
    const dmg = d({ me: { field: ["BP16-064", "BP15-069"], playPoints: 1 }, opp: { field: ["V5"] } }).activate("BP16-064", 1);
    expect(dmg.stats("opp:V5")).toEqual([5, 1]);
    expect(() => d({ me: { field: ["BP16-064"], playPoints: 1 }, opp: { field: ["V5"] } }).activate("BP16-064", 1)).toThrow(/not legal/);
  });

  it("065 / 066 Eyfa, Windrider — Storm, Intimidate", () => {
    expect(d({ me: { field: ["BP16-065"], evolveDeck: ["BP16-066"], playPoints: 1 } }).evolve("BP16-065").keywords("BP16-065")).toEqual(["storm", "intimidate"]);
  });

  it("067 Marion, Ravishing Dragonewt — Fanfare: draw, discard; act, engage, with 4 big Dragoncraft cards in the cemetery: 4 damage", () => {
    expect(d({ me: { hand: ["BP16-067", "V3"], deck: ["V1"], playPoints: 2 } }).play("BP16-067").pick("V3").hand()).toEqual(["V1"]);
    expect(d({ me: { field: ["BP16-067"], cemetery: n(4, "BP16-063") }, opp: { field: ["V5"] } }).activate("BP16-067").stats("opp:V5")).toEqual([5, 1]);
    expect(d({ me: { field: ["BP16-067"], cemetery: n(3, "BP16-063") }, opp: { field: ["V5"] } }).canActivate("BP16-067")).toBe(false);
  });

  it("068 Kit, Luxfang Champion — discarded, may go into the EX area; Rush; Fanfare: +1 attack and Assail with Overflow", () => {
    const t = d({ me: { hand: ["BP16-068", "BP16-067"], deck: ["V1"], playPoints: 2 } }).play("BP16-067").pick("BP16-068").yes();
    expect(t.ex()).toEqual(["BP16-068"]);
    const o = d({ me: { hand: ["BP16-068"], maxPlayPoints: 7, playPoints: 1 } }).play("BP16-068");
    expect([o.stats("BP16-068"), o.keywords("BP16-068")]).toEqual([[3, 1], ["rush", "assail"]]);
  });

  it("069 / 070 Little Dragon Nanny / T03 Fire Drake Whelp — evolved: a Dragon's Nest from the deck; a Dragon's Nest from your field into the cemetery: a Fire Drake Whelp (Intimidate)", () => {
    expect(d({ me: { field: ["BP16-069"], evolveDeck: ["BP16-070"], deck: ["V1", "BP04-078"], playPoints: 1 } }).evolve("BP16-069").pick("BP04-078").field()).toEqual(["BP16-069", "BP04-078"]);
    const t = d({ me: { field: [{ card: "BP16-069", evolvedInto: "BP16-070" }, "BP04-078"] } }).activate("BP04-078");
    expect([t.field(), t.keywords("BP16-T03")]).toEqual([["BP16-069", "BP16-T03"], ["intimidate"]]);
  });

  it("071 Zell, Windreader — Fanfare: Storm to a Dragoncraft follower with 10 max play points", () => {
    expect(d({ me: { hand: ["BP16-071"], field: ["BP16-069"], maxPlayPoints: 10, playPoints: 3 } }).play("BP16-071").pick("BP16-069").keywords("BP16-069")).toEqual(["storm"]);
    expect(d({ me: { hand: ["BP16-071"], field: ["BP16-069"], maxPlayPoints: 9, playPoints: 3 } }).play("BP16-071").pick("BP16-069").keywords("BP16-069")).toEqual([]);
  });

  it("072 Silvercloud Dragonrider — Ward; Fanfare: a Dragon; discarded, (2): a Dragon", () => {
    expect(d({ me: { hand: ["BP16-072"], playPoints: 7 } }).play("BP16-072").none().field()).toEqual(["BP16-072", "BP01-T11"]);
    const t = d({ me: { hand: ["BP16-072", "BP16-067"], deck: ["V1"], playPoints: 4 } }).play("BP16-067").pick("BP16-072").yes();
    expect([t.field(), t.pp()]).toEqual([["BP16-067", "BP01-T11"], 0]);
  });

  it("073 Swordsnout Trencher — Rush; Storm with Overflow", () => {
    expect(d({ me: { field: ["BP16-073"], maxPlayPoints: 7 } }).keywords("BP16-073")).toEqual(["rush", "storm"]);
    expect(d({ me: { field: ["BP16-073"], maxPlayPoints: 6 } }).keywords("BP16-073")).toEqual(["rush"]);
  });

  it("074 Goldennote Melody — leader +3 or draw 2; both after an evolution this turn", () => {
    expect(d({ me: { hand: ["BP16-074"], playPoints: 3 } }).play("BP16-074").choose("leader").leader()).toBe(23);
    const t = d({ me: { hand: ["BP16-074"], field: ["EVOLVER"], evolveDeck: ["EVOLVER-E"], deck: ["V1", "V3"], playPoints: 5 } }).evolve("EVOLVER");
    t.play("BP16-074").choose("leader", "draw");
    expect([t.leader(), t.hand()]).toEqual([23, ["V1", "V3"]]);
  });
});
