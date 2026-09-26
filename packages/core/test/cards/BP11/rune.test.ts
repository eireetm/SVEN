import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP11 Runecraft (035–051). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral); KILL a 1-cost
// spell; BUFF-SOME gives up to 2 of your followers +1/+1; WARD 2c 1/3 with Ward. BP01-T10 Magic
// Sediment (Stack); BP07-047 a 1-cost Golem; tokens BP11-T03 Dutiful Steed, T04 Bullet Bike, T05
// Arcane Personnel Carrier. COSTS are cards with twelve different base costs (0–11).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const SEDIMENT = "BP01-T10";
const STEED = "BP11-T03";
const BIKE = "BP11-T04";
const CARRIER = "BP11-T05";
const COSTS = ["BP04-056", "V1", "V2", "V3", "BP01-021", "V5", "BP01-091", "BP01-007", "BP01-001", "BP01-061", "BP01-154", "BP12-001"];

describe("BP11 Runecraft", () => {
  it("035 / 036 Vincent — buries a Wasteland card from the deck; evolves only after gaining attack or defense this turn; evolved: 3/6/9/12 different base costs in the cemetery", () => {
    const t = d({ me: { hand: ["BP11-035"], deck: ["V1", "BP11-019"], playPoints: 5 } }).play("BP11-035").pick("BP11-019");
    expect(t.cemetery()).toEqual(["BP11-019"]);
    const evo = d({ me: { field: ["BP11-035"], hand: ["BUFF-SOME"], evolveDeck: ["BP11-036"], cemetery: COSTS.slice(0, 5), deck: ["V1"], playPoints: 1 } });
    expect(evo.canEvolve("BP11-035")).toBe(false);
    evo.play("BUFF-SOME").pick("BP11-035").evolve("BP11-035");
    expect([evo.leader(), evo.hand()]).toEqual([23, []]);
    const all = d({ me: { field: ["BP11-035"], hand: ["BUFF-SOME"], evolveDeck: ["BP11-036"], cemetery: COSTS, deck: ["V1"], playPoints: 1 }, opp: { field: ["V5"] } });
    all.play("BUFF-SOME").pick("BP11-035").evolve("BP11-035");
    expect([all.leader(), all.hand(), all.field("opp"), all.leader("opp")]).toEqual([23, ["V1"], [], 8]);
  });

  it("037 Maiser — a Steed and a Rapid Fire into the EX area (1 less with Spellchain 5); once a turn a 1-cost spell draws and discards", () => {
    const t = d({ me: { hand: ["BP11-037"], deck: ["V1", "BP11-045"], cemetery: ["KILL", "KILL", "KILL", "KILL", "KILL"], playPoints: 2 }, opp: { field: ["V5"] } });
    t.play("BP11-037").pick("BP11-045");
    expect([t.field(), t.ex(), t.canPlay("BP11-045@ex")]).toEqual([["BP11-037", STEED], ["BP11-045"], true]);
    const draw = d({ me: { field: ["BP11-037"], hand: ["KILL", "KILL", "V3"], deck: ["V1", "V2"], playPoints: 2 }, opp: { field: ["V1", "V1"] } });
    draw.play("KILL").pick("opp:V1").pick("V3");
    expect([draw.hand(), draw.cemetery()]).toEqual([["KILL", "V1"], ["KILL", "V3"]]);
    draw.play("KILL");
    expect(draw.hand()).toEqual(["V1"]);
  });

  it("038 / 039 Magical Gunslinger — a Bullet Bike; during your turn a Mount entering deals 2, draws and discards; evolved: a Carrier with 6 different costs in the cemetery", () => {
    const t = d({ me: { hand: ["BP11-038", "V3"], deck: ["V1"], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP11-038").pick("V3");
    expect([t.field(), t.stats("opp:V5"), t.hand()]).toEqual([["BP11-038", BIKE], [5, 3], ["V1"]]);
    const evo = d({ me: { field: ["BP11-038"], evolveDeck: ["BP11-039"], cemetery: COSTS.slice(0, 6), hand: ["V3"], deck: ["V1"], playPoints: 1 }, opp: { field: ["V5"] } });
    evo.evolve("BP11-038").pick("V3");
    expect([evo.field(), evo.stats("opp:V5")]).toEqual([["BP11-038", CARRIER], [5, 3]]);
  });

  it("040 Transcendent Simulacrum — a Golem follower from the cemetery to the hand; engage: a Golem +1/+1", () => {
    expect(d({ me: { hand: ["BP11-040"], cemetery: ["BP07-047"], playPoints: 2 } }).play("BP11-040").hand()).toEqual(["BP07-047"]);
    expect(d({ me: { field: ["BP11-040", "BP07-047"] } }).activate("BP11-040").stats("BP07-047")).toEqual([3, 2]);
  });

  it("041 Words of Judgment — the enemy follower loses its abilities this turn; leader +2 with 6 different costs in the cemetery", () => {
    const t = d({ me: { hand: ["BP11-041"], cemetery: COSTS.slice(0, 6) }, opp: { field: ["WARD"] } }).play("BP11-041");
    expect([t.keywords("opp:WARD"), t.leader()]).toEqual([[], 22]);
    expect(d({ me: { hand: ["BP11-041"] }, opp: { field: ["WARD"] } }).play("BP11-041").leader()).toBe(20);
  });

  it("042 / 043 Artistic Arcanist — Rush, Bane, Drain; Earth Rite: another follower gets one of them; evolved: an enemy follower into its owner's EX area", () => {
    const t = d({ me: { field: ["BP11-042", "V1", SEDIMENT] } }).activate("BP11-042").choose("bane");
    expect([t.keywords("V1"), t.keywords("BP11-042"), t.field()]).toEqual([["bane"], ["rush", "bane", "drain"], ["BP11-042", "V1"]]);
    const evo = d({ me: { field: ["BP11-042"], evolveDeck: ["BP11-043"], playPoints: 2 }, opp: { field: ["V5"] } }).evolve("BP11-042");
    expect([evo.field("opp"), evo.ex("opp")]).toEqual([[], ["V5"]]);
  });

  it("044 Golem Marshal — discarded: a Carrier into the EX area; Fanfare: a Wasteland follower that costs 6 or less from the cemetery, then a Carrier", () => {
    const discard = d({ me: { hand: ["BP11-046", "BP11-044"], deck: ["V1"], playPoints: 3 } }).play("BP11-046").pick("BP11-044");
    expect(discard.ex()).toEqual([CARRIER]);
    const t = d({ me: { hand: ["BP11-044"], cemetery: ["BP11-019"], playPoints: 9 } }).play("BP11-044");
    expect(t.field()).toEqual(["BP11-044", "BP11-019", CARRIER]);
  });

  it("045 Rapid Fire — Quick; 2 damage, 3 with 3 Rapid Fires in the cemetery, and 4 to its leader with 5; up to 6 in a deck", () => {
    expect(d({ me: { hand: ["BP11-045"] }, opp: { field: ["V5"] } }).play("BP11-045").stats("opp:V5")).toEqual([5, 3]);
    const three = d({ me: { hand: ["BP11-045"], cemetery: ["BP11-045", "BP11-045", "BP11-045"] }, opp: { field: ["V5"] } }).play("BP11-045");
    expect([three.stats("opp:V5"), three.leader("opp")]).toEqual([[5, 2], 20]);
    const five = d({ me: { hand: ["BP11-045"], cemetery: Array<string>(5).fill("BP11-045") }, opp: { field: ["V5"] } }).play("BP11-045");
    expect(five.leader("opp")).toBe(16);
    const deck = (n: number) => ({ main: [...Array<string>(n).fill("BP11-045"), ...Array<string>(40 - n).fill("BP11-046")], evolve: [] });
    expect(E.validateDeck(deck(6), { deckRestrictions: true }).some((p) => p.includes("Rapid Fire"))).toBe(false);
    expect(E.validateDeck(deck(7), { deckRestrictions: true }).some((p) => p.includes("Rapid Fire"))).toBe(true);
  });

  it("046 / 047 Crystal Fencer — draw and discard; evolved: a Runecraft spell from the hand into the EX area, 3 less this turn", () => {
    const t = d({ me: { hand: ["BP11-046", "V3"], deck: ["V1"], playPoints: 3 } }).play("BP11-046").pick("V3");
    expect([t.hand(), t.cemetery()]).toEqual([["V1"], ["V3"]]);
    const evo = d({ me: { field: ["BP11-046"], evolveDeck: ["BP11-047"], hand: ["BP11-051", "V1"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP11-046").pick("BP11-051");
    expect([evo.ex(), evo.pp(), evo.canPlay("BP11-051@ex")]).toEqual([["BP11-051"], 0, true]);
  });

  it("048 Rivaylian Deputy — a Steed; once a turn a Mount entering your field draws and discards", () => {
    const t = d({ me: { hand: ["BP11-048", "V3"], deck: ["V1"], playPoints: 2 } }).play("BP11-048").pick("V3");
    expect([t.field(), t.hand()]).toEqual([["BP11-048", STEED], ["V1"]]);
  });

  it("049 Mirror Witch — Storm; during the opponent's turn, taking damage deals 2 to the enemy leader", () => {
    const t = d({ turn: 6, me: { field: [{ card: "BP11-049", engaged: true }] }, opp: { field: ["V1"] } }).attack("opp:V1", "BP11-049");
    expect(t.leader("opp")).toBe(18);
    expect(d({ me: { field: ["BP11-049"] }, opp: { field: [{ card: "V5", engaged: true }] } }).attack("BP11-049", "opp:V5").leader("opp")).toBe(20);
  });

  it("050 Terra Nova — Quick; a Magic Sediment, then +2 Stack", () => {
    const t = d({ me: { hand: ["BP11-050"], playPoints: 2 } }).play("BP11-050");
    expect([t.field(), t.counters(SEDIMENT, "stack")]).toEqual([[SEDIMENT], 3]);
  });

  it("051 Scorching Blast — Quick; 5 damage, and 2 to its leader with 2 Mage followers on your field", () => {
    const t = d({ me: { hand: ["BP11-051"], field: ["BP11-046", "BP11-048"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP11-051");
    expect([t.field("opp"), t.leader("opp")]).toEqual([[], 18]);
    expect(d({ me: { hand: ["BP11-051"], field: ["BP11-046"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP11-051").leader("opp")).toBe(20);
  });
});
