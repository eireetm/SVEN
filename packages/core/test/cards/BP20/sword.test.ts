import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP20 Swordcraft (019–036, T02). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); KILL (1) destroys an enemy follower;
// SWORD1 (1) is a Swordcraft follower. Loot tokens: BP15-T01 Gilded Blade (2: 2 damage to an enemy follower), BP15-T02 Gilded
// Goblet (2: leader +1), BP15-T03 Gilded Boots (2: a Thief follower gets Rush). Omen–Thief followers: BP20-019 (2), BP20-020
// (3), BP20-029 (2), BP20-023 (5). Officer followers: BP20-035 (1), BP20-034 (2). Crest: BP20-T02 Octrice.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const BLADE = "BP15-T01";
const GOBLET = "BP15-T02";
const BOOTS = "BP15-T03";
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };

describe("BP20 Swordcraft", () => {
  it("019 Octrice, Hollowness Manifest — playing or fusing a Loot card: Storm; Fanfare: a Crest: Octrice, or a Returning Slash from the deck", () => {
    expect(d({ me: { hand: ["BP20-019"], playPoints: 2 } }).play("BP20-019").choose("crest").ex()).toEqual(["BP20-T02"]);
    expect(d({ me: { hand: ["BP20-019"], deck: ["V1", "BP20-026"], playPoints: 2 } }).play("BP20-019").choose("search").pick("BP20-026").hand()).toEqual(["BP20-026"]);
    const played = d({ me: { field: ["BP20-019"], ex: [BLADE], playPoints: 2 }, opp: { field: ["V5"] } }).play(`${BLADE}@ex`).flush();
    expect(played.keywords("BP20-019")).toEqual(["storm"]);
    const fused = d({ me: { field: ["BP20-019"], hand: ["BP20-020"], ex: [BLADE] } }).activate("BP20-020@hand");
    expect(fused.keywords("BP20-019")).toEqual(["storm"]);
  });

  it("020 / 021 Sinciro, Heir to Usurpation — act in the hand, Fuse 1–2 Loot cards: that many fusion counters; Fanfare: draw with one, a Gilded Blade without; evolved: +2 ability damage per counter", () => {
    const t = d({ me: { hand: ["BP20-020"], ex: [BLADE, GOBLET], deck: ["V1"], playPoints: 3 } }).activate("BP20-020@hand").choose("2").pick(BLADE);
    expect([t.ex(), t.counters("BP20-020", "fusion"), t.cemetery()]).toEqual([["BP20-020"], 2, []]);
    t.play("BP20-020@ex");
    expect([t.hand(), t.ex()]).toEqual([["V1"], []]);
    expect(d({ me: { hand: ["BP20-020"], playPoints: 3 } }).play("BP20-020").ex()).toEqual([BLADE]);
    const e = d({ me: { field: [{ card: "BP20-020", counters: { fusion: 1 } }], evolveDeck: ["BP20-021"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP20-020");
    expect(e.field("opp")).toEqual([]);
    const s = d({ me: { field: [{ card: "BP20-020", counters: { fusion: 1 } }], evolveDeck: ["BP20-021"], playPoints: 1, ...SUPER }, opp: { field: ["V5", "V1"] } });
    s.evolve("BP20-020", { sep: true }).flush().pick("opp:V1").flush();
    expect([s.leader("opp"), s.field("opp"), s.stats("opp:V5")]).toEqual([17, ["V5"], [5, 2]]);
  });

  it("022 Aurelia, Glorious Saber — X less for your Swordcraft cards; Rush, Assail, Ward; Strike: draw", () => {
    expect(d({ me: { hand: ["BP20-022"], field: ["SWORD1", "BP20-035"], playPoints: 3 } }).canPlay("BP20-022")).toBe(true);
    expect(d({ me: { hand: ["BP20-022"], field: ["SWORD1", "V1"], playPoints: 3 } }).canPlay("BP20-022")).toBe(false);
    const t = d({ me: { field: ["BP20-022"], deck: ["V1"] }, opp: { field: [{ card: "V3", engaged: true }] } }).attack("BP20-022", "opp:V3");
    expect([t.keywords("BP20-022"), t.hand()]).toEqual([["rush", "assail", "ward"], ["V1"]]);
  });

  it("023 / 024 Congregant of Usurpation — evolved: 5 damage and the next Loot card 2 less; an enemy follower put into the cemetery: a Gilded Blade, Goblet or Boots", () => {
    const t = d({ me: { field: ["BP20-023"], evolveDeck: ["BP20-024"], ex: [GOBLET], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP20-023").choose("Gilded Boots");
    expect([t.field("opp"), t.ex()]).toEqual([[], [GOBLET, BOOTS]]);
    expect(t.canPlay(`${GOBLET}@ex`)).toBe(true);
  });

  it("025 Fearful Fighter — Intimidate; Fanfare: 6 damage divided; during your turn, an enemy follower it damaged this turn put into the cemetery: the top card into the EX area", () => {
    const t = d({ me: { hand: ["BP20-025", "KILL"], deck: ["V1", "V3", "V5"], playPoints: 6 }, opp: { field: ["V5", "V3"] } }).play("BP20-025");
    t.pick("opp:V5", "opp:V3").choose("2").flush();
    expect([t.field("opp"), t.ex(), t.keywords("BP20-025")]).toEqual([["V5"], ["V1"], ["intimidate"]]);
    t.play("KILL").flush();
    expect([t.field("opp"), t.ex()]).toEqual([[], ["V1", "V3"]]);
    const other = d({ me: { field: ["BP20-025"], hand: ["KILL"], deck: ["V1"] }, opp: { field: ["V5"] } }).play("KILL");
    expect(other.ex()).toEqual([]);
  });

  it("026 Returning Slash — 4 damage, a Gilded Blade with an Octrice follower; act in the hand, Fuse a Loot card: 1 less", () => {
    const t = d({ me: { hand: ["BP20-026"], field: ["BP20-019"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP20-026").flush();
    expect([t.stats("opp:V5"), t.ex()]).toEqual([[5, 1], [BLADE]]);
    const f = d({ me: { hand: ["BP20-026"], ex: [BLADE], playPoints: 1 }, opp: { field: ["V5"] } }).activate("BP20-026@hand");
    expect([f.ex(), f.canPlay("BP20-026@ex")]).toEqual([["BP20-026"], true]);
  });

  it("027 / 028 Peppy Scout — evolved: a 3-cost or less Officer follower from the deck; once per turn, an Officer follower put onto your field: draw", () => {
    const t = d({ me: { field: ["BP20-027"], evolveDeck: ["BP20-028"], deck: ["V1", "BP20-034"], playPoints: 1 } }).evolve("BP20-027").pick("BP20-034").flush();
    expect([t.field(), t.hand()]).toEqual([["BP20-027", "BP20-034"], ["V1"]]);
  });

  it("029 Supplicant of Usurpation — Fanfare: a Gilded Goblet; once per turn, playing or fusing a Loot card: leader +1", () => {
    expect(d({ me: { hand: ["BP20-029"], playPoints: 2 } }).play("BP20-029").ex()).toEqual([GOBLET]);
    const t = d({ me: { field: ["BP20-029"], ex: [BLADE, BLADE], playPoints: 4 }, opp: { field: ["V5", "V3"] } });
    t.play(`${BLADE}@ex`).pick("opp:V5").flush().play(`${BLADE}@ex`).pick("opp:V3").flush();
    expect(t.leader()).toBe(21);
  });

  it("030 Lair of Usurpation — act in the hand, Fuse 3 Loot cards: a fusion counter; act, remove it, engage and bury this: up to 3 Omen–Thief followers with different names, 8 or less in total", () => {
    const f = d({ me: { hand: ["BP20-030"], ex: [BLADE, GOBLET, BOOTS] } }).activate("BP20-030@hand").pick(BLADE).pick(GOBLET);
    expect([f.ex(), f.counters("BP20-030", "fusion")]).toEqual([["BP20-030"], 1]);
    const t = d({ me: { field: [{ card: "BP20-030", counters: { fusion: 1 } }], deck: ["BP20-019", "BP20-020", "BP20-023", "BP20-029", "V1"] } });
    t.activate("BP20-030").pick("BP20-019").pick("BP20-020").pick("BP20-029").flush();
    expect(t.field().sort()).toEqual(["BP20-019", "BP20-020", "BP20-029"]);
    expect(d({ me: { field: ["BP20-030"] } }).canActivate("BP20-030")).toBe(false);
  });

  it("031 / 032 Comrade of the Swordmaster — Fanfare: a 2-cost or less Officer follower into the EX area; evolved: 4 damage", () => {
    expect(d({ me: { hand: ["BP20-031"], deck: ["BP20-027", "BP20-035"], playPoints: 4 } }).play("BP20-031").pick("BP20-035").ex()).toEqual(["BP20-035"]);
    expect(d({ me: { field: ["BP20-031"], evolveDeck: ["BP20-032"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP20-031").stats("opp:V5")).toEqual([5, 1]);
  });

  it("033 Devotee of Usurpation — Rush; playing a Loot card: Assail; Last Words: a Gilded Goblet and Gilded Boots", () => {
    const t = d({ me: { field: ["BP20-033"], ex: [GOBLET], playPoints: 2 } }).play(`${GOBLET}@ex`).flush();
    expect(t.keywords("BP20-033")).toEqual(["rush", "assail"]);
    expect(d({ me: { field: ["BP20-033"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").ex()).toEqual([GOBLET, BOOTS]);
  });

  it("034 Mercurial Mercenary — Fanfare (2): another from the deck, each +1/+1; act, engage: damage for each on your field", () => {
    const t = d({ me: { hand: ["BP20-034"], deck: ["V1", "BP20-034"], playPoints: 4 } }).play("BP20-034").yes().pick("BP20-034").flush();
    expect([t.field(), t.stats("BP20-034")]).toEqual([["BP20-034", "BP20-034"], [3, 4]]);
    const act = d({ me: { field: ["BP20-034", "BP20-034"] }, opp: { field: ["V5"] } }).activate("BP20-034");
    expect(act.stats("opp:V5")).toEqual([5, 3]);
  });

  it("035 Palace Knight — Fanfare: a Steelclad Knight into the EX area", () => {
    expect(d({ me: { hand: ["BP20-035"], playPoints: 1 } }).play("BP20-035").ex()).toEqual(["BP01-T07"]);
  });

  it("036 Shield Bash — a follower of yours: Assail, no damage this turn", () => {
    const t = d({ me: { hand: ["BP20-036"], field: ["V1"], playPoints: 1 }, opp: { field: [{ card: "V5", engaged: true }] } }).play("BP20-036");
    t.attack("V1", "opp:V5");
    expect([t.keywords("V1"), t.stats("V1"), t.stats("opp:V5")]).toEqual([["assail"], [2, 2], [5, 3]]);
  });

  it("T02 Crest: Octrice, Hollowness Manifest — a reversal counter at your main phase and per Loot card played or fused; with 8: banish this, a Thief card from the deck", () => {
    const t = d({ me: { ex: [{ card: "BP20-T02", counters: { reversal: 6 } }, GOBLET], deck: ["V1", "BP20-019"], playPoints: 2 } });
    t.play(`${GOBLET}@ex`).flush();
    expect(t.counters("BP20-T02", "reversal")).toBe(7);
    const eight = d({ me: { ex: [{ card: "BP20-T02", counters: { reversal: 7 } }, GOBLET], deck: ["V1", "BP20-019"], playPoints: 2 } });
    eight.play(`${GOBLET}@ex`).flush().pick("BP20-019");
    expect([eight.ex(), eight.hand(), eight.zone("me", "banished")]).toEqual([[], ["BP20-019"], []]);
  });
});
