import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// CP03 Forestcraft (001–021), Cardfight!! Vanguard (Aqua Force). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). CP03-127 is a
// Drive Point (what a Ride links). 1-cost Aqua Force followers: CP03-011 Theo (2/1), CP03-013 Cyprus (0/1, Storm), CP03-015
// Battleship Intelligence (1/1, Storm) — each can attack the enemy leader, for "the Nth Aqua Force attack this turn".
// QUICK-SAC (0) destroys a follower of yours. `universe: "vanguard"` makes drive checks resolve Triggers.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const DP = "CP03-127";
const threeAttacks = (t: ReturnType<typeof d>) =>
  t.attack("CP03-011", "opp:leader").attack("CP03-013", "opp:leader").attack("CP03-015", "opp:leader");

describe("CP03 Forestcraft", () => {
  it("001 / 002 Blue Storm Dragon, Maelstrom — the 4th Aqua Force attack evolves it into Glory Maelstrom; evolved: damage to the enemy leader destroys and draws 2", () => {
    const t = threeAttacks(d({ me: { field: ["CP03-011", "CP03-013", "CP03-015", "CP03-001"], evolveDeck: ["CP03-002"], deck: ["V1", "V1"] } }));
    t.attack("CP03-001", "opp:leader").flush().yes().flush();
    expect([t.stats("CP03-001"), t.keywords("CP03-001")]).toEqual([[4, 4], ["storm", "twinDrive"]]);
    const e = d({ me: { field: [{ card: "CP03-001", evolvedInto: "CP03-002" }], deck: ["V1", "V1", "V3"] }, opp: { field: ["V5"] } });
    e.attack("CP03-001", "opp:leader");
    expect([e.field("opp"), e.hand().length, e.leader("opp")]).toEqual([[], 2, 16]);
  });

  it("003 Storm Rider, Diamantes — Fanfare: engage an enemy follower; Last Words on your turn: up to two 1-cost Aqua Force followers from the top 5", () => {
    expect(d({ me: { hand: ["CP03-003"], playPoints: 3 }, opp: { field: ["V5"] } }).play("CP03-003").engaged("opp:V5")).toBe(true);
    const t = d({ me: { field: ["CP03-003"], hand: ["QUICK-SAC"], deck: ["CP03-011", "V1", "CP03-015", "CP03-013", "V3"] } }).play("QUICK-SAC");
    t.pick("CP03-011", "CP03-015").order();
    expect([t.field(), t.keywords("CP03-011")]).toEqual([["CP03-011", "CP03-015"], ["rush", "assail"]]);
  });

  it("004 Storm Rider, Basil — Fanfare, return a 1-cost Aqua Force follower: may summon an Aqua Force follower costing 3 or less from your hand", () => {
    const t = d({ me: { hand: ["CP03-004", "CP03-003"], field: ["CP03-015"], playPoints: 3 } }).play("CP03-004").yes().pick("CP03-003");
    expect([t.field(), t.hand()]).toEqual([["CP03-004", "CP03-003"], ["CP03-015"]]);
  });

  it("005 / 006 Algos — the 3rd Aqua Force attack: leader +2 and draw; evolved into Navalgazer: Twin Drive, may summon a 1-cost Aqua Force follower", () => {
    const t = threeAttacks(d({ me: { field: ["CP03-005", "CP03-011", "CP03-013", "CP03-015"], deck: ["V1"] } }));
    expect([t.leader(), t.hand()]).toEqual([22, ["V1"]]);
    const e = d({ me: { field: ["CP03-005"], evolveDeck: ["CP03-006"], hand: ["CP03-011", "V1"], playPoints: 1 } }).evolve("CP03-005").pick("CP03-011");
    expect([e.field(), e.keywords("CP03-005")]).toEqual([["CP03-005", "CP03-011"], ["twinDrive"]]);
  });

  it("007 Hydro Hurricane Dragon — 6 less after 3 Aqua Force attacks; Fanfare: destroy up to 2, 1 damage to the enemy leader each", () => {
    const t = d({ me: { field: ["CP03-011", "CP03-013", "CP03-015"], hand: ["CP03-007"], playPoints: 2 } });
    expect(t.canPlay("CP03-007")).toBe(false);
    expect(threeAttacks(t).canPlay("CP03-007")).toBe(true);
    const f = d({ me: { hand: ["CP03-007"], playPoints: 8 }, opp: { field: ["V1", "V5"] } }).play("CP03-007").pick("opp:V1", "opp:V5");
    expect([f.field("opp"), f.leader("opp")]).toEqual([[], 18]);
  });

  it("008 Benedict — Ride (1): +1/+1 and two 1-cost Aqua Force followers with different names from the deck", () => {
    const t = d({ me: { field: ["CP03-008"], evolveDeck: [DP], deck: ["CP03-011", "CP03-011", "CP03-015", "V1"], playPoints: 1 } }).activate("CP03-008");
    t.pick("CP03-011").pick("CP03-015");
    expect([t.stats("CP03-008"), t.hand().sort()]).toEqual([[4, 4], ["CP03-011", "CP03-015"]]);
  });

  it("009 Tear Knight, Valeria — Ride (1): +1/+1, Storm and a Strike dealing 2 damage on the 3rd Aqua Force attack", () => {
    const r = d({ me: { field: ["CP03-009"], evolveDeck: [DP], playPoints: 1 } }).activate("CP03-009");
    expect([r.stats("CP03-009"), [...r.keywords("CP03-009")].sort()]).toEqual([[2, 2], ["drive", "rush", "singleDrive", "storm"]]);
    const t = d({ me: { field: [{ card: "CP03-009", rode: true }, "CP03-011", "CP03-013"], deck: ["V1"] }, opp: { field: ["V5"] } });
    t.attack("CP03-011", "opp:leader").attack("CP03-013", "opp:leader").attack("CP03-009", "opp:leader").flush();
    expect(t.stats("opp:V5")).toEqual([5, 3]);
  });

  it("010 Tear Knight, Lazarus — no damage from enemy abilities", () => {
    expect(d({ me: { hand: ["CP03-075"], playPoints: 3 }, opp: { field: ["CP03-010"] } }).play("CP03-075").stats("opp:CP03-010")).toEqual([3, 2]);
  });

  it("011 Tear Knight, Theo — Fanfare with another Aqua Force follower: Rush and Assail", () => {
    expect(d({ me: { hand: ["CP03-011"], field: ["CP03-015"], playPoints: 1 } }).play("CP03-011").keywords("CP03-011")).toEqual(["rush", "assail"]);
    expect(d({ me: { hand: ["CP03-011"], playPoints: 1 } }).play("CP03-011").keywords("CP03-011")).toEqual([]);
  });

  it("012 Light Signals Penguin Soldier — Ride (1): +1/+1, may take the top card; a 1-cost Aqua Force follower gives the leader +2", () => {
    const t = d({ me: { field: ["CP03-012"], evolveDeck: [DP], deck: ["CP03-011"], playPoints: 1 } }).activate("CP03-012").pick("CP03-011");
    expect([t.stats("CP03-012"), t.hand(), t.leader()]).toEqual([[3, 3], ["CP03-011"], 22]);
  });

  it("013 Tear Knight, Cyprus — Storm; Last Words: another Cyprus from the deck", () => {
    expect(d({ me: { field: ["CP03-013"], hand: ["QUICK-SAC"], deck: ["V1", "CP03-013"] } }).play("QUICK-SAC").pick("CP03-013").hand()).toEqual(["CP03-013"]);
  });

  it("014 Emerald Shield, Paschal — Quick; 2 damage, or discard an Aqua Force card: 3 damage and a 1-cost Aqua Force follower from the top", () => {
    const t = d({ me: { hand: ["CP03-014", "CP03-015"], deck: ["CP03-011"], playPoints: 1 }, opp: { field: ["V5"] } }).play("CP03-014").choose("2");
    t.yes().pick("CP03-011");
    expect([t.stats("opp:V5"), t.hand(), t.cemetery().sort()]).toEqual([[5, 2], ["CP03-011"], ["CP03-014", "CP03-015"]]);
    expect(d({ me: { hand: ["CP03-014"], playPoints: 1 }, opp: { field: ["V5"] } }).play("CP03-014").choose("1").stats("opp:V5")).toEqual([5, 3]);
  });

  it("015 / 016 / 017 / 018 Trigger units — Storm; Fanfare draw; Fanfare engage or refresh; Ward and leader +2 after 3 Aqua Force attacks", () => {
    expect(d({ me: { field: ["CP03-015"] } }).keywords("CP03-015")).toEqual(["storm"]);
    expect(d({ me: { hand: ["CP03-016"], deck: ["V1"], playPoints: 2 } }).play("CP03-016").hand()).toEqual(["V1"]);
    expect(d({ me: { hand: ["CP03-017"], playPoints: 1 }, opp: { field: ["V5"] } }).play("CP03-017").pick("opp:V5").choose("engage").engaged("opp:V5")).toBe(true);
    const h = threeAttacks(d({ me: { field: ["CP03-018", "CP03-011", "CP03-013", "CP03-015"], deck: ["V1"] }, opp: { deck: ["V1"] } }));
    expect(h.end().leader()).toBe(22);
  });

  it("019 Coral Assault — Ride (1): 2 damage to up to 1 enemy follower, +1/+1; the 3rd Aqua Force attack: 2 damage", () => {
    const r = d({ me: { field: ["CP03-019"], evolveDeck: [DP], playPoints: 1 }, opp: { field: ["V5"] } }).activate("CP03-019").pick("opp:V5");
    expect([r.stats("opp:V5"), r.stats("CP03-019")]).toEqual([[5, 3], [3, 3]]);
    const t = d({ me: { field: ["CP03-019", "CP03-011", "CP03-013", "CP03-015"] }, opp: { field: ["V5"] } });
    threeAttacks(t);
    expect(t.stats("opp:V5")).toEqual([5, 3]);
  });

  it("020 Battle Siren, Cynthia — a 1-cost Aqua Force follower from your cemetery", () => {
    expect(d({ me: { hand: ["CP03-020"], cemetery: ["CP03-015", "V1"], playPoints: 1 } }).play("CP03-020").field()).toEqual(["CP03-015"]);
  });

  it("021 Officer Cadet, Erikk — Starting Amulet; act, engage and bury: Storm to a 1-cost Aqua Force follower", () => {
    const t = d({ me: { field: ["CP03-021", "CP03-011"] } });
    expect(t.keywords("CP03-021")).toEqual(["startingAmulet"]);
    t.activate("CP03-021");
    expect([t.keywords("CP03-011"), t.field()]).toEqual([["storm"], ["CP03-011"]]);
  });
});
