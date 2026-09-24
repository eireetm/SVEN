import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP04 Dragoncraft (057–078). BP04-058, 067 and 072 are alternate printings; 076 has no text.
// Overflow is active from 7 maximum play points (CR 13.4). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5,
// ZERO 1c 0/3.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const ORCA = "BP02-T05";
const LAEVATEINN = "BP03-056";

describe("BP04 Dragoncraft", () => {
  it("057 Sibyl of the Waterwyrm — Overflow: +1/+1 and max PP +1; end phase: leader +1, or +2 with Overflow", () => {
    const t = d({ me: { hand: ["BP04-057"], deck: ["V1"], playPoints: 3, maxPlayPoints: 7 }, opp: { deck: ["V1"] } });
    t.play("BP04-057");
    expect([t.stats("BP04-057"), t.game.state.players[0].maxPlayPoints]).toEqual([[4, 5], 8]);
    t.end();
    expect(t.leader()).toBe(22);
    const low = d({ me: { hand: ["BP04-057"], deck: ["V1"], playPoints: 3, maxPlayPoints: 6 }, opp: { deck: ["V1"] } });
    low.play("BP04-057").end();
    expect([low.stats("BP04-057"), low.game.state.players[0].maxPlayPoints, low.leader()]).toEqual([[3, 4], 6, 21]);
  });

  it("059 / 060 Python — banish up to 10 cards searched from your deck, face up", () => {
    const deck = ["V1", "V2", "V3", "V5"];
    const t = d({ me: { hand: ["BP04-059"], deck, playPoints: 6 } });
    t.play("BP04-059").pick("V5", "V3");
    expect([t.zone("me", "banished").sort(), t.zone("me", "deck").length]).toEqual([["V3", "V5"], 2]);
    expect(t.game.state.players[0].zones.banished.every((id) => t.game.state.cards[id]!.faceUp)).toBe(true);
    const evo = d({ me: { field: ["BP04-059"], evolveDeck: ["BP04-060"], deck, playPoints: 1 } });
    evo.evolve("BP04-059").pick("V1", "V2", "V3", "V5");
    expect([evo.zone("me", "deck"), evo.zone("me", "banished").length, evo.stats("BP04-059")]).toEqual([[], 4, [8, 9]]);
  });

  it("061 Lævateinn Dragon, Defense Form — Ward; takes 1 less damage; end phase leader +3; also Lævateinn Dragon", () => {
    const t = d({ me: { field: [LAEVATEINN], evolveDeck: ["BP04-061"], deck: ["V1"], playPoints: 1 }, opp: { field: [{ card: "V5", engaged: true }], deck: ["V1"] } });
    t.evolve(LAEVATEINN);
    const id = t.id(`${LAEVATEINN}@field`);
    expect([t.keywords(LAEVATEINN), t.game.reader().info(id).names]).toEqual([["ward"], ["Lævateinn Dragon, Defense Form", "Lævateinn Dragon"]]);
    t.attack(LAEVATEINN, "opp:V5");
    expect([t.stats(LAEVATEINN), t.field("opp")]).toEqual([[5, 3], []]); // V5's 5 combat damage reduced to 4
    t.end();
    expect(t.leader()).toBe(23);
  });

  it("062 Lævateinn Dragon, Blast Form — Intimidate; evolve: 2 x (your Armed followers) to each enemy follower", () => {
    const t = d({ me: { field: [LAEVATEINN, "BP03-060"], evolveDeck: ["BP04-062"], playPoints: 1 }, opp: { field: ["V3", "V5"] } });
    t.evolve(LAEVATEINN);
    expect([t.field("opp"), t.stats("opp:V5"), t.keywords(LAEVATEINN)]).toEqual([["V5"], [5, 1], ["intimidate"]]);
  });

  it("063 Prime Dragon Keeper — Overflow: +1/+1 and Intimidate; another cheap Dragoncraft follower: 2 damage and 1 to its leader", () => {
    const t = d({ me: { hand: ["BP04-073"], field: ["BP04-063"], playPoints: 1 }, opp: { field: ["V3"] } });
    t.play("BP04-073");
    expect([t.stats("opp:V3"), t.leader("opp")]).toEqual([[3, 2], 19]);
    const empty = d({ me: { hand: ["BP04-073"], field: ["BP04-063"], playPoints: 1 } }).play("BP04-073");
    expect(empty.leader("opp")).toBe(20); // nothing to select: no leader damage either (ruling)
    const neutral = d({ me: { hand: ["V1"], field: ["BP04-063"], playPoints: 1 }, opp: { field: ["V3"] } }).play("V1");
    expect(neutral.stats("opp:V3")).toEqual([3, 4]);
    const over = d({ me: { hand: ["BP04-063"], playPoints: 3, maxPlayPoints: 7 } }).play("BP04-063");
    expect([over.stats("BP04-063"), over.keywords("BP04-063")]).toEqual([[2, 6], ["intimidate"]]);
  });

  it("064 / 065 Star Phoenix — in the cemetery, when you play a Dragoncraft spell on your turn, pay 1 to return it; evolved Strike deals 2", () => {
    const t = d({ me: { hand: ["BP04-071"], cemetery: ["BP04-064"], playPoints: 3 }, opp: { field: ["V5"] } });
    t.play("BP04-071").yes();
    expect([t.field(), t.pp(), t.stats("opp:V5")]).toEqual([["BP04-064"], 0, [5, 2]]);
    const no = d({ me: { hand: ["BP04-071"], cemetery: ["BP04-064"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP04-071").no();
    expect([no.field(), no.cemetery()]).toEqual([[], ["BP04-064", "BP04-071"]]);
    const neutral = d({ me: { hand: ["KILL"], cemetery: ["BP04-064"], playPoints: 3 }, opp: { field: ["V5"] } }).play("KILL");
    expect(neutral.decision?.type).toBe("mainPhase");

    const evo = d({ me: { field: ["BP04-064"], evolveDeck: ["BP04-065"], playPoints: 1 }, opp: { field: ["V5"] } });
    evo.evolve("BP04-064").attack("BP04-064", "opp:leader");
    expect(evo.stats("opp:V5")).toEqual([5, 3]);
  });

  it("066 Lightning Blast — Quick; banish a follower, or all enemy followers when played for 5 more", () => {
    const t = d({ me: { hand: ["BP04-066"], playPoints: 5 }, opp: { field: ["V5", "V3"] } });
    t.play("BP04-066").pick("opp:V5");
    expect([t.field("opp"), t.zone("opp", "banished")]).toEqual([["V3"], ["V5"]]);
    const big = d({ me: { hand: ["BP04-066"], playPoints: 10 }, opp: { field: ["V5", "BP03-001"] } });
    big.play("BP04-066").choose("plus5"); // the Aura follower cannot be selected, V5 is taken
    expect([big.field("opp"), big.pp()]).toEqual([[], 0]);
    const aura = d({ me: { hand: ["BP04-066"], playPoints: 10 }, opp: { field: ["BP03-001"] } });
    expect(aura.canPlay("BP04-066")).toBe(false);
  });

  it("068 Venomous Pucewyrm — discard on entering and at the start of your main phase", () => {
    const t = d({ me: { hand: ["BP04-068", "V1", "V2"], deck: ["V3", "V5"], playPoints: 4 }, opp: { deck: ["V1"] } });
    t.play("BP04-068").pick("V2");
    expect(t.hand()).toEqual(["V1"]);
    t.end().end();
    // Drew V3 in the start phase, then discarded one of V1 / V3.
    expect(t.hand()).toHaveLength(2);
    t.pick("V3");
    expect([t.hand(), t.cemetery()]).toEqual([["V1"], ["V2", "V3"]]);
  });

  it("069 / 070 Cetus — evolve destroys every lowest-cost enemy follower (printed cost; evolved use their base cost)", () => {
    const t = d({
      me: { field: ["BP04-069"], evolveDeck: ["BP04-070"], playPoints: 1 },
      opp: { field: ["V1", "V5", "ZERO", { card: "BP04-010", evolvedInto: "BP04-011" }] },
    });
    t.evolve("BP04-069");
    expect(t.field("opp")).toEqual(["V5"]);
  });

  it("071 Dragonewt Fist — 3 damage; when discarded, you may put it into your EX area", () => {
    const t = d({ me: { hand: ["BP04-068", "BP04-071", "V1"], playPoints: 6 }, opp: { field: ["V5"] } });
    t.play("BP04-068").pick("BP04-071").yes();
    expect([t.ex(), t.cemetery()]).toEqual([["BP04-071"], []]);
    t.play("BP04-071");
    expect(t.stats("opp:V5")).toEqual([5, 2]);
  });

  it("073 Dragonrearer Matilda — pay 1, engage and bury it: a cheap Dragoncraft follower from the top 3", () => {
    const t = d({ me: { field: ["BP04-073"], deck: ["V1", "BP04-064", "BP04-059"], playPoints: 1 } });
    t.activate("BP04-073").pick("BP04-064").order();
    expect([t.hand(), t.cemetery(), t.zone("me", "deck")]).toEqual([["BP04-064"], ["BP04-073"], ["V1", "BP04-059"]]);
  });

  it("074 Aqua Nereid — Ward; a Megalorca token, with Storm during Overflow", () => {
    const t = d({ me: { hand: ["BP04-074"], playPoints: 2, maxPlayPoints: 7 } }).play("BP04-074").none();
    expect([t.field(), t.keywords(ORCA), t.keywords("BP04-074")]).toEqual([["BP04-074", ORCA], ["storm"], ["ward"]]);
    const low = d({ me: { hand: ["BP04-074"], playPoints: 2 } }).play("BP04-074").none();
    expect(low.keywords(ORCA)).toEqual([]);
  });

  it("075 Hippocampus — Ward; evolves for 4 into a follower without abilities", () => {
    const t = d({ me: { field: ["BP04-075"], evolveDeck: ["BP04-076"], playPoints: 4 } });
    expect(t.keywords("BP04-075")).toEqual(["ward"]);
    t.evolve("BP04-075");
    expect([t.stats("BP04-075"), t.keywords("BP04-075")]).toEqual([[7, 7], []]);
  });

  it("077 Scaled Berserker — Rush; +2/+2 whenever it takes damage (not from 0-attack combat)", () => {
    const t = d({ me: { field: ["BP04-077"] }, opp: { field: [{ card: "V3", engaged: true }] } });
    t.attack("BP04-077", "opp:V3");
    expect([t.stats("BP04-077"), t.field("opp")]).toEqual([[8, 6], []]);
    const zero = d({ me: { field: ["BP04-077"] }, opp: { field: [{ card: "ZERO", engaged: true }] } });
    zero.attack("BP04-077", "opp:ZERO");
    expect(zero.stats("BP04-077")).toEqual([6, 7]);
  });

  it("078 Dragon's Nest — engage and bury it: leader +2, and a draw during Overflow", () => {
    const t = d({ me: { field: ["BP04-078"], deck: ["V1"], maxPlayPoints: 7 } }).activate("BP04-078");
    expect([t.leader(), t.hand(), t.field()]).toEqual([22, ["V1"], []]);
    const low = d({ me: { field: ["BP04-078"], deck: ["V1"] } }).activate("BP04-078");
    expect([low.leader(), low.hand()]).toEqual([22, []]);
  });
});
