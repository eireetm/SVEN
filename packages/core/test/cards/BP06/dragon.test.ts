import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP06 Dragoncraft (054–072). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5; QUICK-SAC destroys a follower of
// yours (0). BP06-063 is a 2-cost Dragoncraft follower; BP01-T11 Dragon and BP02-T05 Megalorca are
// tokens.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);

describe("BP06 Dragoncraft", () => {
  it("054 / 055 Garyu — draw; other Dragoncraft followers have Ward; evolved: summon a Dragoncraft follower from hand", () => {
    const t = d({ me: { hand: ["BP06-054"], field: ["BP06-063", "V1"], deck: ["V3"], playPoints: 5 } }).play("BP06-054");
    expect([t.hand(), t.keywords("BP06-063"), t.keywords("V1"), t.keywords("BP06-054")]).toEqual([["V3"], ["ward"], [], []]);
    const evo = d({ me: { field: ["BP06-054"], evolveDeck: ["BP06-055"], hand: ["BP06-063", "V1"], playPoints: 1 } });
    evo.evolve("BP06-054").pick("BP06-063").none();
    expect([evo.field(), evo.hand()]).toEqual([["BP06-054", "BP06-063"], ["V1"]]);
  });

  it("056 / 057 Filene / Chloe — engage an enemy follower (no refresh next time); with Overflow, a Whitefrost Whisper into the EX area", () => {
    for (const card of ["BP06-056", "BP06-057"]) {
      const t = d({ me: { hand: [card], deck: ["V1", "BP06-061"], playPoints: 7 }, opp: { field: ["V5"] } }).play(card).flush().pick("BP06-061");
      expect([t.engaged("opp:V5"), t.ex()]).toEqual([true, ["BP06-061"]]);
    }
  });

  it("058 Phoenix Empress — Rush; Last Words: lower your max PP by 1 to come back engaged", () => {
    const t = d({ me: { field: ["BP06-058"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").yes();
    expect([t.field(), t.engaged("BP06-058"), t.game.state.players[0].maxPlayPoints, t.pp()]).toEqual([["BP06-058"], true, 2, 2]);
  });

  it("059 / 060 Wyrm God of the Skies — only from hand; from the EX area: pay 2 for +4/+4 (no attacking); evolved: leader +3, back to the EX area", () => {
    const t = d({ me: { field: ["BP06-059"], evolveDeck: ["BP06-060"], hand: ["QUICK-SAC"], playPoints: 1 } }).evolve("BP06-059");
    expect(t.leader()).toBe(23);
    t.play("QUICK-SAC");
    expect([t.ex(), t.zone("me", "evolveDeck").length]).toEqual([["BP06-059"], 1]);
  });

  it("061 / 062 Whitefrost Whisper / I'll Clean You Up♡ — 1 less with Overflow; destroy an engaged follower; 2 to its leader with Filene", () => {
    for (const card of ["BP06-061", "BP06-062"]) {
      const t = d({ me: { hand: [card], field: ["BP06-056"] }, opp: { field: [{ card: "V5", engaged: true }, "V3"] } }).play(card);
      expect([t.field("opp"), t.leader("opp")]).toEqual([["V3"], 18]);
    }
    const plain = d({ me: { hand: ["BP06-061"], playPoints: 1, maxPlayPoints: 7 }, opp: { field: [{ card: "V5", engaged: true }] } });
    expect(plain.play("BP06-061").leader("opp")).toBe(20);
    expect(d({ me: { hand: ["BP06-061"] }, opp: { field: ["V5"] } }).canPlay("BP06-061")).toBe(false);
  });

  it("063 / 064 Ice Dancing Dragonewt — with Overflow +1/+0 and Storm; evolved ignores Ward", () => {
    const t = d({ me: { hand: ["BP06-063"], playPoints: 7 } }).play("BP06-063");
    expect([t.stats("BP06-063"), t.keywords("BP06-063")]).toEqual([[3, 2], ["storm"]]);
    const evo = d({ me: { field: [{ card: "BP06-063", evolvedInto: "BP06-064" }] }, opp: { field: [{ card: "WARD", engaged: true }] } });
    expect(evo.attackTargets("BP06-063")).toEqual(["WARD", "opp:leader"]);
  });

  it("065 Jadelong Tactician — Storm; Strike: another follower +1/+1, Garyu +2/+2", () => {
    // Garyu gives it Ward, so it may enter engaged: stay reserved.
    const t = d({ me: { hand: ["BP06-065"], field: ["BP06-054", "V1"], playPoints: 5 } }).play("BP06-065").none();
    t.attack("BP06-065", "opp:leader").pick("BP06-054");
    expect(t.stats("BP06-054")).toEqual([5, 6]);
  });

  it("066 Aquascale Stalwart — Ward; with Overflow, a Dragoncraft follower costing 5 or more from the top 5", () => {
    const t = d({ me: { hand: ["BP06-066"], deck: ["V5", "BP06-054", "V1"], playPoints: 7 } }).play("BP06-066").none().pick("BP06-054").order();
    expect(t.hand()).toEqual(["BP06-054"]);
    const low = d({ me: { hand: ["BP06-066"], deck: ["BP06-054"] } }).play("BP06-066").none();
    expect(low.hand()).toEqual([]);
  });

  it("067 Swordwhip Dragoon — 2 damage divided between up to 2 enemy followers; 4 with Overflow", () => {
    const t = d({ me: { hand: ["BP06-067"] }, opp: { field: ["V1", "V3"] } }).play("BP06-067").pick("opp:V1", "opp:V3");
    expect([t.stats("opp:V1"), t.stats("opp:V3")]).toEqual([[2, 1], [3, 3]]);
    const big = d({ me: { hand: ["BP06-067"], playPoints: 7 }, opp: { field: ["V1", "V3"] } }).play("BP06-067").pick("opp:V1", "opp:V3");
    big.choose("2");
    expect([big.field("opp"), big.stats("opp:V3")]).toEqual([["V3"], [3, 2]]);
  });

  it("068 / 069 Dragonblader — each player puts a Dragon into their EX area; evolved banishes a card in an EX area", () => {
    const t = d({ me: { hand: ["BP06-068"], playPoints: 4 } }).play("BP06-068");
    expect([t.ex(), t.ex("opp")]).toEqual([["BP01-T11"], ["BP01-T11"]]);
    const evo = d({ me: { field: ["BP06-068"], evolveDeck: ["BP06-069"], ex: ["V1"], playPoints: 1 }, opp: { ex: ["V3"] } });
    evo.evolve("BP06-068").pick("opp:V3");
    expect([evo.ex("opp"), evo.zone("opp", "banished")]).toEqual([[], ["V3"]]);
  });

  it("070 Trident Merman — 2 Megalorca", () => {
    expect(d({ me: { hand: ["BP06-070"], playPoints: 5 } }).play("BP06-070").field()).toEqual(["BP06-070", "BP02-T05", "BP02-T05"]);
  });

  it("071 Dragon Chef — leader +2, or +4 with an amulet on your field", () => {
    expect(d({ me: { hand: ["BP06-071"] } }).play("BP06-071").leader()).toBe(22);
    expect(d({ me: { hand: ["BP06-071"], field: ["AMULET"] } }).play("BP06-071").leader()).toBe(24);
  });

  it("072 Flamewinged Might — a follower of yours +2/+0", () => {
    expect(d({ me: { hand: ["BP06-072"], field: ["V1"] } }).play("BP06-072").stats("V1")).toEqual([4, 2]);
  });
});
