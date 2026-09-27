import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// CP04 Dragoncraft (055–072, T08–T09), Princess Connect! Re: Dive. Both decks are based on the universe (CR 14.5.1.2). V1 is 1c
// 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); AMULET is a 1-cost amulet. CP04-105 Suzume (2c; UB Fanfare: leader +2) executes a Union
// Burst ability. Dragon's Nest cards: CP04-063 Inori (2c), CP04-057 Homare (5c); Geo Theogonia: CP04-065 Lind, CP04-066 Wyrm;
// Twinkle Wish: CP04-095 Yui (1c); Sarendia Orphanage: CP04-105 Suzume. CP04-094 Akino costs 7.
const E = cardEngine();
const PC = { universe: "princessConnect" as const };
const d = (spec: DriveSpec) => drive(E, { ...spec, me: { ...PC, ...spec.me }, opp: { ...PC, ...spec.opp } });
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };

describe("CP04 Dragoncraft", () => {
  it("055 / T08 Sheffy — UB Fanfare: an enemy follower doesn't refresh next start phase; with Overflow an Eisdrache (engage an enemy, +2/+2)", () => {
    const t = d({ me: { hand: ["CP04-055"], playPoints: 2 }, opp: { field: [{ card: "V5", engaged: true }], deck: ["V1"] } }).play("CP04-055").flush();
    expect(t.zone("me", "equipmentZone")).toEqual([]);
    expect(t.end().engaged("opp:V5")).toBe(true);
    const o = d({ me: { hand: ["CP04-055"], playPoints: 2, maxPlayPoints: 7 }, opp: { field: ["V5"] } }).play("CP04-055").flush();
    expect([o.zone("me", "equipmentZone"), o.stats("CP04-055"), o.engaged("opp:V5")]).toEqual([["CP04-T08"], [4, 4], true]);
    // Without an enemy follower the Eisdrache's ability can't be played: no +2/+2 (ruling).
    const none = d({ me: { hand: ["CP04-055"], playPoints: 2, maxPlayPoints: 7 } }).play("CP04-055").flush();
    expect([none.zone("me", "equipmentZone"), none.stats("CP04-055")]).toEqual([["CP04-T08"], [2, 2]]);
  });

  it("056 Sheffy (Evolved) — On Evolve: 2 damage divided between up to 2; super-evolved: 3 damage to each enemy follower", () => {
    const t = d({ me: { field: ["CP04-055"], evolveDeck: ["CP04-056"], playPoints: 1 }, opp: { field: ["V5", "V3"] } }).evolve("CP04-055").pick("opp:V5", "opp:V3");
    expect([t.stats("opp:V5"), t.stats("opp:V3")]).toEqual([[5, 4], [3, 3]]);
    const s = d({ me: { field: ["CP04-055"], evolveDeck: ["CP04-056"], playPoints: 1, ...SUPER }, opp: { field: ["V5"] } });
    s.evolve("CP04-055", { sep: true }).flush().pick("opp:V5").flush();
    expect(s.field("opp")).toEqual([]);
  });

  it("057 Homare — Fanfare: max play points +1; UB Activate: 5 damage, 2 play points back with Overflow; another's UB: max play points +1", () => {
    expect(d({ me: { hand: ["CP04-057"], playPoints: 5, maxPlayPoints: 5 } }).play("CP04-057").game.state.players[0].maxPlayPoints).toBe(6);
    const a = d({ me: { field: ["CP04-057"], playPoints: 0, maxPlayPoints: 7 }, opp: { field: ["V5"] } }).activate("CP04-057");
    expect([a.field("opp"), a.pp()]).toEqual([[], 2]);
    const u = d({ me: { field: ["CP04-057"], hand: ["CP04-105"], playPoints: 2, maxPlayPoints: 5 } }).play("CP04-105");
    expect(u.game.state.players[0].maxPlayPoints).toBe(6);
  });

  it("058 / T09 Muimi — UB Fanfare: draw, discard; with Overflow a Precious Memento (Storm, Strike: 3 damage to up to 2); with 10 max +3 attack", () => {
    const t = d({ me: { hand: ["CP04-058", "V1"], deck: ["V3"], playPoints: 2, maxPlayPoints: 10 } }).play("CP04-058").pick("V1");
    expect([t.stats("CP04-058"), t.keywords("CP04-058"), t.zone("me", "equipmentZone"), t.cemetery()]).toEqual([[5, 3], ["storm"], ["CP04-T09"], ["V1"]]);
    const s = d({ me: { field: [{ card: "CP04-058", equipped: ["CP04-T09"] }] }, opp: { field: ["V5", "V3"] } }).attack("CP04-058", "opp:leader").pick("opp:V5", "opp:V3");
    expect([s.stats("opp:V5"), s.stats("opp:V3")]).toEqual([[5, 2], [3, 1]]);
  });

  it("059 / 060 Kaya — Storm; Fanfare: 4 damage, evolves with 10 max; another's UB: 2 to the leader; evolved UB: a Dragon's Nest card into the EX area", () => {
    const t = d({ me: { hand: ["CP04-059"], evolveDeck: ["CP04-060"], playPoints: 6, maxPlayPoints: 10 }, opp: { field: ["V5"] } }).play("CP04-059").yes();
    expect([t.stats("opp:V5"), t.stats("CP04-059"), t.keywords("CP04-059")]).toEqual([[5, 1], [5, 5], ["storm"]]);
    expect(d({ me: { field: ["CP04-059"], hand: ["CP04-105"], playPoints: 2 } }).play("CP04-105").flush().leader("opp")).toBe(18);
    const e = d({ me: { field: ["CP04-059"], evolveDeck: ["CP04-060"], deck: ["CP04-063"], playPoints: 1 } }).evolve("CP04-059").pick("CP04-063");
    expect([e.ex(), e.canPlay("CP04-063")]).toEqual([["CP04-063"], true]);
  });

  it("061 Hiyori — Rush; UB Strike: 2 damage to a follower and its leader (4 with 10 max); Fanfare: a 1-cost Twinkle Wish follower into the EX area", () => {
    const t = d({ me: { field: ["CP04-061"] }, opp: { field: ["V5"] } }).attack("CP04-061", "opp:leader");
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[5, 3], 14]);
    const ten = d({ me: { field: ["CP04-061"], maxPlayPoints: 10, playPoints: 0 }, opp: { field: ["V5"] } }).attack("CP04-061", "opp:leader");
    expect([ten.stats("opp:V5"), ten.leader("opp")]).toEqual([[5, 1], 12]);
    expect(d({ me: { hand: ["CP04-061"], deck: ["CP04-095"], playPoints: 4 } }).play("CP04-061").pick("CP04-095").ex()).toEqual(["CP04-095"]);
  });

  it("062 Until We Meet Again — (1) max play points +1 and leader +1; (2) with 10 max, a 2-cost PriConne follower from the deck", () => {
    const one = d({ me: { hand: ["CP04-062"], playPoints: 3, maxPlayPoints: 5 } }).play("CP04-062").choose("1");
    expect([one.game.state.players[0].maxPlayPoints, one.leader()]).toEqual([6, 21]);
    const two = d({ me: { hand: ["CP04-062"], deck: ["CP04-105"], playPoints: 3, maxPlayPoints: 10 } }).play("CP04-062").choose("2").pick("CP04-105");
    expect([two.field(), two.leader()]).toEqual([["CP04-105"], 22]);
  });

  it("063 / 064 Inori — UB Activate with Overflow: 1 damage to each enemy; evolved: a Dragon's Nest card from the deck", () => {
    expect(d({ me: { field: ["CP04-063"] }, opp: { field: ["V5"] } }).canActivate("CP04-063")).toBe(false);
    const t = d({ me: { field: ["CP04-063"], maxPlayPoints: 7, playPoints: 0 }, opp: { field: ["V5"] } }).activate("CP04-063");
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[5, 4], 19]);
    expect(d({ me: { field: ["CP04-063"], evolveDeck: ["CP04-064"], deck: ["CP04-057"], playPoints: 1 } }).evolve("CP04-063").pick("CP04-057").hand()).toEqual(["CP04-057"]);
  });

  it("065 Lind — Ward; UB Activate: another Geo Theogonia follower +1/+1, refreshed, it can't attack enemies this turn", () => {
    const t = d({ me: { field: ["CP04-065", { card: "CP04-066", engaged: true }] }, opp: { field: [{ card: "V1", engaged: true }] } }).activate("CP04-065");
    expect([t.stats("CP04-066"), t.engaged("CP04-066"), t.attackTargets("CP04-066"), t.keywords("CP04-065")]).toEqual([[4, 3], false, [], ["ward"]]);
  });

  it("066 Wyrm — Fanfare: engaged without another Geo Theogonia follower; UB Activate: 3 damage, 3 to its leader with a 7-cost follower", () => {
    expect(d({ me: { hand: ["CP04-066"], playPoints: 2 } }).play("CP04-066").engaged("CP04-066")).toBe(true);
    expect(d({ me: { hand: ["CP04-066"], field: ["CP04-065"], playPoints: 2 } }).play("CP04-066").engaged("CP04-066")).toBe(false);
    const t = d({ me: { field: ["CP04-066", "CP04-094"] }, opp: { field: ["V5"] } }).activate("CP04-066");
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[5, 2], 17]);
  });

  it("067 / 068 Mifuyu — 2 less with Overflow; Ward; evolved UB: destroy an enemy amulet", () => {
    expect(d({ me: { hand: ["CP04-067"], playPoints: 0, maxPlayPoints: 7 } }).canPlay("CP04-067")).toBe(true);
    expect(d({ me: { hand: ["CP04-067"], playPoints: 0, maxPlayPoints: 6 } }).canPlay("CP04-067")).toBe(false);
    expect(d({ me: { field: ["CP04-067"], evolveDeck: ["CP04-068"], playPoints: 1 }, opp: { field: ["AMULET"] } }).evolve("CP04-067").field("opp")).toEqual([]);
  });

  it("069 Kaori — Rush, Storm with another PriConne follower; UB Strike (2): 3 damage to the enemy leader", () => {
    expect([d({ me: { field: ["CP04-069", "CP04-001"] } }).keywords("CP04-069"), d({ me: { field: ["CP04-069"] } }).keywords("CP04-069")]).toEqual([
      ["rush", "storm"],
      ["rush"],
    ]);
    const t = d({ me: { field: ["CP04-069"], playPoints: 2 } }).attack("CP04-069", "opp:leader").yes();
    expect([t.leader("opp"), t.pp()]).toEqual([14, 0]);
  });

  it("070 Ayane — UB Strike: a follower it attacks goes into its owner's EX area; Rush with another Sarendia Orphanage follower", () => {
    const t = d({ me: { field: ["CP04-070"] }, opp: { field: [{ card: "V5", engaged: true }] } }).attack("CP04-070", "opp:V5");
    expect([t.field("opp"), t.ex("opp"), t.stats("CP04-070")]).toEqual([[], ["V5"], [3, 2]]);
    expect(d({ me: { field: ["CP04-070", "CP04-105"] } }).keywords("CP04-070")).toEqual(["rush"]);
  });

  it("071 Dragon's End Fist — 4 damage, 6 with a Dragon's Nest follower", () => {
    expect(d({ me: { hand: ["CP04-071"], playPoints: 2 }, opp: { field: ["V5"] } }).play("CP04-071").stats("opp:V5")).toEqual([5, 1]);
    expect(d({ me: { hand: ["CP04-071"], field: ["CP04-063"], playPoints: 2 }, opp: { field: ["V5"] } }).play("CP04-071").field("opp")).toEqual([]);
  });

  it("072 Prank Proclamation — Fanfare: each player draws; Last Words: 1 damage to each enemy leader", () => {
    const t = d({ me: { hand: ["CP04-072"], deck: ["V1"], playPoints: 1 }, opp: { deck: ["V3"] } }).play("CP04-072");
    expect([t.hand(), t.hand("opp")]).toEqual([["V1"], ["V3"]]);
    expect(d({ me: { field: ["CP04-067"], evolveDeck: ["CP04-068"], playPoints: 1 }, opp: { field: ["CP04-072"] } }).evolve("CP04-067").leader()).toBe(19);
  });
});
