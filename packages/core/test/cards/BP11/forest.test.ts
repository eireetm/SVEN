import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP11 Forestcraft (001–017). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); AMULET a 1-cost amulet;
// QUICK-SAC destroys one of your followers; BUFF-SOME gives up to 2 of your followers +1/+1. Tokens:
// BP01-T03 Fairy (Pixie), BP05-T03 Puppet, BP11-T03 Dutiful Steed / T04 Bullet Bike / T05 Arcane
// Personnel Carrier (Mounts).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const FAIRY = "BP01-T03";
const PUPPET = "BP05-T03";
const STEED = "BP11-T03";
const BIKE = "BP11-T04";
const CARRIER = "BP11-T05";

describe("BP11 Forestcraft", () => {
  it("001 Loxis — 3 times on each of your turns, playing an amulet recovers 1 play point; engage 3 amulets: draw", () => {
    const t = d({ me: { hand: ["AMULET", "AMULET", "AMULET", "AMULET"], field: ["BP11-001"], playPoints: 4 } });
    t.play("AMULET").play("AMULET").play("AMULET");
    expect(t.pp()).toBe(4);
    t.play("AMULET");
    expect(t.pp()).toBe(3);
    const act = d({ me: { field: ["BP11-001", "AMULET", "AMULET", "AMULET"], deck: ["V1"] } }).activate("BP11-001");
    expect([act.hand(), act.engaged("AMULET")]).toEqual([["V1"], true]);
  });

  it("002 Loxis (Evolved) — once a turn a Mount leaving the field gives the 3 Mount tokens in the EX area and leader +2; banish 3 amulets: choose one", () => {
    const loxis = { card: "BP11-001", evolvedInto: "BP11-002" };
    const t = d({ me: { field: [loxis, STEED, STEED] } }).activate(STEED);
    expect([t.ex(), t.leader()]).toEqual([[STEED, BIKE, CARRIER], 22]);
    t.activate(STEED);
    expect([t.ex(), t.leader()]).toEqual([[STEED, BIKE, CARRIER], 22]);
    // Without another follower of yours, (1) is the only performable option.
    const act = d({ me: { field: [loxis, "AMULET", "AMULET", "AMULET"] }, opp: { field: ["V5"] } }).activate("BP11-001");
    expect([act.field("opp"), act.field(), act.zone("me", "banished")]).toEqual([[], ["BP11-001"], ["AMULET", "AMULET", "AMULET"]]);
  });

  it("003 Shamu & Shama — Storm; Combo (5) Fanfare 3 damage; Strike with Combo (3) +1/+1", () => {
    const t = d({ me: { hand: ["BP11-003"], playedThisTurn: 4, playPoints: 1 }, opp: { field: ["V5"] } }).play("BP11-003");
    expect([t.stats("opp:V5"), t.keywords("BP11-003")]).toEqual([[5, 2], ["storm"]]);
    expect(d({ me: { hand: ["BP11-003"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP11-003").stats("opp:V5")).toEqual([5, 5]);
    const strike = d({ me: { field: ["BP11-003"], playedThisTurn: 3 } }).attack("BP11-003", "opp:leader");
    expect([strike.stats("BP11-003"), strike.leader("opp")]).toEqual([[2, 2], 18]);
  });

  it("004 / 005 Terrorformer — from the hand (2): into the EX area with the top card; in the EX area: banish 2 others for +2 attack and a draw; evolved: damage equal to its attack", () => {
    const hand = d({ me: { hand: ["BP11-004"], deck: ["V1", "V3"], playPoints: 2 } }).activate("BP11-004");
    expect([hand.ex(), hand.pp()]).toEqual([["BP11-004", "V1"], 0]);
    const ex = d({ me: { ex: ["BP11-004", "V1", "V3"], deck: ["V5"] } }).activate("BP11-004");
    expect([ex.stats("BP11-004"), ex.zone("me", "banished"), ex.hand(), ex.canActivate("BP11-004")]).toEqual([[2, 4], ["V1", "V3"], ["V5"], false]);
    const evo = d({ me: { field: ["BP11-004"], hand: ["BUFF-SOME"], evolveDeck: ["BP11-005"], playPoints: 1 }, opp: { field: ["V5"] } });
    evo.play("BUFF-SOME").pick("BP11-004").evolve("BP11-004");
    expect([evo.stats("opp:V5"), evo.keywords("BP11-004")]).toEqual([[5, 4], ["storm"]]);
  });

  it("006 Giant Pastures — a Bullet Bike and Carrier into the EX area, then damage to each enemy equal to the Mounts there", () => {
    const t = d({ me: { hand: ["BP11-006"], ex: [STEED], playPoints: 6 }, opp: { field: ["V5", "V3"] } }).play("BP11-006");
    expect([t.ex(), t.leader("opp"), t.stats("opp:V5"), t.stats("opp:V3")]).toEqual([[STEED, BIKE, CARRIER], 17, [5, 2], [3, 1]]);
  });

  it("007 Fairy Flowering — needs 4 Pixie tokens buried to be played", () => {
    expect(d({ me: { hand: ["BP11-007"], field: [FAIRY, FAIRY, FAIRY], playPoints: 2 } }).canPlay("BP11-007")).toBe(false);
    const t = d({ me: { hand: ["BP11-007"], field: [FAIRY, FAIRY, FAIRY, FAIRY], playPoints: 2 } }).play("BP11-007");
    expect([t.field(), t.cemetery()]).toEqual([[], ["BP11-007"]]);
  });

  it("008 / 009 Varmint Hunter — during your turn a Mount put into your EX area deals 3 damage; evolved: puts a Dutiful Steed there", () => {
    const t = d({ me: { field: ["BP11-008"], hand: ["BP11-105"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP11-105");
    expect(t.stats("opp:V5")).toEqual([5, 2]);
    const evo = d({ me: { field: ["BP11-008"], evolveDeck: ["BP11-009"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP11-008");
    expect([evo.ex(), evo.stats("opp:V5")]).toEqual([[STEED], [5, 2]]);
  });

  it("010 Stringmaster — (4): +2/+2 and a Puppet; a Puppet put onto your field puts 2 Puppets into the EX area once a turn", () => {
    const t = d({ me: { field: ["BP11-010"], playPoints: 8 } }).activate("BP11-010");
    expect([t.stats("BP11-010"), t.field(), t.ex()]).toEqual([[3, 3], ["BP11-010", PUPPET], [PUPPET, PUPPET]]);
    t.activate("BP11-010");
    expect(t.ex()).toEqual([PUPPET, PUPPET]);
  });

  it("011 Corrosive Thorns — Pixie tokens get \"engage: 3 damage and 1 to its leader\" this turn", () => {
    const t = d({ me: { hand: ["BP11-011"], field: [FAIRY, FAIRY], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP11-011").pick(FAIRY, FAIRY);
    t.activate(FAIRY);
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[5, 2], 19]);
  });

  it("012 / 013 Lookout Elf — look at the top card, may bottom it, 2 Fairies into the EX area; evolved: summon 2 Fairies", () => {
    const t = d({ me: { hand: ["BP11-012"], deck: ["V1", "V3"], playPoints: 3 } }).play("BP11-012").yes();
    expect([t.zone("me", "deck"), t.ex()]).toEqual([["V3", "V1"], [FAIRY, FAIRY]]);
    const evo = d({ me: { field: ["BP11-012"], evolveDeck: ["BP11-013"], playPoints: 1 } }).evolve("BP11-012");
    expect(evo.field()).toEqual(["BP11-012", FAIRY, FAIRY]);
  });

  it("014 Cactus Cowboy — a Dutiful Steed into the EX area; Last Words 3 damage with 3 Mounts on your field and EX area", () => {
    expect(d({ me: { hand: ["BP11-014"], playPoints: 1 } }).play("BP11-014").ex()).toEqual([STEED]);
    const lw = d({ me: { field: ["BP11-014", STEED], ex: [STEED, BIKE], hand: ["QUICK-SAC"] }, opp: { field: ["V5"] } }).play("QUICK-SAC");
    expect(lw.stats("opp:V5")).toEqual([5, 2]);
    const two = d({ me: { field: ["BP11-014", STEED], ex: [BIKE], hand: ["QUICK-SAC"] }, opp: { field: ["V5"] } }).play("QUICK-SAC");
    expect(two.stats("opp:V5")).toEqual([5, 5]);
  });

  it("015 Nature's Warden — Ward; search a Ward follower; Fanfare (5): may summon a Ward follower from the hand", () => {
    const t = d({ me: { hand: ["BP11-015", "WARD"], deck: ["V1", "WARD"], playPoints: 9 } }).play("BP11-015").none().pending().pick("WARD").yes().pick("WARD").none();
    expect([t.field(), t.hand(), t.keywords("BP11-015"), t.pp()]).toEqual([["BP11-015", "WARD"], ["WARD"], ["ward"], 0]);
  });

  it("016 Hornet Strike — 3 damage, or 5 with Combo (3)", () => {
    expect(d({ me: { hand: ["BP11-016"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP11-016").stats("opp:V5")).toEqual([5, 2]);
    const combo = d({ me: { hand: ["BP11-016"], playedThisTurn: 2, playPoints: 2 }, opp: { field: ["V5"] } }).play("BP11-016");
    expect(combo.field("opp")).toEqual([]);
  });

  it("017 Scavenge — a Puppetry card from the cemetery to the hand and a Puppet into the EX area; not playable without one", () => {
    const t = d({ me: { hand: ["BP11-017"], cemetery: ["BP11-010"], playPoints: 2 } }).play("BP11-017");
    expect([t.hand(), t.ex()]).toEqual([["BP11-010"], [PUPPET]]);
    expect(d({ me: { hand: ["BP11-017"], playPoints: 2 } }).canPlay("BP11-017")).toBe(false);
  });
});
