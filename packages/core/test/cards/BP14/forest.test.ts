import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP14 Forestcraft (001–017). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral). Festive: BP14-008
// Elven Waitress (2), BP14-012 Karakuri Servant (2). Hunter: BP14-015 (2), BP14-016 (4), BP14-017 (spell).
// Tokens: BP05-T03 Puppet, BP01-T03 Fairy.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const PUPPET = "BP05-T03";
const FAIRY = "BP01-T03";
const n = (count: number, id = "V1") => Array<string>(count).fill(id);
const HUNTERS = ["BP14-015", "BP14-016", "BP14-017"];

describe("BP14 Forestcraft", () => {
  it("001 Hozumi — Fanfare: the next Festive card this turn costs 2 less", () => {
    const t = d({ me: { hand: ["BP14-001", "BP14-008", "V2"], playPoints: 3 } }).play("BP14-001");
    expect([t.canPlay("BP14-008"), t.canPlay("V2")]).toEqual([true, false]);
  });

  it("002 Hozumi (Evolved) — act (2), banish another Festive card: summon a follower (7 or less) from the deck, after 3 cards played, once per turn", () => {
    const spec = (played: number): DriveSpec => ({
      me: { field: [{ card: "BP14-001", evolvedInto: "BP14-002" }, "BP14-012", "BP14-008"], deck: ["V1", "V5", "BP14-003"], playPoints: 4, playedThisTurn: played },
    });
    const t = d(spec(3)).activate("BP14-001").pick("BP14-012").pick("V5");
    expect([t.field(), t.zone("me", "banished"), t.canActivate("BP14-001")]).toEqual([["BP14-001", "BP14-008", "V5"], ["BP14-012"], false]);
    expect(d(spec(2)).canActivate("BP14-001")).toBe(false);
  });

  it("003 Levon — act, engage: 4 damage, draw, and with 3 Hunter cards in the cemetery a Hunter follower (3 or less) from the hand", () => {
    const spec = (cemetery: string[]): DriveSpec => ({ me: { field: ["BP14-003"], hand: ["BP14-015", "V1"], cemetery, deck: ["V2"] }, opp: { field: ["V5"] } });
    const t = d(spec(HUNTERS)).activate("BP14-003").pick("BP14-015");
    expect([t.stats("opp:V5"), t.hand(), t.field(), t.engaged("BP14-003")]).toEqual([[5, 1], ["V1", "V2"], ["BP14-003", "BP14-015"], true]);
    expect(d(spec(HUNTERS.slice(1))).activate("BP14-003").hand()).toEqual(["BP14-015", "V1", "V2"]);
  });

  it("004 / 005 Bastion of Seasons — can't attack with 3 seasonal counters or less; end phase: +X/+X or X damage, and a counter; evolved: 4 damage", () => {
    expect(d({ me: { field: ["BP14-004"] }, opp: { field: [{ card: "V5", engaged: true }] } }).attackTargets("BP14-004")).toEqual([]);
    expect(d({ me: { field: [{ card: "BP14-004", counters: { seasonal: 4 } }] } }).attackTargets("BP14-004")).toEqual(["opp:leader"]);
    const t = d({ me: { field: ["BP14-004", "V1"], deck: n(2) }, opp: { field: ["V5"], deck: n(2) } }).end().pick("opp:V5").choose("damage");
    expect([t.stats("opp:V5"), t.counters("BP14-004", "seasonal")]).toEqual([[5, 3], 1]);
    const buff = d({ me: { field: ["BP14-004", "V1"], deck: n(2) }, opp: { field: ["V5"], deck: n(2) } }).end().pick("V1").choose("stats");
    expect(buff.stats("V1")).toEqual([4, 4]);
    const evo = d({ me: { field: ["BP14-004"], evolveDeck: ["BP14-005"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP14-004");
    expect([evo.stats("opp:V5"), evo.attackTargets("BP14-004")]).toEqual([[5, 1], []]);
  });

  it("006 Spirit of the Spring — end phase: discard a card to put the top card into the EX area; act once per turn: an EX card to the hand, a hand card into the EX area", () => {
    const t = d({ me: { field: ["BP14-006"], hand: ["V1"], deck: ["V3", "V5"] }, opp: { deck: n(2) } }).end().yes();
    expect([t.ex(), t.cemetery()]).toEqual([["V3"], ["V1"]]);
    const act = d({ me: { field: ["BP14-006"], ex: ["V3"], hand: ["V1"] } }).activate("BP14-006").pick("V1");
    expect([act.ex(), act.hand(), act.canActivate("BP14-006")]).toEqual([["V1"], ["V3"], false]);
    // With an empty hand, the returned card goes back (rulings).
    const empty = d({ me: { field: ["BP14-006"], ex: ["V3"] } }).activate("BP14-006");
    expect([empty.ex(), empty.hand()]).toEqual([["V3"], []]);
  });

  it("007 Illusions of Comfort — an enemy follower back to the hand, leader +1; 1 less from the EX area and 1 less with Hozumi", () => {
    const t = d({ me: { hand: ["BP14-007"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP14-007");
    expect([t.hand("opp"), t.field("opp"), t.leader()]).toEqual([["V5"], [], 21]);
    expect(d({ me: { ex: ["BP14-007"], field: ["BP14-001"], playPoints: 0 }, opp: { field: ["V5"] } }).canPlay("BP14-007@ex")).toBe(true);
    expect(d({ me: { hand: ["BP14-007"], field: ["BP14-001"], playPoints: 0 }, opp: { field: ["V5"] } }).canPlay("BP14-007")).toBe(false);
    expect(d({ me: { hand: ["BP14-007"], playPoints: 2 } }).canPlay("BP14-007")).toBe(false);
  });

  it("008 / 009 Elven Waitress — Fanfare: a hand card to the bottom of the deck for leader +2; evolved: a Festive card from the top 4 into the EX area", () => {
    const t = d({ me: { hand: ["BP14-008", "V1"], deck: ["V3"], playPoints: 2 } }).play("BP14-008").yes();
    expect([t.leader(), t.zone("me", "deck"), t.hand()]).toEqual([22, ["V3", "V1"], []]);
    const evo = d({ me: { field: ["BP14-008"], evolveDeck: ["BP14-009"], deck: ["V1", "BP14-012", "V2", "V3"], playPoints: 1 } });
    evo.evolve("BP14-008").pick("BP14-012").order();
    expect(evo.ex()).toEqual(["BP14-012"]);
  });

  it("010 Tinkering Shopkeeper — Fanfare: a Puppet into the EX area, then leader +1 with 3 EX cards (the Puppet counts)", () => {
    expect(d({ me: { hand: ["BP14-010"], ex: ["V1", "V2"], playPoints: 1 } }).play("BP14-010").leader()).toBe(21);
    const t = d({ me: { hand: ["BP14-010"], ex: ["V1"], playPoints: 1 } }).play("BP14-010");
    expect([t.ex(), t.leader()]).toEqual([["V1", PUPPET], 20]);
  });

  it("011 Craftsman's Pride — banish an EX card: 3 Puppets into the EX area", () => {
    const t = d({ me: { hand: ["BP14-011"], ex: ["V1"], playPoints: 1 } }).play("BP14-011");
    expect([t.ex(), t.zone("me", "banished")]).toEqual([[PUPPET, PUPPET, PUPPET], ["V1"]]);
    expect(d({ me: { hand: ["BP14-011"], playPoints: 1 } }).canPlay("BP14-011")).toBe(false);
  });

  it("012 / 013 Karakuri Servant — Fanfare: a Puppet; evolved: 2 damage, 3 with 3 EX cards", () => {
    expect(d({ me: { hand: ["BP14-012"], playPoints: 2 } }).play("BP14-012").ex()).toEqual([PUPPET]);
    const spec = (ex: number): DriveSpec => ({ me: { field: ["BP14-012"], evolveDeck: ["BP14-013"], ex: n(ex), playPoints: 1 }, opp: { field: ["V5"] } });
    expect([d(spec(3)).evolve("BP14-012").stats("opp:V5"), d(spec(2)).evolve("BP14-012").stats("opp:V5")]).toEqual([
      [5, 2],
      [5, 3],
    ]);
  });

  it("014 Fairylight Guide — Fanfare (1): with 3 EX cards, a card in the opponent's EX area becomes a Fairy", () => {
    const t = d({ me: { hand: ["BP14-014"], ex: n(3), playPoints: 3 }, opp: { ex: ["V5"] } }).play("BP14-014").yes();
    expect([t.ex("opp"), t.zone("opp", "banished"), t.pp()]).toEqual([[FAIRY], ["V5"], 0]);
    const few = d({ me: { hand: ["BP14-014"], ex: n(2), playPoints: 3 }, opp: { ex: ["V5"] } }).play("BP14-014").yes();
    expect([few.ex("opp"), few.pp()]).toEqual([["V5"], 0]);
  });

  it("015 Woodland Pest Control — Rush; Fanfare: +2 attack and Assail with 3 Hunter cards in the cemetery", () => {
    const t = d({ me: { hand: ["BP14-015"], cemetery: HUNTERS, playPoints: 2 } }).play("BP14-015");
    expect([t.stats("BP14-015"), t.keywords("BP14-015")]).toEqual([[4, 1], ["rush", "assail"]]);
    expect(d({ me: { hand: ["BP14-015"], cemetery: HUNTERS.slice(1), playPoints: 2 } }).play("BP14-015").stats("BP14-015")).toEqual([2, 1]);
  });

  it("016 Windswept Lancer — Assail; Strike: 3 to the enemy leader, +1/+1", () => {
    const t = d({ me: { field: ["BP14-016"] }, opp: { deck: n(1) } }).attack("BP14-016", "opp:leader");
    expect([t.leader("opp"), t.stats("BP14-016")]).toEqual([12, [5, 5]]);
  });

  it("017 Elven Craftsmanship — Quick; 3 damage, draw, discard", () => {
    const t = d({ me: { hand: ["BP14-017"], deck: ["V1"], playPoints: 2 }, opp: { field: ["V5"] } });
    expect(t.keywords("BP14-017")).toEqual(["quick"]);
    t.play("BP14-017");
    expect([t.stats("opp:V5"), t.hand(), t.cemetery()]).toEqual([[5, 2], [], ["V1", "BP14-017"]]);
  });
});
