import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP20 Dragoncraft (056–073, T05). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); KILL (1) destroys an enemy follower.
// Omen–Wyrmkin: BP20-062 (3c 3/4), BP20-064 (2c). Marine: BP20-060 (2c), BP20-072 (3c 2/2), BP20-071 (5c 1/5). Overflow: 7 max
// play points. Tokens: BP02-T05 Megalorca, BP20-T05 Crest: Galmieux.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };
const ORCA = "BP02-T05";

describe("BP20 Dragoncraft", () => {
  it("056 Galmieux, Ardor Manifest — Storm with Overflow; once on your turn, ability damage to it: 2 damage; Fanfare: a Crest: Galmieux", () => {
    expect(d({ me: { field: ["BP20-056"], maxPlayPoints: 7 } }).keywords("BP20-056")).toEqual(["storm"]);
    expect(d({ me: { field: ["BP20-056"], maxPlayPoints: 6 } }).keywords("BP20-056")).toEqual([]);
    const t = d({ me: { field: ["BP20-056", "BP20-070", "BP20-067"] }, opp: { field: ["V5"] } }).activate("BP20-070").pick("BP20-056").flush();
    expect(t.stats("opp:V5")).toEqual([5, 3]);
    t.activate("BP20-067").pick("BP20-056").flush();
    expect([t.stats("opp:V5"), t.stats("BP20-056")]).toEqual([[5, 3], [3, 1]]);
    expect(d({ me: { hand: ["BP20-056"], playPoints: 3 } }).play("BP20-056").ex()).toEqual(["BP20-T05"]);
  });

  it("057 / 058 Azurifrit, Heir to Disdain — Ward; ability damage on your turn: 1 to each enemy follower; Fanfare with another Omen card: 1 to each follower; super-evolved: defense 7", () => {
    const t = d({ me: { hand: ["BP20-057"], field: ["V1"], ex: ["BP20-T05"], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP20-057").none().flush();
    expect([t.stats("opp:V5"), t.stats("V1"), t.stats("BP20-057"), t.keywords("BP20-057")]).toEqual([[5, 3], [2, 1], [3, 4], ["ward"]]);
    expect(d({ me: { hand: ["BP20-057"], field: ["V1"], playPoints: 4 } }).play("BP20-057").none().stats("V1")).toEqual([2, 2]);
    const s = d({ me: { field: [{ card: "BP20-057", damage: 4 }], evolveDeck: ["BP20-058"], playPoints: 1, ...SUPER }, opp: { field: ["V5"] } });
    s.evolve("BP20-057", { sep: true }).flush();
    expect([s.stats("BP20-057"), s.leader("opp")]).toEqual([[5, 7], 16]);
  });

  it("059 Dagon, Lord of the Seas — 3 less from the EX area; Rush, Assail; damage over 3 becomes 3; Strike, twice per turn: refresh", () => {
    expect(d({ me: { ex: ["BP20-059"], playPoints: 7 } }).canPlay("BP20-059@ex")).toBe(true);
    expect(d({ me: { hand: ["BP20-059"], playPoints: 7 } }).canPlay("BP20-059")).toBe(false);
    expect(d({ me: { hand: ["BP20-073"], playPoints: 4 }, opp: { field: ["BP20-059"] } }).play("BP20-073").stats("opp:BP20-059")).toEqual([10, 7]);
    const t = d({ me: { field: ["BP20-059"] }, opp: { deck: ["V1"], leaderDefense: 40 } }).attack("BP20-059", "opp:leader");
    expect(t.engaged("BP20-059")).toBe(false);
    t.attack("BP20-059", "opp:leader");
    expect(t.engaged("BP20-059")).toBe(false);
    t.attack("BP20-059", "opp:leader");
    expect([t.engaged("BP20-059"), t.keywords("BP20-059")]).toEqual([true, ["rush", "assail"]]);
  });

  it("060 / 061 Spoiled Mermanager — Fanfare / evolved, discard a Marine card: a Marine card from the top 2 into the EX area, leader +1", () => {
    const t = d({ me: { hand: ["BP20-060", "BP20-072"], deck: ["V1", "BP20-071"], playPoints: 2 } }).play("BP20-060").yes().pick("BP20-071");
    expect([t.ex(), t.leader(), t.cemetery()]).toEqual([["BP20-071"], 21, ["BP20-072"]]);
    const e = d({ me: { field: ["BP20-060"], evolveDeck: ["BP20-061"], hand: ["BP20-072"], deck: ["BP20-071"], playPoints: 1 } }).evolve("BP20-060").yes().pick("BP20-071");
    expect([e.ex(), e.leader()]).toEqual([["BP20-071"], 21]);
  });

  it("062 Congregant of Disdain — once on your turn, ability damage to it: max play points +1; Fanfare with Overflow: 1 to each follower", () => {
    const t = d({ me: { hand: ["BP20-062"], maxPlayPoints: 7, playPoints: 3 }, opp: { field: ["V5"] } }).play("BP20-062").flush();
    expect([t.stats("opp:V5"), t.stats("BP20-062"), t.game.state.players[0].maxPlayPoints]).toEqual([[5, 4], [3, 3], 8]);
    expect(d({ me: { hand: ["BP20-062"], maxPlayPoints: 6, playPoints: 3 }, opp: { field: ["V5"] } }).play("BP20-062").stats("opp:V5")).toEqual([5, 5]);
  });

  it("063 Ferocious Flame — 1 to a follower of yours, 4 to an enemy follower, draw; max play points +1 with a Galmieux follower", () => {
    const t = d({ me: { hand: ["BP20-063"], field: ["BP20-056"], deck: ["V1"], maxPlayPoints: 5, playPoints: 2 }, opp: { field: ["V5"] } }).play("BP20-063").flush();
    // 4 from the spell and 2 from Galmieux's own trigger (it took ability damage): V5 is destroyed.
    expect([t.stats("BP20-056"), t.field("opp"), t.hand(), t.game.state.players[0].maxPlayPoints]).toEqual([[3, 2], [], ["V1"], 6]);
    expect(d({ me: { hand: ["BP20-063"] }, opp: { field: ["V5"] } }).canPlay("BP20-063")).toBe(false);
  });

  it("064 / 065 Supplicant of Disdain — Ward; Fanfare: a follower, with Overflow 1 damage and leader +2; evolved: 2 damage", () => {
    const t = d({ me: { hand: ["BP20-064"], maxPlayPoints: 7, playPoints: 2 }, opp: { field: ["V5"] } }).play("BP20-064").none().pick("opp:V5");
    expect([t.stats("opp:V5"), t.leader()]).toEqual([[5, 4], 22]);
    const no = d({ me: { hand: ["BP20-064"], maxPlayPoints: 6, playPoints: 2 }, opp: { field: ["V5"] } }).play("BP20-064").none().pick("opp:V5");
    expect([no.stats("opp:V5"), no.leader()]).toEqual([[5, 5], 20]);
    expect(d({ me: { field: ["BP20-064"], evolveDeck: ["BP20-065"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP20-064").stats("opp:V5")).toEqual([5, 3]);
  });

  it("066 Encounter from the Deep — a Marine follower from the top 5 onto the field, its defense in damage to each enemy follower", () => {
    const t = d({ me: { hand: ["BP20-066"], deck: ["V1", "BP20-071", "V3"], playPoints: 7 }, opp: { field: ["V5", "V3"] } }).play("BP20-066").pick("BP20-071").none().order().flush();
    expect([t.field(), t.field("opp")]).toEqual([["BP20-071"], []]);
  });

  it("067 Nation of Disdain — Fanfare: an Omen–Wyrmkin card from the top 2; act, engage and bury this: 1 damage to a follower of yours", () => {
    expect(d({ me: { hand: ["BP20-067"], deck: ["V1", "BP20-062"], playPoints: 1 } }).play("BP20-067").pick("BP20-062").hand()).toEqual(["BP20-062"]);
    expect(d({ me: { field: ["BP20-067", "V3"] } }).activate("BP20-067").stats("V3")).toEqual([3, 3]);
  });

  it("068 / 069 Snowstorm Dragonewt — Fanfare: 1 damage; evolved: destroy each enemy follower that took damage this turn", () => {
    const t = d({ me: { hand: ["BP20-068"], field: ["BP20-068"], evolveDeck: ["BP20-069"], playPoints: 6 }, opp: { field: ["V5", "V3"] } }).play("BP20-068").pick("opp:V5");
    t.evolve("BP20-068");
    expect(t.field("opp")).toEqual(["V3"]);
  });

  it("070 Devotee of Disdain — act (0), once per turn: 1 damage to a follower of yours", () => {
    const t = d({ me: { field: ["BP20-070", "V3"] } }).activate("BP20-070").pick("V3");
    expect([t.stats("V3"), t.canActivate("BP20-070")]).toEqual([[3, 3], false]);
  });

  it("071 Militant Mermaid — Ward; Fanfare, put a Marine card from your hand into the EX area: recover 3", () => {
    const t = d({ me: { hand: ["BP20-071", "BP20-072"], maxPlayPoints: 8, playPoints: 5 } }).play("BP20-071").none().yes();
    expect([t.ex(), t.pp()]).toEqual([["BP20-072"], 3]);
  });

  it("072 Ocean Rider — your Megalorcas have Ward; Fanfare: a Megalorca, 3 with Overflow", () => {
    const t = d({ me: { hand: ["BP20-072"], playPoints: 3 } }).play("BP20-072").none();
    expect([t.field(), t.keywords(ORCA)]).toEqual([["BP20-072", ORCA], ["ward"]]);
    expect(d({ me: { hand: ["BP20-072"], maxPlayPoints: 7, playPoints: 3 } }).play("BP20-072").none().field()).toEqual(["BP20-072", ORCA, ORCA, ORCA]);
  });

  it("073 Raging Lightning — Quick; 6 damage, and 3 to its leader if it had 3 defense or less", () => {
    expect(d({ me: { hand: ["BP20-073"], playPoints: 4 }, opp: { field: ["V3"] } }).play("BP20-073").leader("opp")).toBe(20);
    expect(d({ me: { hand: ["BP20-073"], playPoints: 4 }, opp: { field: [{ card: "V3", damage: 1 }] } }).play("BP20-073").leader("opp")).toBe(17);
  });

  it("T05 Crest: Galmieux, Ardor Manifest — act (0) in the EX area, once per turn: 1 damage to an Omen follower of yours", () => {
    const t = d({ me: { ex: ["BP20-T05"], field: ["BP20-062", "V3"] } }).activate("BP20-T05");
    expect([t.stats("BP20-062"), t.canActivate("BP20-T05")]).toEqual([[3, 3], false]);
  });
});
