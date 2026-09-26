import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP19 Dragoncraft (056–073). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); QUICK-SAC (0) destroys one of your followers.
// Condemned Dragonewts: BP19-064 (2), BP19-066 (1); Draconic Duelists: BP18-058, BP18-060; BP19-068 is a Marine follower;
// BP19-073 a Marine spell (2, 1 less from the EX area). Token: BP02-T05 Megalorca.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const ORCA = "BP02-T05";

describe("BP19 Dragoncraft", () => {
  it("056 Antemaria, Huntress Convict — not from the EX area; Fanfare, bury 2 Condemned cards from the EX area: Storm and Drain; Last Words: into the EX area", () => {
    expect(d({ me: { ex: ["BP19-056"], playPoints: 6 } }).canPlay("BP19-056@ex")).toBe(false);
    const t = d({ me: { hand: ["BP19-056"], ex: ["BP19-064", "BP19-066"], playPoints: 6 } }).play("BP19-056").yes();
    expect([t.keywords("BP19-056"), t.ex()]).toEqual([["storm", "drain"], []]);
    expect(d({ me: { field: ["BP19-056"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").ex()).toEqual(["BP19-056"]);
  });

  it("057 / 058 Drazael, Ravening Enforcer — Ward; can't be destroyed by abilities; Last Words: into the EX area; evolved, bury 2 Condemned cards: -5/-5 to each enemy follower, leader +5", () => {
    expect(d({ me: { field: ["BP19-057"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").field()).toEqual(["BP19-057"]);
    const fight = d({ me: { field: ["BP19-057"] }, opp: { field: [{ card: "V5", engaged: true }] } }).attack("BP19-057", "opp:V5");
    expect([fight.ex(), fight.stats("opp:V5")]).toEqual([["BP19-057"], [5, 1]]);
    const e = d({ me: { field: ["BP19-057"], evolveDeck: ["BP19-058"], ex: ["BP19-064", "BP19-066"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP19-057").yes();
    expect([e.field("opp"), e.leader()]).toEqual([[], 25]);
  });

  it("059 Masamune, One-Eyed Dragon — Assail, Bane; Fanfare: Storm with 3 Draconic Duelist cards", () => {
    expect(d({ me: { hand: ["BP19-059"], field: ["BP18-058", "BP18-060"], playPoints: 2 } }).play("BP19-059").keywords("BP19-059")).toEqual(["assail", "bane", "storm"]);
    expect(d({ me: { hand: ["BP19-059"], field: ["BP18-058"], playPoints: 2 } }).play("BP19-059").keywords("BP19-059")).toEqual(["assail", "bane"]);
  });

  it("060 / 061 Scorched-Earth Tyrant — Fanfare, bury a Condemned card from the EX area: 4 damage; evolved: 4 damage; Last Words: into the EX area", () => {
    const t = d({ me: { hand: ["BP19-060"], ex: ["BP19-064"], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP19-060").yes();
    expect([t.stats("opp:V5"), t.cemetery()]).toEqual([[5, 1], ["BP19-064"]]);
    expect(d({ me: { field: ["BP19-060"], evolveDeck: ["BP19-061"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP19-060").stats("opp:V5")).toEqual([5, 1]);
    expect(d({ me: { field: [{ card: "BP19-060", evolvedInto: "BP19-061" }], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").ex()).toEqual(["BP19-060"]);
  });

  it("062 Neptune, Arbiter of Tides — a Megalorca entering: Storm, leader +1; Fanfare: a Megalorca into the EX area, one more with Overflow; act (0): the next Marine card from the EX area 1 less", () => {
    const t = d({ me: { hand: ["BP19-062"], maxPlayPoints: 7, playPoints: 3 } }).play("BP19-062").flush();
    expect([t.ex(), t.field(), t.keywords(ORCA), t.leader()]).toEqual([[ORCA], ["BP19-062", ORCA], ["storm"], 21]);
    const act = d({ me: { field: ["BP19-062"], ex: ["BP19-073"], playPoints: 0 } }).activate("BP19-062");
    expect([act.canPlay("BP19-073@ex"), act.canActivate("BP19-062")]).toEqual([true, false]);
  });

  it("063 Warden of the Adamant Claw — not from the EX area; Ward; Fanfare: a Condemned card from the top 4; Last Words: into the EX area", () => {
    expect(d({ me: { hand: ["BP19-063"], deck: ["V1", "BP19-066", "V3"], playPoints: 1 } }).play("BP19-063").none().pick("BP19-066").order().hand()).toEqual(["BP19-066"]);
    expect(d({ me: { field: ["BP19-063"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").ex()).toEqual(["BP19-063"]);
    expect(d({ me: { ex: ["BP19-063"], playPoints: 1 } }).canPlay("BP19-063@ex")).toBe(false);
  });

  it("064 / 065 Hotheaded Marauder — not from the EX area; Last Words: into the EX area; evolved: a 1-cost Condemned follower from the deck", () => {
    const e = d({ me: { field: ["BP19-064"], evolveDeck: ["BP19-065"], deck: ["V1", "BP19-066"], playPoints: 1 } }).evolve("BP19-064").pick("BP19-066");
    expect(e.field()).toEqual(["BP19-064", "BP19-066"]);
    expect(d({ me: { field: ["BP19-064"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").ex()).toEqual(["BP19-064"]);
  });

  it("066 Razor-Clawed Thief — not from the EX area; Rush, Assail; Last Words: into the EX area", () => {
    expect(d({ me: { ex: ["BP19-066"], playPoints: 1 } }).canPlay("BP19-066@ex")).toBe(false);
    expect(d({ me: { field: ["BP19-066"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").ex()).toEqual(["BP19-066"]);
  });

  it("067 Seasoned Merman — your Megalorcas have Rush and Assail; Fanfare: 2 Megalorcas, the top card into the EX area", () => {
    const t = d({ me: { hand: ["BP19-067"], deck: ["V1"], playPoints: 4 } }).play("BP19-067");
    expect([t.field(), t.keywords(ORCA), t.ex()]).toEqual([["BP19-067", ORCA, ORCA], ["rush", "assail"], ["V1"]]);
  });

  it("068 / 069 Dancing Crab — Intimidate; Strike: -1/-1; evolved: engage an enemy follower", () => {
    expect(d({ me: { field: ["BP19-068"] }, opp: { field: ["V5"] } }).attack("BP19-068", "opp:leader").stats("opp:V5")).toEqual([4, 4]);
    expect(d({ me: { field: ["BP19-068"], evolveDeck: ["BP19-069"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP19-068").engaged("opp:V5")).toBe(true);
  });

  it("070 Mermaid Songstress — Fanfare, discard a Marine card: the top card into the EX area, leader +2 with 2 cards there", () => {
    const t = d({ me: { hand: ["BP19-070", "BP19-068"], ex: ["V3"], deck: ["V1"], playPoints: 1 } }).play("BP19-070").yes();
    expect([t.ex(), t.leader()]).toEqual([["V3", "V1"], 22]);
  });

  it("071 Dark Mermaid — Fanfare: destroy, the top card into the EX area", () => {
    const t = d({ me: { hand: ["BP19-071"], deck: ["V1"], playPoints: 6 }, opp: { field: ["V5"] } }).play("BP19-071");
    expect([t.field("opp"), t.ex()]).toEqual([[], ["V1"]]);
  });

  it("072 Dragonewt's Might — 6 damage to up to 2; may discard a card, 2 to the enemy leader for a Dragonewt follower", () => {
    const t = d({ me: { hand: ["BP19-072", "BP19-064"], playPoints: 4 }, opp: { field: ["V5", "V3"] } }).play("BP19-072").pick("opp:V5", "opp:V3").pick("BP19-064");
    expect([t.field("opp"), t.leader("opp")]).toEqual([[], 18]);
    expect(d({ me: { hand: ["BP19-072", "V1"], playPoints: 4 } }).play("BP19-072").pick("V1").leader("opp")).toBe(20);
  });

  it("073 Call of the Megalorca — 1 less from the EX area; a Megalorca, draw, another with Overflow", () => {
    const t = d({ me: { ex: ["BP19-073"], deck: ["V1"], playPoints: 1 } }).play("BP19-073@ex");
    expect([t.field(), t.hand()]).toEqual([[ORCA], ["V1"]]);
    expect(d({ me: { hand: ["BP19-073"], deck: ["V1"], maxPlayPoints: 7, playPoints: 2 } }).play("BP19-073").field()).toEqual([ORCA, ORCA]);
  });
});
