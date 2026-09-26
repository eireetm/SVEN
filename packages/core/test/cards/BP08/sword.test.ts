import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP08 Swordcraft (018–034). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). Swordcraft followers:
// BP08-019 Dionne (3), BP08-029 Phantom Assassin (1, Assassin), BP08-031 Wardog (2); BP08-021 Roland
// is a Commander card, BP08-024 Durandal an amulet.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const DURANDAL = "BP08-024";

describe("BP08 Swordcraft", () => {
  it("018 Aether — Fanfare searches a Commander or Officer card; end phase with 7 Swordcraft followers in the cemetery: your followers +1/+1", () => {
    const t = d({ me: { hand: ["BP08-018"], deck: ["V1", "BP08-021", "BP08-027"], playPoints: 3 } }).play("BP08-018").pick("BP08-027");
    expect(t.hand()).toEqual(["BP08-027"]);
    const seven = Array<string>(7).fill("BP08-019");
    const end = d({ me: { field: ["BP08-018", "V1"], cemetery: seven, deck: ["V3"] }, opp: { deck: ["V3"] } }).end();
    expect([end.stats("V1"), end.stats("BP08-018")]).toEqual([[3, 3], [3, 4]]);
    const six = d({ me: { field: ["BP08-018", "V1"], cemetery: seven.slice(1), deck: ["V3"] }, opp: { deck: ["V3"] } }).end();
    expect(six.stats("V1")).toEqual([2, 2]);
  });

  it("019 / 020 Dionne — Storm, Evolve (6); evolved: Strike refreshes it, twice per turn", () => {
    const t = d({ me: { hand: ["BP08-019"], playPoints: 3 } }).play("BP08-019").attack("BP08-019", "opp:leader");
    expect(t.leader("opp")).toBe(17);
    expect(d({ me: { field: ["BP08-019"], evolveDeck: ["BP08-020"], playPoints: 5 } }).canEvolve("BP08-019")).toBe(false);
    const evo = d({ me: { field: [{ card: "BP08-019", evolvedInto: "BP08-020" }] } });
    evo.attack("BP08-019", "opp:leader").attack("BP08-019", "opp:leader").attack("BP08-019", "opp:leader");
    expect([evo.leader("opp"), evo.engaged("BP08-019"), evo.keywords("BP08-019")]).toEqual([11, true, ["storm"]]);
  });

  it("021 Roland — Ward, Evolve (1); Fanfare: search a Durandal, or summon one from your hand", () => {
    const search = d({ me: { hand: ["BP08-021"], deck: ["V1", DURANDAL], playPoints: 4 } }).play("BP08-021").none();
    search.choose("search").pick(DURANDAL);
    expect([search.hand(), search.keywords("BP08-021")]).toEqual([[DURANDAL], ["ward"]]);
    const summon = d({ me: { hand: ["BP08-021", DURANDAL], playPoints: 4 } }).play("BP08-021").none();
    summon.choose("summon").pick(DURANDAL);
    expect([summon.field(), summon.hand()]).toEqual([["BP08-021", DURANDAL], []]);
  });

  it("022 Roland (Evolved) — On Evolve refreshes your amulets; end phase: leader +3, and a draw with a Durandal on your field", () => {
    const t = d({ me: { field: ["BP08-021", { card: DURANDAL, engaged: true }], evolveDeck: ["BP08-022"], deck: ["V1", "V3"], playPoints: 1 } });
    t.evolve("BP08-021");
    expect(t.engaged(DURANDAL)).toBe(false);
    t.end();
    expect([t.leader(), t.hand()]).toEqual([23, ["V1"]]);
    const alone = d({ me: { field: [{ card: "BP08-021", evolvedInto: "BP08-022" }], deck: ["V1", "V3"] }, opp: { deck: ["V3"] } }).end();
    expect([alone.leader(), alone.hand()]).toEqual([23, []]);
  });

  it("023 Swordflash Panther — Rush; Fanfare summons a Swordcraft follower that costs 2 or less from the cemetery with +1 attack", () => {
    const t = d({ me: { hand: ["BP08-023"], cemetery: ["BP08-031", "BP08-019", "V1"], playPoints: 4 } }).play("BP08-023");
    expect([t.field(), t.stats("BP08-031"), t.keywords("BP08-023")]).toEqual([["BP08-023", "BP08-031"], [4, 2], ["rush"]]);
  });

  it("024 Durandal — act: +1 attack, +1 defense, or each damage above 3 becomes 3 this turn and the next opponent turn", () => {
    const atk = d({ me: { field: [DURANDAL, "V1"] } }).activate(DURANDAL).choose("attack");
    expect([atk.stats("V1"), atk.engaged(DURANDAL)]).toEqual([[3, 2], true]);
    const def = d({ me: { field: [DURANDAL, "V1"] } }).activate(DURANDAL).choose("defense");
    expect(def.stats("V1")).toEqual([2, 3]);
    const cap = d({ me: { field: [DURANDAL, "V5"] }, opp: { field: [{ card: "V5", engaged: true }] } });
    cap.activate(DURANDAL).choose("cap").attack("V5", "opp:V5");
    expect([cap.stats("V5"), cap.field("opp")]).toEqual([[5, 2], []]);
  });

  it("025 / 026 Azord — Ward, Evolve (3); evolved summons up to 2 Swordcraft followers that cost 2 or less from the cemetery", () => {
    const t = d({ me: { field: ["BP08-025"], evolveDeck: ["BP08-026"], cemetery: ["BP08-029", "BP08-031", "BP08-019"], playPoints: 3 } });
    t.evolve("BP08-025").pick("BP08-029", "BP08-031").flush();
    // Wardog's Fanfare sees the Commander Azord.
    expect([t.field(), t.leader("opp"), t.keywords("BP08-025")]).toEqual([["BP08-025", "BP08-029", "BP08-031"], 18, ["ward"]]);
  });

  it("027 Madlance Centaur — Rush; Strike: 4 damage to an enemy follower", () => {
    const t = d({ me: { field: ["BP08-027"] }, opp: { field: ["V5"] } }).attack("BP08-027", "opp:leader");
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[5, 1], 15]);
  });

  it("028 Dance of Usurpation — 4 divided (at least 1 each), 8 with 10 opposing cemetery cards; with 20 also 8 to the enemy leader", () => {
    const four = d({ me: { hand: ["BP08-028"], playPoints: 4 }, opp: { field: ["V3", "V1"] } }).play("BP08-028").pick("opp:V3", "opp:V1");
    four.choose("2");
    expect([four.stats("opp:V3"), four.field("opp")]).toEqual([[3, 2], ["V3"]]);
    // 5 followers can't share 4 damage (ruling).
    const five = d({ me: { hand: ["BP08-028"], playPoints: 4 }, opp: { field: ["V1", "V1", "V1", "V1", "V1"] } }).play("BP08-028");
    expect(five.decision).toMatchObject({ type: "selectCards", min: 0, max: 4 });
    // 20 cards and no follower: select none (ruling).
    const twenty = d({ me: { hand: ["BP08-028"], playPoints: 4 }, opp: { cemetery: Array<string>(20).fill("V1") } }).play("BP08-028");
    expect(twenty.leader("opp")).toBe(12);
    const ten = d({ me: { hand: ["BP08-028"], playPoints: 4 }, opp: { field: ["V5", "V3"], cemetery: Array<string>(10).fill("V1") } });
    ten.play("BP08-028").pick("opp:V5", "opp:V3").choose("5");
    expect([ten.field("opp"), ten.stats("opp:V3"), ten.leader("opp")]).toEqual([["V3"], [3, 1], 20]);
  });

  it("029 Phantom Assassin — +1/+1 and Bane with 2 Assassin followers in the cemetery", () => {
    const t = d({ me: { hand: ["BP08-029"], cemetery: ["BP08-029", "BP08-029"], playPoints: 1 } }).play("BP08-029");
    expect([t.stats("BP08-029"), t.keywords("BP08-029")]).toEqual([[3, 3], ["bane"]]);
    const one = d({ me: { hand: ["BP08-029"], cemetery: ["BP08-029"], playPoints: 1 } }).play("BP08-029");
    expect([one.stats("BP08-029"), one.keywords("BP08-029")]).toEqual([[2, 2], []]);
  });

  it("030 Zealot of Usurpation — Rush; buries the opponent's top card, then with 10 in their cemetery your top card goes into the EX area", () => {
    const t = d({ me: { hand: ["BP08-030"], deck: ["V3"], playPoints: 2 }, opp: { deck: ["V1"], cemetery: Array<string>(9).fill("V1") } });
    t.play("BP08-030");
    expect([t.cemetery("opp").length, t.ex(), t.keywords("BP08-030")]).toEqual([10, ["V3"], ["rush"]]);
    // An empty deck buries nothing and doesn't lose the game (ruling).
    const empty = d({ me: { hand: ["BP08-030"], deck: ["V3"], playPoints: 2 } }).play("BP08-030");
    expect([empty.game.result, empty.ex()]).toEqual([null, []]);
  });

  it("031 Wardog — Fanfare: 2 damage to the enemy leader with a Commander card on your field", () => {
    expect(d({ me: { hand: ["BP08-031"], field: [DURANDAL], playPoints: 2 } }).play("BP08-031").leader("opp")).toBe(18);
    expect(d({ me: { hand: ["BP08-031"], field: ["V1"], playPoints: 2 } }).play("BP08-031").leader("opp")).toBe(20);
  });

  it("032 / 033 Mana Pistol Merc — Evolve (2), or (0) with a Commander card on your field; evolved deals 6", () => {
    expect(d({ me: { field: ["BP08-032"], evolveDeck: ["BP08-033"], playPoints: 1 } }).canEvolve("BP08-032")).toBe(false);
    const t = d({ me: { field: ["BP08-032", DURANDAL], evolveDeck: ["BP08-033"], playPoints: 0 }, opp: { field: ["V5"] } });
    t.evolve("BP08-032");
    expect([t.field("opp"), t.pp()]).toEqual([[], 0]);
  });

  it("034 Godsent Stride — your follower gets +3/+2 and Rush", () => {
    const t = d({ me: { hand: ["BP08-034"], field: ["V1"], playPoints: 2 } }).play("BP08-034");
    expect([t.stats("V1"), t.keywords("V1")]).toEqual([[5, 4], ["rush"]]);
  });
});
