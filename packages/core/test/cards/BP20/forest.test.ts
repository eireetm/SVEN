import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP20 Forestcraft (001–018, T01). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); QUICK-SAC (0) destroys one of your
// followers. Omen–Hunter cards: BP20-008 (a 2-cost spell), BP20-015 (2c follower), BP20-007 (4c follower). Verdant: BP18-001
// Rolo Roné (4c, evolves into BP18-002, any number of Evolve per turn), BP03-009 Gerbera Bear (2c). Fae-Touched: BP20-013.
// Tokens: BP20-T01 Crest: Krulle, BP15-PR09 Annihilating Onslaught, BP01-T03 Fairy (1c 1/1 Pixie), BP01-T02 Fairy Wisp.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id: string) => Array<string>(count).fill(id);
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };
const HUNTERS = n(6, "BP20-015");

describe("BP20 Forestcraft", () => {
  it("001 Izudia, Annihilation Manifest — Fanfare: a 2-cost Omen–Hunter spell, an Annihilating Onslaught with 6 Hunter cards; act (0): the next Omen–Hunter card 2 less", () => {
    const t = d({ me: { hand: ["BP20-001"], deck: ["V1", "BP20-008"], cemetery: HUNTERS, playPoints: 4 } }).play("BP20-001").pick("BP20-008");
    expect([t.hand(), t.ex()]).toEqual([["BP20-008"], ["BP15-PR09"]]);
    expect(d({ me: { hand: ["BP20-001"], deck: ["BP20-008"], playPoints: 4 } }).play("BP20-001").pick("BP20-008").ex()).toEqual([]);
    const act = d({ me: { field: ["BP20-001", "BP20-001"], hand: ["BP20-007"], playPoints: 0 } }).activate("BP20-001").activate("BP20-001", 0);
    expect([act.canPlay("BP20-007"), act.canActivate("BP20-001")]).toEqual([true, false]);
  });

  it("002 / 003 Krulle, Heir to Unkilling — Fanfare with 6 Hunter cards: a Crest: Krulle and leader +2; evolved: -3/-3, super-evolved: -3/-3 to each", () => {
    const t = d({ me: { hand: ["BP20-002"], cemetery: HUNTERS, playPoints: 3 } }).play("BP20-002");
    expect([t.ex(), t.leader()]).toEqual([["BP20-T01"], 22]);
    expect(d({ me: { hand: ["BP20-002"], cemetery: n(5, "BP20-015"), playPoints: 3 } }).play("BP20-002").leader()).toBe(20);
    const e = d({ me: { field: ["BP20-002"], evolveDeck: ["BP20-003"], playPoints: 1 }, opp: { field: ["V5", "V3"] } }).evolve("BP20-002").pick("opp:V5");
    expect([e.stats("opp:V5"), e.stats("opp:V3")]).toEqual([[2, 2], [3, 4]]);
    const s = d({ me: { field: ["BP20-002"], evolveDeck: ["BP20-003"], playPoints: 1, ...SUPER }, opp: { field: ["V5", "V3"] } });
    s.evolve("BP20-002", { sep: true }).flush().pick("opp:V5").flush();
    expect([s.field("opp"), s.stats("opp:V3")]).toEqual([["V3"], [0, 1]]);
  });

  it("004 Plumeria, Serene Goddess — once per turn, a 5-cost or less Verdant follower of yours evolving gets Storm; Fanfare: draw with 3 Verdant cards in the cemetery", () => {
    const t = d({ me: { field: ["BP20-004", "BP18-001", "BP03-009"], evolveDeck: ["BP18-002", "BP03-010"], playPoints: 2 } }).evolve("BP18-001").flush();
    expect(t.keywords("BP18-001")).toContain("storm");
    t.evolve("BP03-009").flush();
    expect(t.keywords("BP03-009")).not.toContain("storm");
    expect(d({ me: { hand: ["BP20-004"], cemetery: n(3, "BP03-009"), deck: ["V1"], playPoints: 1 } }).play("BP20-004").hand()).toEqual(["V1"]);
    expect(d({ me: { hand: ["BP20-004"], cemetery: n(2, "BP03-009"), deck: ["V1"], playPoints: 1 } }).play("BP20-004").hand()).toEqual([]);
  });

  it("005 / 006 Windbloom Sylph — playing a Fae-Touched card: leader +1 (not itself); evolved: a Fae-Touched card not named Windbloom Sylph", () => {
    expect(d({ me: { field: ["BP20-005"], hand: ["BP20-013"], playPoints: 2 } }).play("BP20-013").flush().leader()).toBe(21);
    expect(d({ me: { hand: ["BP20-005"], playPoints: 2 } }).play("BP20-005").leader()).toBe(20);
    const e = d({ me: { field: ["BP20-005"], evolveDeck: ["BP20-006"], deck: ["BP20-005", "BP20-013"], playPoints: 1 } }).evolve("BP20-005").pick("BP20-013");
    expect(e.hand()).toEqual(["BP20-013"]);
  });

  it("007 Congregrant of Unkilling — Ward; Fanfare: a 3-cost or less Omen–Hunter follower from the deck onto the field", () => {
    const t = d({ me: { hand: ["BP20-007"], deck: ["BP20-001", "BP20-015"], playPoints: 4 } }).play("BP20-007").none().pick("BP20-015");
    expect([t.field(), t.keywords("BP20-007")]).toEqual([["BP20-007", "BP20-015"], ["ward"]]);
  });

  it("008 Eradicating Arrow — 2 damage to up to 2; with 6 Hunter cards 3 and 2 to each enemy leader, also with none selected", () => {
    const t = d({ me: { hand: ["BP20-008"], playPoints: 2 }, opp: { field: ["V5", "V3"] } }).play("BP20-008").pick("opp:V5", "opp:V3");
    expect([t.stats("opp:V5"), t.stats("opp:V3"), t.leader("opp")]).toEqual([[5, 3], [3, 2], 20]);
    const six = d({ me: { hand: ["BP20-008"], cemetery: HUNTERS, playPoints: 2 }, opp: { field: ["V5"] } }).play("BP20-008").pick("opp:V5");
    expect([six.stats("opp:V5"), six.leader("opp")]).toEqual([[5, 2], 18]);
    expect(d({ me: { hand: ["BP20-008"], cemetery: HUNTERS, playPoints: 2 } }).play("BP20-008").leader("opp")).toBe(18);
  });

  it("009 / 010 Supplicant of Unkilling — Fanfare: draw with an enemy follower at 1 defense; evolved: leader +2 with one", () => {
    expect(d({ me: { hand: ["BP20-009"], deck: ["V1"], playPoints: 1 }, opp: { field: [{ card: "V3", damage: 3 }] } }).play("BP20-009").hand()).toEqual(["V1"]);
    expect(d({ me: { hand: ["BP20-009"], deck: ["V1"], playPoints: 1 }, opp: { field: ["V3"] } }).play("BP20-009").hand()).toEqual([]);
    const e = d({ me: { field: ["BP20-009"], evolveDeck: ["BP20-010"], playPoints: 1 }, opp: { field: [{ card: "V1", damage: 1 }] } }).evolve("BP20-009");
    expect(e.leader()).toBe(22);
  });

  it("011 Greatwood Warrior — Fanfare: up to 2 Forestcraft spells with different names", () => {
    const t = d({ me: { hand: ["BP20-011"], deck: ["BP01-023", "BP01-023", "BP01-024", "V1"], playPoints: 4 } }).play("BP20-011").pick("BP01-023").pick("BP01-024");
    expect(t.hand()).toEqual(["BP01-023", "BP01-024"]);
  });

  it("012 Hamlet of Unkilling — Fanfare: an Omen–Hunter card from the top 2; act, engage and bury this with 3 Hunter cards: leader +1", () => {
    expect(d({ me: { hand: ["BP20-012"], deck: ["V1", "BP20-015", "V3"], playPoints: 1 } }).play("BP20-012").pick("BP20-015").hand()).toEqual(["BP20-015"]);
    const act = d({ me: { field: ["BP20-012"], cemetery: n(3, "BP20-015") } }).activate("BP20-012");
    expect([act.leader(), act.field()]).toEqual([21, []]);
    expect(d({ me: { field: ["BP20-012"], cemetery: n(2, "BP20-015") } }).canActivate("BP20-012")).toBe(false);
  });

  it("013 / 014 Bearer of the Fairy Blade — a Pixie token follower put onto your field: +1/+0; Fanfare: a Fairy into the EX area; evolved: 2 damage", () => {
    const t = d({ me: { hand: ["BP20-013"], playPoints: 3 } }).play("BP20-013");
    expect(t.ex()).toEqual(["BP01-T03"]);
    t.play("BP01-T03@ex");
    expect(t.stats("BP01-T03")).toEqual([2, 1]);
    expect(d({ me: { field: ["BP20-013"], evolveDeck: ["BP20-014"], playPoints: 1 }, opp: { field: ["V3"] } }).evolve("BP20-013").stats("opp:V3")).toEqual([3, 2]);
  });

  it("015 Devotee of Unkilling — Fanfare, discard an Omen–Hunter card: draw 2", () => {
    const t = d({ me: { hand: ["BP20-015", "BP20-008"], deck: ["V1", "V3"], playPoints: 2 } }).play("BP20-015").yes();
    expect([t.hand(), t.cemetery()]).toEqual([["V1", "V3"], ["BP20-008"]]);
  });

  it("016 Ageless Bystander — Fanfare: a Fairy Wisp into the EX area", () => {
    expect(d({ me: { hand: ["BP20-016"], playPoints: 2 } }).play("BP20-016").ex()).toEqual(["BP01-T02"]);
  });

  it("017 Cutie Cat — Storm; Strike: 4 damage", () => {
    expect(d({ me: { field: ["BP20-017"] }, opp: { field: ["V5"] } }).attack("BP20-017", "opp:leader").stats("opp:V5")).toEqual([5, 1]);
  });

  it("018 Bestial Swipe — 3 damage; discarding a Beast card as it's played: 5 damage and draw", () => {
    const t = d({ me: { hand: ["BP20-018", "BP20-017"], deck: ["V1"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP20-018").choose("beast");
    expect([t.field("opp"), t.hand(), t.cemetery()]).toEqual([[], ["V1"], ["BP20-017", "BP20-018"]]);
    const plain = d({ me: { hand: ["BP20-018", "BP20-017"], deck: ["V1"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP20-018").choose("normal");
    expect([plain.stats("opp:V5"), plain.hand()]).toEqual([[5, 2], ["BP20-017"]]);
  });

  it("T01 Crest: Krulle, Heir to Unkilling — act (0) in the EX area, once per turn: an enemy follower's defense becomes 1", () => {
    const t = d({ me: { ex: ["BP20-T01"] }, opp: { field: ["V5"] } }).activate("BP20-T01");
    expect([t.stats("opp:V5"), t.canActivate("BP20-T01")]).toEqual([[5, 1], false]);
  });
});
