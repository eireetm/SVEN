import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP01 Forestcraft (001–025) and its token Thorn Burst (T01).
// "V1".."V5" are vanilla test followers (cost N, V1 = 2/2, V2 = 2/3, V3 = 3/4, V5 = 5/5).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const FAIRY = "BP01-T03";

describe("BP01 Forestcraft", () => {
  it("001 Rose Queen — fanfare transforms chosen EX Pixies into Thorn Burst; act recovers X PP", () => {
    const t = d({ me: { hand: ["BP01-001"], ex: [FAIRY, FAIRY, "V1"], playPoints: 8, maxPlayPoints: 8 } });
    t.play("BP01-001").pick(FAIRY, FAIRY);
    expect(t.ex()).toEqual(["V1", "BP01-T01", "BP01-T01"]);
    t.activate("BP01-001"); // engage cost usable the turn it enters (CR 10.4.6.1)
    expect(t.pp()).toBe(2);
  });

  it("002 Ancient Elf — fanfare: may return another own card to hand for +1/+1", () => {
    const t = d({ me: { hand: ["BP01-002"], field: ["V1"], playPoints: 2 } });
    t.play("BP01-002").none().yes(); // Ward entry: stay reserved; pay the optional cost
    expect(t.hand()).toEqual(["V1"]);
    expect(t.stats("BP01-002")).toEqual([3, 3]);
    const alone = d({ me: { hand: ["BP01-002"], playPoints: 2 } }).play("BP01-002").none();
    expect(alone.decision?.type).toBe("mainPhase"); // nothing to return: ability not played
  });

  it("003 Ancient Elf (Evolved) — On Evolve: same optional return for +1/+1", () => {
    const t = d({ me: { field: ["BP01-002", "V1"], evolveDeck: ["BP01-003"], playPoints: 1 } });
    t.evolve("BP01-002").yes();
    expect(t.stats("BP01-002")).toEqual([4, 4]);
    expect(t.hand()).toEqual(["V1"]);
  });

  it("004 Rhinoceroach — Rush; fanfare +X attack for other cards played this turn", () => {
    const t = d({ me: { hand: ["V1", "V1", "BP01-004"], playPoints: 4 }, opp: { field: [{ card: "V5", engaged: true }] } });
    t.play("V1").play("V1").play("BP01-004");
    expect(t.stats("BP01-004")).toEqual([3, 1]);
    expect(t.attackTargets("BP01-004")).toEqual(["V5"]); // Rush: followers only
  });

  it("005 Rhinoceroach (Evolved) — choose Storm, or X = attack damage (only if a target exists)", () => {
    const t = d({ me: { field: [{ card: "BP01-004", damage: 0 }], evolveDeck: ["BP01-005"] }, opp: { field: ["V3"] } });
    t.evolve("BP01-004").choose("2");
    expect(t.stats("opp:V3")).toEqual([3, 3]);
    const noTarget = d({ me: { field: ["BP01-004"], evolveDeck: ["BP01-005"] } }).evolve("BP01-004");
    expect(noTarget.keywords("BP01-004")).toContain("storm"); // only (1) was performable
  });

  it("006 Robin Hood — fanfare and act deal 4 to an enemy follower", () => {
    const t = d({ me: { hand: ["BP01-006"], playPoints: 6 }, opp: { field: ["V5", "V3"] } });
    t.play("BP01-006").pick("opp:V5");
    expect(t.stats("opp:V5")).toEqual([5, 1]);
    t.activate("BP01-006").pick("opp:V3");
    expect(t.field("opp")).toEqual(["V5"]);
    expect(t.pp()).toBe(0);
  });

  it("007 Silver Bolt — draw, then damage equal to hand size", () => {
    const t = d({ me: { hand: ["BP01-007", "V1", "V1"], deck: ["V2"], playPoints: 7 } });
    t.play("BP01-007"); // the enemy leader is the only target
    expect(t.leader("opp")).toBe(17);
  });

  it("008 Homecoming — the opponent puts the follower on top or bottom; Combo (5) all of them", () => {
    const t = d({ me: { hand: ["BP01-008"], playPoints: 3 }, opp: { field: ["V2"], deck: ["V5"] } });
    t.play("BP01-008").none(); // opponent keeps nothing on top -> bottom
    expect(t.zone("opp", "deck")).toEqual(["V5", "V2"]);

    const combo = d({
      me: { hand: ["V1", "V1", "V1", "V1", "BP01-008"], playPoints: 7 },
      opp: { field: ["V2", "BP01-T04", "V3"], deck: ["V5"] },
    });
    combo.play("V1").play("V1").play("V1").play("V1").play("BP01-008").pick("opp:V2");
    combo.pick("opp:V2", "opp:V3").order("opp:V3"); // opponent: V2 and V3 on top (V3 topmost), the token to the bottom
    expect(combo.field("opp")).toEqual([]);
    expect(combo.zone("opp", "deck")).toEqual(["V3", "V2", "V5"]); // the token was removed (CR 9.1.4)
  });

  it("010 Elven Princess Mage (Evolved) — On Evolve: 2 Fairy Wisps into the EX area", () => {
    const t = d({ me: { field: ["BP01-009"], evolveDeck: ["BP01-010"], playPoints: 1 } }).evolve("BP01-009");
    expect(t.ex()).toEqual(["BP01-T02", "BP01-T02"]);
  });

  it("011 Blessed Fairy Dancer — +1/+1 to other Pixies on field and in EX; kept when played", () => {
    const t = d({ me: { hand: ["BP01-011"], field: [FAIRY, "V1"], ex: [FAIRY], playPoints: 3 } });
    t.play("BP01-011");
    expect(t.stats(FAIRY)).toEqual([2, 2]);
    expect(t.stats(`${FAIRY}@ex`)).toEqual([2, 2]);
    expect(t.stats("V1")).toEqual([2, 2]);
    expect(t.stats("BP01-011")).toEqual([2, 3]);
    t.play(`${FAIRY}@ex`);
    expect(t.ids(`${FAIRY}@field`).map((id) => t.game.reader().info(id).attack)).toEqual([2, 2]); // CR 4.8.3.3
  });

  it("012 Elf Child May / 015 Nature's Guidance — 1 damage on fanfare and when returned to hand", () => {
    const t = d({ me: { hand: ["BP01-012", "BP01-015"], deck: ["V1"], playPoints: 2 }, opp: { field: ["V2"] } });
    t.play("BP01-012");
    expect(t.stats("opp:V2")).toEqual([2, 2]);
    t.play("BP01-015"); // Elf Child May is the only card on my field
    expect(t.hand()).toEqual(["BP01-012", "V1"]);
    expect(t.stats("opp:V2")).toEqual([2, 1]);
  });

  it("013 Fairy Beast — banish an EX Pixie: leader +3, draw; once per turn", () => {
    const t = d({ me: { field: ["BP01-013"], ex: [FAIRY, FAIRY], deck: ["V1"] } });
    t.activate("BP01-013").pick(FAIRY);
    expect(t.leader()).toBe(23);
    expect(t.hand()).toEqual(["V1"]);
    expect(t.ex()).toEqual([FAIRY]);
    expect(t.canActivate("BP01-013")).toBe(false);
  });

  it("014 Noble Fairy — Combo (3): destroy an enemy follower, its controller gets a Fairy", () => {
    const t = d({ me: { hand: ["V1", "V1", "BP01-014"], playPoints: 5 }, opp: { field: ["V5"] } });
    t.play("V1").play("V1").play("BP01-014").none();
    expect(t.field("opp")).toEqual([FAIRY]);
    const noCombo = d({ me: { hand: ["BP01-014"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP01-014").none();
    expect(noCombo.field("opp")).toEqual(["V5"]);
  });

  it("016 Harvest Festival — act: pay 1, engage, bury: leader +1; leaving the field draws", () => {
    const t = d({ me: { field: ["BP01-016"], deck: ["V1"], playPoints: 1 } });
    t.activate("BP01-016");
    expect(t.leader()).toBe(21);
    expect(t.hand()).toEqual(["V1"]);
    expect(t.cemetery()).toEqual(["BP01-016"]);
  });

  it("017 Elf Metallurgist — 1 damage, Combo (3) 3 damage", () => {
    const t = d({ me: { hand: ["BP01-017"], playPoints: 2 }, opp: { field: ["V3"] } }).play("BP01-017");
    expect(t.stats("opp:V3")).toEqual([3, 3]);
    const combo = d({ me: { hand: ["V1", "V1", "BP01-017"], playPoints: 4 }, opp: { field: ["V3"] } });
    combo.play("V1").play("V1").play("BP01-017");
    expect(combo.stats("opp:V3")).toEqual([3, 1]);
  });

  it("018 / 019 Archer — 1 damage per other follower entering; evolved: up to 2 targets", () => {
    const t = d({ me: { field: ["BP01-018"], hand: ["V1"], playPoints: 1 }, opp: { field: ["V2"] } }).play("V1");
    expect(t.stats("opp:V2")).toEqual([2, 2]);
    const evo = d({
      me: { field: [{ card: "BP01-018", evolvedInto: "BP01-019" }], hand: ["V1"], playPoints: 1 },
      opp: { field: ["V2", "V3"] },
    });
    evo.play("V1").pick("opp:V2", "opp:V3");
    expect([evo.stats("opp:V2"), evo.stats("opp:V3")]).toEqual([
      [2, 2],
      [3, 3],
    ]);
  });

  it("020 Fairy Whisperer / 021 Okami — Fairy to field and EX; Okami +1/+1 per entering follower", () => {
    const t = d({ me: { hand: ["BP01-020"], field: ["BP01-021"], playPoints: 2 } }).play("BP01-020").pending("BP01-020").flush();
    expect(t.field()).toEqual(["BP01-021", "BP01-020", FAIRY]);
    expect(t.ex()).toEqual([FAIRY]);
    expect(t.stats("BP01-021")).toEqual([7, 7]);
  });

  it("022 Mana Elk — a Pixie attacking deals 1 to an enemy leader or follower", () => {
    const t = d({ me: { field: ["BP01-022", FAIRY] }, opp: { field: ["V2"] } });
    t.attack(FAIRY, "opp:leader").pick("opp:V2");
    expect(t.stats("opp:V2")).toEqual([2, 2]);
    expect(t.leader("opp")).toBe(19);
  });

  it("023 Fairy Circle — 3 Fairies into the EX area, as many as fit", () => {
    const t = d({ me: { hand: ["BP01-023"], ex: ["V1", "V1", "V1"], playPoints: 1 } }).play("BP01-023");
    expect(t.ex()).toEqual(["V1", "V1", "V1", FAIRY, FAIRY]);
  });

  it("024 Woodkin Curse — the follower cannot deal damage this turn (Quick)", () => {
    const t = d({ me: { field: ["V5"] }, opp: { hand: ["BP01-024"], playPoints: 2 } });
    t.attack("V5", "opp:leader").quick("opp:BP01-024");
    expect(t.leader("opp")).toBe(20);
  });

  it("025 Woodland Refuge — fanfare +1 attack to a Pixie; act returns it to hand", () => {
    const t = d({ me: { hand: ["BP01-025"], field: [FAIRY], playPoints: 2 } }).play("BP01-025");
    expect(t.stats(FAIRY)).toEqual([2, 1]);
    t.activate("BP01-025");
    expect(t.hand()).toEqual(["BP01-025"]);
  });

  it("T01 Thorn Burst — 3 damage to an enemy leader or follower and draw", () => {
    const t = d({ me: { ex: ["BP01-T01"], deck: ["V1"], playPoints: 2 } });
    t.play("BP01-T01");
    expect(t.leader("opp")).toBe(17);
    expect(t.hand()).toEqual(["V1"]);
  });
});
