import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP17 Swordcraft (019–036). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). Natura spells: BP17-048 (1), BP17-117 (1),
// BP17-007 (2); Natura followers: BP17-009 (2), BP17-020 (4). Assassins: BP17-019, BP17-022 Leod, BP17-035. Tokens:
// BP01-T07 Steelclad Knight, BP02-T02 Shield Guardian (Ward), BP01-T05 Knight, BP07-T03 Naterran Great Tree.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const STEELCLAD = "BP01-T07";
const SHIELD = "BP02-T02";
const KNIGHT = "BP01-T05";
const TREE = "BP07-T03";
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };
const n = (count: number, id = "V1") => Array<string>(count).fill(id);

describe("BP17 Swordcraft", () => {
  it("019 Erika, Loyal Swordsavant — Storm; Fanfare: a Steelclad Knight, Shield Guardian or Knight; Strike: +2 attack with 5 Swordcraft cards on your field", () => {
    expect(d({ me: { hand: ["BP17-019"], playPoints: 2 } }).play("BP17-019").choose("Knight").field()).toEqual(["BP17-019", KNIGHT]);
    expect(d({ me: { field: ["BP17-019", "BP17-022", "BP17-027", "BP17-031", "BP17-033"] } }).attack("BP17-019", "opp:leader").leader("opp")).toBe(17);
    expect(d({ me: { field: ["BP17-019", "BP17-022", "BP17-027", "BP17-031", "V1"] } }).attack("BP17-019", "opp:leader").leader("opp")).toBe(19);
  });

  it("020 / 021 Mistolina & Bayleon — Fanfare: may put a Naterran Great Tree onto the field or into the EX area; evolved: up to 2 Natura spells (total 2 or less) into the EX area costing 0; super-evolved: Storm, recover 2", () => {
    expect(d({ me: { hand: ["BP17-020"], playPoints: 4 } }).play("BP17-020").choose("ex").ex()).toEqual([TREE]);
    const t = d({ me: { field: ["BP17-020"], evolveDeck: ["BP17-021"], deck: ["BP17-007", "BP17-117", "BP17-048", "V1"], playPoints: 1 } });
    t.evolve("BP17-020").pick("BP17-117").pick("BP17-048");
    expect([t.ex(), t.canPlay("BP17-117@ex"), t.canPlay("BP17-048@ex")]).toEqual([["BP17-117", "BP17-048"], true, true]);
    const s = d({ me: { field: ["BP17-020"], evolveDeck: ["BP17-021"], deck: ["V1"], playPoints: 1, ...SUPER } }).evolve("BP17-020", { sep: true }).flush();
    expect([s.keywords("BP17-020"), s.pp()]).toEqual([["storm"], 2]);
  });

  it("022 Leod, Moonlit Executioner — Intimidate; Fanfare: 1 damage, 3 when not from the hand", () => {
    expect(d({ me: { hand: ["BP17-022"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP17-022").stats("opp:V5")).toEqual([5, 4]);
    const ex = d({ me: { ex: ["BP17-022"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP17-022@ex");
    expect([ex.stats("opp:V5"), ex.keywords("BP17-022")]).toEqual([[5, 2], ["intimidate"]]);
  });

  it("023 / 024 Frenzied Corpsmaster — 6 less with 3 differently named Officer tokens; Ward; from the hand, (1) and discard it: an Officer token; evolved: destroy up to 2", () => {
    expect(d({ me: { hand: ["BP17-023"], field: [STEELCLAD, SHIELD, KNIGHT], playPoints: 2 } }).canPlay("BP17-023")).toBe(true);
    expect(d({ me: { hand: ["BP17-023"], field: [STEELCLAD, KNIGHT, KNIGHT], playPoints: 2 } }).canPlay("BP17-023")).toBe(false);
    const act = d({ me: { hand: ["BP17-023"], playPoints: 1 } }).activate("BP17-023@hand").choose("Knight");
    expect([act.field(), act.cemetery()]).toEqual([[KNIGHT], ["BP17-023"]]);
    const evo = d({ me: { field: ["BP17-023"], evolveDeck: ["BP17-024"], playPoints: 1 }, opp: { field: ["V5", "V3", "V1"] } }).evolve("BP17-023").pick("opp:V5", "opp:V3");
    expect([evo.field("opp"), evo.keywords("BP17-023")]).toEqual([["V1"], ["ward"]]);
  });

  it("025 Sunny Day Encounter — a Natura follower (3 or less) from the deck, or (3): one (6 or less)", () => {
    expect(d({ me: { hand: ["BP17-025"], deck: ["V1", "BP17-009"], playPoints: 3 } }).play("BP17-025").choose("small").pick("BP17-009").field()).toEqual(["BP17-009"]);
    const big = d({ me: { hand: ["BP17-025"], deck: ["V1", "BP17-020"], playPoints: 6 } }).play("BP17-025").choose("big").yes().pick("BP17-020").choose("none");
    expect([big.field(), big.pp()]).toEqual([["BP17-020"], 0]);
  });

  it("026 Killer Instincts — Fanfare: destroy an enemy follower; act (2), engage and bury it: an Erika from the deck", () => {
    expect(d({ me: { hand: ["BP17-026"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP17-026").field("opp")).toEqual([]);
    const t = d({ me: { field: ["BP17-026"], deck: ["V1", "BP17-019"], playPoints: 2 } }).activate("BP17-026").pick("BP17-019").choose("Knight");
    expect([t.field(), t.cemetery()]).toEqual([["BP17-019", KNIGHT], ["BP17-026"]]);
  });

  it("027 / 028 Valhorean Dealer — Fanfare: draw; evolve for (1) with 8 cards in hand; evolved: 5 damage", () => {
    expect(d({ me: { hand: ["BP17-027"], deck: ["V1"], playPoints: 3 } }).play("BP17-027").hand()).toEqual(["V1"]);
    const t = d({ me: { field: ["BP17-027"], evolveDeck: ["BP17-028"], hand: n(8), playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP17-027");
    expect([t.field("opp"), t.pp()]).toEqual([[], 0]);
    expect(d({ me: { field: ["BP17-027"], evolveDeck: ["BP17-028"], hand: n(7), playPoints: 1 } }).canEvolve("BP17-027")).toBe(false);
  });

  it("029 Bladerights Lieutenant — Fanfare: a Shield Guardian and a Knight, a Steelclad Knight into the EX area", () => {
    const t = d({ me: { hand: ["BP17-029"], playPoints: 2 } }).play("BP17-029").none();
    expect([t.field(), t.ex()]).toEqual([["BP17-029", SHIELD, KNIGHT], [STEELCLAD]]);
  });

  it("030 Shadowed Memories — an Assassin follower of yours into the EX area; 2 less when a Leod follower is selected", () => {
    const t = d({ me: { hand: ["BP17-030"], field: ["BP17-022"], playPoints: 0 } }).play("BP17-030");
    expect([t.field(), t.ex()]).toEqual([[], ["BP17-022"]]);
    expect(d({ me: { hand: ["BP17-030"], field: ["BP17-035"], playPoints: 1 } }).canPlay("BP17-030")).toBe(false);
    const other = d({ me: { hand: ["BP17-030"], field: ["BP17-022", "BP17-035"], playPoints: 2 } }).play("BP17-030").choose("other");
    expect([other.ex(), other.pp()]).toEqual([["BP17-035"], 0]);
  });

  it("031 / 032 Fox Lancer — Fanfare: may put a Naterran Great Tree onto the field or into the EX area; evolved: 2 damage", () => {
    expect(d({ me: { hand: ["BP17-031"], playPoints: 2 } }).play("BP17-031").choose("field").field()).toEqual(["BP17-031", TREE]);
    expect(d({ me: { field: ["BP17-031"], evolveDeck: ["BP17-032"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP17-031").stats("opp:V5")).toEqual([5, 3]);
  });

  it("033 Stone Merchant — Fanfare, discard a Swordcraft card: draw, 2 for a spell", () => {
    expect(d({ me: { hand: ["BP17-033", "BP17-030"], deck: ["V1", "V3"], playPoints: 2 } }).play("BP17-033").yes().hand()).toEqual(["V1", "V3"]);
    expect(d({ me: { hand: ["BP17-033", "BP17-022"], deck: ["V1", "V3"], playPoints: 2 } }).play("BP17-033").yes().hand()).toEqual(["V1"]);
  });

  it("034 Victorious Grappler — Strike: 3 damage to an enemy follower and its leader", () => {
    const t = d({ me: { field: ["BP17-034"] }, opp: { field: ["V5"] } }).attack("BP17-034", "opp:leader");
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[5, 2], 12]);
  });

  it("035 Countersolari Survivor — Intimidate; Fanfare: another Assassin card from the cemetery into the EX area", () => {
    const t = d({ me: { hand: ["BP17-035"], cemetery: ["BP17-022", "BP17-035"], playPoints: 3 } }).play("BP17-035");
    expect([t.ex(), t.keywords("BP17-035")]).toEqual([["BP17-022"], ["intimidate"]]);
  });

  it("036 Brothers United — +1/+1 to a Bayleon follower, then may put a Naterran Great Tree onto the field or into the EX area", () => {
    const t = d({ me: { hand: ["BP17-036"], field: ["BP17-020"], playPoints: 1 } }).play("BP17-036").choose("ex");
    expect([t.stats("BP17-020"), t.ex()]).toEqual([[4, 5], [TREE]]);
    expect(d({ me: { hand: ["BP17-036"], field: ["V1"], playPoints: 1 } }).canPlay("BP17-036")).toBe(false);
  });
});
