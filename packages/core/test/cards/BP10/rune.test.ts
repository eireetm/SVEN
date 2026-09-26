import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP10 Runecraft (037–053). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); KILL and QUICK-SAC are spells.
// BP10-043 / 047 / 053 are Arcana or Runecraft spells; BP01-T10 Magic Sediment (Stack); BP07-047 a
// 1-cost Golem; BP03-039 Mystic King; BP03-051 Magical Rook (1-cost Chess follower); BP10-046 / 052 are
// Chess spells.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const SEDIMENT = "BP01-T10";
const LHYNKAL = "BP10-037";

describe("BP10 Runecraft", () => {
  it("037 / 038 Lhynkal — up to 2 Arcana spells from the top 5; evolved: each Arcana spell you play deals 3 to an enemy follower", () => {
    const t = d({ me: { hand: [LHYNKAL], deck: ["BP10-043", "V1", "BP10-047", "V3", "BP10-053"], playPoints: 2 } });
    t.play(LHYNKAL).pick("BP10-043", "BP10-047").order();
    expect(t.hand()).toEqual(["BP10-043", "BP10-047"]);
    const evo = d({ me: { field: [{ card: LHYNKAL, evolvedInto: "BP10-038" }], hand: ["BP10-043"], playPoints: 1 }, opp: { field: ["V5"] } });
    evo.play("BP10-043");
    // The spell also goes into the EX area: Lhynkal is on the field.
    expect([evo.stats("opp:V5"), evo.leader("opp"), evo.ex()]).toEqual([[5, 2], 18, ["BP10-043"]]);
  });

  it("039 Runie — Spellchain 5: 3 to the selected follower; 10: 2 to the enemy leader and leader +2; 15: Runies from the cemetery into the EX area; 20: Runies +2/+2", () => {
    const five = d({ me: { hand: ["BP10-039"], cemetery: Array<string>(5).fill("KILL"), playPoints: 2 }, opp: { field: ["V5"] } }).play("BP10-039").pick("opp:V5");
    expect([five.stats("opp:V5"), five.leader("opp")]).toEqual([[5, 2], 20]);
    // Playable with no enemy follower; everything else still applies (ruling).
    const all = d({ me: { hand: ["BP10-039"], cemetery: [...Array<string>(20).fill("KILL"), "BP10-039"], playPoints: 2 } }).play("BP10-039");
    const exRunie = all.game.state.players[0].zones.ex[0]!;
    expect([all.leader("opp"), all.leader(), all.ex(), all.stats("BP10-039"), all.game.reader().info(exRunie).attack]).toEqual([
      18,
      22,
      ["BP10-039"],
      [3, 3],
      3,
    ]);
  });

  it("040 / 041 Imperator of Magic — summons a Golem that costs 6 or less from the deck; evolved: a Golem on your field gets Rush and Assail", () => {
    const t = d({ me: { hand: ["BP10-040"], deck: ["V1", "BP07-047"], playPoints: 5 } }).play("BP10-040").pick("BP07-047");
    expect(t.field()).toEqual(["BP10-040", "BP07-047"]);
    const evo = d({ me: { field: ["BP10-040", "BP07-047"], evolveDeck: ["BP10-041"], playPoints: 1 } }).evolve("BP10-040");
    expect(evo.keywords("BP07-047")).toEqual(["rush", "assail"]);
  });

  it("042 Checkmate — damage to each enemy follower equal to your Chess cards in the cemetery; from the cemetery: a Mystic King gets Storm", () => {
    const t = d({ me: { hand: ["BP10-042"], cemetery: ["BP10-046", "BP10-052", "BP03-051"], playPoints: 3 }, opp: { field: ["V5", "V1"] } }).play("BP10-042");
    expect([t.field("opp"), t.stats("opp:V5")]).toEqual([["V5"], [5, 2]]);
    const act = d({ me: { cemetery: ["BP10-042"], field: ["BP03-039"] } }).activate("BP10-042");
    expect([act.keywords("BP03-039"), act.zone("me", "banished")]).toEqual([["storm"], ["BP10-042"]]);
  });

  it("043 Scourge of the Omniscient — 2 to the enemy leader, into the EX area with Lhynkal; not playable from there; 1 at your end phase while there", () => {
    const t = d({ me: { hand: ["BP10-043"], playPoints: 1 } }).play("BP10-043");
    expect([t.leader("opp"), t.cemetery()]).toEqual([18, ["BP10-043"]]);
    const ex = d({ me: { hand: ["BP10-043"], field: [LHYNKAL], playPoints: 1 } }).play("BP10-043");
    expect([ex.ex(), ex.canPlay("BP10-043")]).toEqual([["BP10-043"], false]);
    const end = d({ me: { ex: ["BP10-043", "BP10-043"], deck: ["V1"] }, opp: { deck: ["V1"] } }).end().flush();
    expect(end.leader("opp")).toBe(18);
  });

  it("044 / 045 Juggling Moggy — Fanfare (4 and Earth Rite): banish an enemy follower that costs 4 or less; evolved: Last Words a Magic Sediment and +1 Stack", () => {
    const t = d({ me: { hand: ["BP10-044"], field: [SEDIMENT], playPoints: 5 }, opp: { field: ["V3", "V5"] } }).play("BP10-044").yes().yes();
    expect([t.field("opp"), t.zone("opp", "banished"), t.field(), t.pp()]).toEqual([["V5"], ["V3"], ["BP10-044"], 0]);
    const lw = d({ me: { field: [{ card: "BP10-044", evolvedInto: "BP10-045" }], hand: ["QUICK-SAC"] } }).play("QUICK-SAC");
    expect([lw.field(), lw.counters(SEDIMENT, "stack")]).toEqual([[SEDIMENT], 2]);
  });

  it("046 Gambit — a Magical Pawn with +1 attack and Rush; with 5 Chess cards in the cemetery also a Chess follower that costs 4 or less from the deck", () => {
    const chess = ["BP10-052", "BP10-052", "BP10-052", "BP10-046", "BP03-051"];
    const t = d({ me: { hand: ["BP10-046"], cemetery: chess, deck: ["V1", "BP03-051"], playPoints: 2 } }).play("BP10-046").pick("BP03-051");
    expect([t.field(), t.stats("BP02-T04"), t.keywords("BP02-T04")]).toEqual([["BP02-T04", "BP03-051"], [3, 1], ["rush"]]);
    const few = d({ me: { hand: ["BP10-046"], cemetery: chess.slice(1), deck: ["V1", "BP03-051"], playPoints: 2 } }).play("BP10-046");
    expect(few.field()).toEqual(["BP02-T04"]);
  });

  it("047 Rite of the Ignorant — leader +2, into the EX area with Lhynkal; at your end phase there: draw, then discard", () => {
    const t = d({ me: { hand: ["BP10-047"], field: [LHYNKAL], playPoints: 1 } }).play("BP10-047");
    expect([t.leader(), t.ex()]).toEqual([22, ["BP10-047"]]);
    const end = d({ me: { ex: ["BP10-047"], hand: ["V3"], deck: ["V1", "V5"] }, opp: { deck: ["V1"] } }).end().pick("V3");
    expect(end.hand()).toEqual(["V1"]);
  });

  it("048 / 049 Piquant Potioneer — Fanfare draws; evolved: discard a Runecraft card for leader +5, or a non-Runecraft card for 5 damage", () => {
    expect(d({ me: { hand: ["BP10-048"], deck: ["V1"], playPoints: 5 } }).play("BP10-048").hand()).toEqual(["V1"]);
    // With no enemy follower (2) can't be chosen (ruling), so (1) is the only option.
    const rune = d({ me: { field: ["BP10-048"], evolveDeck: ["BP10-049"], hand: ["BP10-053"], playPoints: 1 } }).evolve("BP10-048").yes();
    expect([rune.leader(), rune.hand()]).toEqual([25, []]);
    const other = d({ me: { field: ["BP10-048"], evolveDeck: ["BP10-049"], hand: ["V1"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP10-048").choose("damage").yes();
    expect(other.field("opp")).toEqual([]);
    // (1) without a Runecraft card: chosen, nothing happens (ruling).
    const none = d({ me: { field: ["BP10-048"], evolveDeck: ["BP10-049"], hand: ["V1"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP10-048").choose("defense");
    expect([none.leader(), none.hand()]).toEqual([20, ["V1"]]);
  });

  it("050 Creative Conjurer — +1 Stack (a Magic Sediment without one), or Earth Rite: 2 to the enemy leader (choosable without it, then nothing)", () => {
    const stack = d({ me: { hand: ["BP10-050"], playPoints: 2 } }).play("BP10-050").choose("stack");
    expect([stack.field(), stack.counters(SEDIMENT, "stack")]).toEqual([["BP10-050", SEDIMENT], 1]);
    const rite = d({ me: { hand: ["BP10-050"], field: [SEDIMENT], playPoints: 2 } }).play("BP10-050").choose("damage").yes();
    expect([rite.leader("opp"), rite.field()]).toEqual([18, ["BP10-050"]]);
    const noStack = d({ me: { hand: ["BP10-050"], playPoints: 2 } }).play("BP10-050").choose("damage");
    expect(noStack.leader("opp")).toBe(20);
  });

  it("051 Arcane Auteur — draw, or a spell from the cemetery to the hand (only draw without one)", () => {
    const t = d({ me: { hand: ["BP10-051"], cemetery: ["KILL"], deck: ["V1"], playPoints: 4 } }).play("BP10-051").choose("spell");
    expect(t.hand()).toEqual(["KILL"]);
    const draw = d({ me: { hand: ["BP10-051"], deck: ["V1"], playPoints: 4 } }).play("BP10-051");
    expect(draw.hand()).toEqual(["V1"]);
  });

  it("052 Skewer — choose one; with 5 Chess cards in the cemetery up to 2: the opponent buries a follower, leader +3, draw 2", () => {
    const one = d({ me: { hand: ["BP10-052"], playPoints: 3 }, opp: { field: ["V1", "V5"] } }).play("BP10-052").choose("bury").pick("opp:V1");
    expect(one.field("opp")).toEqual(["V5"]);
    const chess = ["BP10-052", "BP10-052", "BP10-046", "BP10-046", "BP03-051"];
    const two = d({ me: { hand: ["BP10-052"], cemetery: chess, deck: ["V1", "V3"], playPoints: 3 } }).play("BP10-052").choose("defense", "draw");
    expect([two.leader(), two.hand()]).toEqual([23, ["V1", "V3"]]);
  });

  it("053 Magical Augmentation — 2 damage; Earth Rite (2): 4 damage and a draw", () => {
    const t = d({ me: { hand: ["BP10-053"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP10-053");
    expect(t.stats("opp:V5")).toEqual([5, 3]);
    const rite = d({ me: { hand: ["BP10-053"], field: [{ card: SEDIMENT, counters: { stack: 2 } }], deck: ["V1"], playPoints: 1 }, opp: { field: ["V5"] } });
    rite.play("BP10-053").yes();
    expect([rite.stats("opp:V5"), rite.hand(), rite.field()]).toEqual([[5, 1], ["V1"], []]);
  });
});
