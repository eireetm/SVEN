import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP12 Neutral (103–115). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); KILL a 1-cost spell; QUICK-SAC
// destroys one of your followers. BP11-046 Crystal Fencer draws and discards; BP12-014 is a Natura
// card, BP12-083 a Machina follower, BP11-109 a 2-cost Chef, BP01-171 a Goblin; BP10-T01 Exterminus
// Weapon (Last Words: 4 damage to each enemy leader). Tokens: BP07-T01 Assembly Droid, BP07-T02 Repair
// Mode, BP07-T03 Naterran Great Tree, BP11-T03 Dutiful Steed (Wasteland).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const DROID = "BP07-T01";
const REPAIR = "BP07-T02";
const TREE = "BP07-T03";

describe("BP12 Neutral", () => {
  it("103 Natur Al'machinus — discarded, engage a Tree: a Natura card from the cemetery; Fanfare a Machina card from the top 3, a Repair Mode, recover 3", () => {
    const t = d({ me: { hand: ["BP11-046", "BP12-103"], field: [TREE], cemetery: ["BP12-014"], deck: ["V1"], playPoints: 3 } });
    t.play("BP11-046").pick("BP12-103").yes();
    expect([t.hand(), t.engaged(TREE), t.cemetery()]).toEqual([["V1", "BP12-014"], true, ["BP12-103"]]);
    const fan = d({ me: { hand: ["BP12-103"], deck: ["V1", "BP12-083", "V5"], playPoints: 5, maxPlayPoints: 5 } }).play("BP12-103").pick("BP12-083").order();
    expect([fan.hand(), fan.ex(), fan.pp()]).toEqual([["BP12-083"], [REPAIR], 3]);
  });

  it("104 / 105 Changewing Cherub — a Repair Mode or a Tree into the EX area; evolved: 2 damage with 5 Machina or Natura cards on the field and in the EX area", () => {
    expect(d({ me: { hand: ["BP12-104"], playPoints: 1 } }).play("BP12-104").choose("tree").ex()).toEqual([TREE]);
    const evo = (ex: string[]) =>
      d({ me: { field: ["BP12-104", DROID, TREE], ex, evolveDeck: ["BP12-105"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP12-104");
    expect(evo([REPAIR, TREE]).stats("opp:V5")).toEqual([5, 3]);
    expect(evo([REPAIR]).stats("opp:V5")).toEqual([5, 5]);
  });

  it("106 Seraphic Blade — destroy an enemy card that costs 2 or less, or pay 2 for one that costs 6 or less", () => {
    expect(d({ me: { hand: ["BP12-106"], playPoints: 2 }, opp: { field: ["V1", "V5"] } }).play("BP12-106").choose("cheap").field("opp")).toEqual(["V5"]);
    const pay = d({ me: { hand: ["BP12-106"], playPoints: 4 }, opp: { field: ["V1", "V5"] } }).play("BP12-106").choose("pay").pick("opp:V5").yes();
    expect([pay.field("opp"), pay.pp()]).toEqual([["V1"], 0]);
  });

  it("107 Travelers' Respite — a Wasteland or Natura card from the top 3; leader +1 with a Wasteland card on the field or in the EX area", () => {
    const t = d({ me: { hand: ["BP12-107"], ex: ["BP11-T03"], deck: ["V1", "BP12-014", "V5"], playPoints: 1 } }).play("BP12-107").pick("BP12-014").order();
    expect([t.hand(), t.leader()]).toEqual([["BP12-014"], 21]);
    expect(d({ me: { hand: ["BP12-107"], deck: ["V1"], playPoints: 1 } }).play("BP12-107").leader()).toBe(20);
  });

  it("108 Romantic Chanteuse — Fanfare and (2): engage an enemy follower", () => {
    expect(d({ me: { hand: ["BP12-108"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP12-108").engaged("opp:V5")).toBe(true);
    expect(d({ me: { field: ["BP12-108"], playPoints: 2 }, opp: { field: ["V5"] } }).activate("BP12-108").engaged("opp:V5")).toBe(true);
  });

  it("109 Romantic Chanteuse (Evolved) — enemy followers deal no damage this turn, not even Last Words after they leave (ruling on BP10-T01)", () => {
    const t = d({ me: { field: ["BP12-108"], evolveDeck: ["BP12-109"], hand: ["KILL"], playPoints: 2 }, opp: { field: ["BP10-T01", { card: "V5", engaged: true }] } });
    t.evolve("BP12-108").play("KILL").pick("opp:BP10-T01");
    expect([t.field("opp"), t.leader()]).toEqual([["V5"], 20]);
    t.attack("BP12-108", "opp:V5");
    expect([t.stats("BP12-108"), t.stats("opp:V5")]).toEqual([[4, 4], [5, 1]]);
    // Without it, Exterminus Weapon's Last Words deal 4.
    expect(d({ me: { hand: ["KILL"], playPoints: 1 }, opp: { field: ["BP10-T01"] } }).play("KILL").leader()).toBe(16);
  });

  it("110 Giving Gourmet — Fanfare leader +3; Last Words: summon a Chef that costs 3 or less from the deck, or draw", () => {
    expect(d({ me: { hand: ["BP12-110"], playPoints: 4 } }).play("BP12-110").leader()).toBe(23);
    const chef = d({ me: { field: ["BP12-110"], hand: ["QUICK-SAC"], deck: ["V1", "BP11-109"] } }).play("QUICK-SAC").choose("chef").pick("BP11-109");
    expect(chef.field()).toEqual(["BP11-109"]);
    expect(d({ me: { field: ["BP12-110"], hand: ["QUICK-SAC"], deck: ["V1"] } }).play("QUICK-SAC").choose("draw").hand()).toEqual(["V1"]);
  });

  it("111 Goblin Warpack — only with 3 Goblinoid followers; destroys an enemy follower and 2 to its leader", () => {
    const goblins = ["BP01-171", "BP01-171", "BP01-171"];
    const t = d({ me: { hand: ["BP12-111"], field: goblins, playPoints: 2 }, opp: { field: ["V5"] } }).play("BP12-111");
    expect([t.field("opp"), t.leader("opp")]).toEqual([[], 18]);
    expect(d({ me: { hand: ["BP12-111"], field: goblins.slice(1), playPoints: 2 }, opp: { field: ["V5"] } }).canPlay("BP12-111")).toBe(false);
  });

  it("112 / 113 Plucky Treasure Hunter — evolved: discard a card, roll a die: 4 to 6 draws 3", () => {
    const rolls: number[] = [];
    for (const seed of ["a", "b", "c", "d", "e", "f", "g", "h"]) {
      const t = d({ seed, me: { field: ["BP12-112"], evolveDeck: ["BP12-113"], hand: ["V1"], deck: ["V1", "V3", "V5"], playPoints: 1 } }).evolve("BP12-112").yes();
      const roll = t.events.find((e) => e.type === "dieRolled");
      if (roll?.type !== "dieRolled") throw new Error("no die was rolled");
      rolls.push(roll.result);
      expect(t.hand().length).toBe(roll.result >= 4 ? 3 : 0);
    }
    expect(rolls.some((r) => r >= 4) && rolls.some((r) => r < 4)).toBe(true);
  });

  it("114 Wayfaring Illustrator — a follower with the selected enemy follower's cost from the deck into the EX area", () => {
    expect(d({ me: { hand: ["BP12-114"], deck: ["V1", "V3", "V5"], playPoints: 3 }, opp: { field: ["V3"] } }).play("BP12-114").pick("V3").ex()).toEqual(["V3"]);
  });

  it("115 We've Got a Case! — declare a name, reveal the top card: 2 cards if it has the name, else 1", () => {
    expect(d({ me: { hand: ["BP12-115"], deck: ["BP12-001", "V1"], playPoints: 2 } }).play("BP12-115").choose("Awakened Gaia").hand()).toEqual(["BP12-001", "V1"]);
    expect(d({ me: { hand: ["BP12-115"], deck: ["BP12-001", "V1"], playPoints: 2 } }).play("BP12-115").choose("Elven Pikeman").hand()).toEqual(["BP12-001"]);
    expect(d({ me: { hand: ["BP12-115"], deck: ["BP12-001", "V1"], playPoints: 2 } }).play("BP12-115").choose("(other name)").hand()).toEqual(["BP12-001"]);
  });
});
