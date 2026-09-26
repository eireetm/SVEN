import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP10 Forestcraft (001–018). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral); FAN-DMG deals 1
// to an enemy follower (2); KILL destroys an enemy follower (1). Tokens: BP05-T04 Ancient Artifact (1),
// BP05-T05 Mystic Artifact (3), BP01-T02 Fairy Wisp (0), BP01-T01 Thorn Burst (2), BP01-T11 Dragon (4),
// BP01-T03 Fairy. BP10-009 Salvia Panther and BP10-015 Crocus Rat are Beasts; BP10-122 is a Mercenary.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const ANCIENT = "BP05-T04";
const MYSTIC = "BP05-T05";

describe("BP10 Forestcraft", () => {
  it("001 Wolfraud — takes no ability damage and isn't destroyed by abilities; Fanfare (5): Treacherous Reversal into the EX area, 8 less", () => {
    const t = d({ me: { hand: ["FAN-DMG", "KILL"], playPoints: 3 }, opp: { field: ["BP10-001"] } }).play("FAN-DMG").play("KILL");
    expect([t.field("opp"), t.stats("opp:BP10-001")]).toEqual([["BP10-001"], [2, 2]]);
    const fan = d({ me: { hand: ["BP10-001"], deck: ["V1", "BP10-008"], playPoints: 7 } }).play("BP10-001").yes().pick("BP10-008");
    expect([fan.ex(), fan.pp(), fan.canPlay("BP10-008")]).toEqual([["BP10-008"], 0, true]);
    const unpaid = d({ me: { hand: ["BP10-001"], deck: ["V1", "BP10-008"], playPoints: 7 } }).play("BP10-001").no();
    expect([unpaid.ex(), unpaid.pp()]).toEqual([[], 5]);
  });

  it("002 Wolfraud (Evolved) — On Evolve, Combo (3): +1/+1 (evolving isn't playing a card)", () => {
    const three = d({ me: { field: ["BP10-001"], evolveDeck: ["BP10-002"], playedThisTurn: 3, playPoints: 1 } }).evolve("BP10-001");
    expect(three.stats("BP10-001")).toEqual([4, 4]);
    const two = d({ me: { field: ["BP10-001"], evolveDeck: ["BP10-002"], playedThisTurn: 2, playPoints: 1 } }).evolve("BP10-001");
    expect(two.stats("BP10-001")).toEqual([3, 3]);
  });

  it("003 Lucille — summons one Artifact and puts the other into the EX area; act: banish 5 different costs from the EX area for Spinaria", () => {
    const t = d({ me: { hand: ["BP10-003"], playPoints: 6 } }).play("BP10-003").choose("ancient");
    expect([t.field(), t.ex()]).toEqual([["BP10-003", ANCIENT], [MYSTIC]]);
    const act = d({ me: { field: ["BP10-003"], ex: ["BP01-T02", ANCIENT, "BP01-T01", MYSTIC, "BP01-T11"], evolveDeck: ["BP10-004"] }, opp: { field: ["V5"] } });
    act.activate("BP10-003").pick("BP01-T02").pick(ANCIENT).pick("BP01-T01").pick(MYSTIC).pick("BP10-004");
    expect([act.field(), act.ex(), act.engaged("BP10-003"), act.field("opp"), act.leader("opp")]).toEqual([
      ["BP10-003", "BP10-004"],
      [],
      true,
      [],
      14,
    ]);
    expect(d({ me: { field: ["BP10-003"], ex: ["BP01-T02", ANCIENT, "BP01-T01", MYSTIC, ANCIENT], evolveDeck: ["BP10-004"] } }).canActivate("BP10-003")).toBe(false);
  });

  it("004 Spinaria & Lucille — advanced: Fanfare 6 to the enemy leader and followers, up to 2 of the top 2 into the EX area; engage to deal 6 to an entering enemy follower; refreshes", () => {
    const t = d({ me: { ex: ["BP10-004"], deck: ["V1", "V3", "V5"], playPoints: 10 }, opp: { field: ["V5", "V1"] } }).play("BP10-004").pick("V1");
    expect([t.leader("opp"), t.field("opp"), t.ex(), t.cemetery()]).toEqual([14, [], ["V1"], ["V3"]]);
    // In the opponent's turn a follower enters their field.
    const punish = d({ turn: 6, me: { field: ["BP10-004"] }, opp: { hand: ["V5"], playPoints: 5 } }).play("opp:V5").yes();
    expect([punish.field("opp"), punish.engaged("BP10-004")]).toEqual([[], true]);
    const end = d({ me: { field: [{ card: "BP10-004", engaged: true }], deck: ["V1"] }, opp: { deck: ["V1"] } }).end();
    expect(end.engaged("BP10-004")).toBe(false);
  });

  it("005 / 006 Chipper Skipper — a Mercenary follower entering gets +1/+1 and Rush; evolved: a follower costing 2 or less from the top 4 into the EX area, 2 less", () => {
    const t = d({ me: { field: ["BP10-005"], hand: ["BP10-122"], playPoints: 2 } }).play("BP10-122");
    expect([t.stats("BP10-122"), t.keywords("BP10-122")]).toEqual([[4, 3], ["rush"]]);
    const evo = d({ me: { field: ["BP10-005"], evolveDeck: ["BP10-006"], deck: ["V5", "V2", "V3", "V1"], playPoints: 1 } });
    evo.evolve("BP10-005").pick("V2").order();
    expect([evo.ex(), evo.canPlay("V2")]).toEqual([["V2"], true]);
  });

  it("007 / 009 Windflower Tiger and Salvia Panther — Ward; returning another Beast finds a Salvia Panther, which then costs 2 less; Storm", () => {
    // Crocus Rat (a Beast) goes back to the hand (its own ability: leader +1).
    const t = d({ me: { hand: ["BP10-007"], field: ["BP10-015"], deck: ["V1", "BP10-009"], playPoints: 3 } });
    t.play("BP10-007").none().yes().pick("BP10-009");
    expect([t.hand(), t.pp(), t.leader(), t.keywords("BP10-007")]).toEqual([["BP10-015", "BP10-009"], 1, 21, ["ward"]]);
    t.play("BP10-009");
    expect([t.pp(), t.keywords("BP10-009")]).toEqual([0, ["storm"]]);
    // A returned Salvia Panther doesn't count ("not named Salvia Panther").
    const salvia = d({ me: { hand: ["BP10-007", "BP10-009"], field: ["BP10-009"], playPoints: 3 } }).play("BP10-007").none().yes();
    expect([salvia.pp(), salvia.canPlay("BP10-009")]).toEqual([1, false]);
  });

  it("008 Treacherous Reversal — destroys every card on the field, buries both EX areas, discards your hand; any of the top 5 into the EX area", () => {
    const t = d({
      me: { field: ["V1"], ex: ["V3"], hand: ["BP10-008", "V2"], deck: ["V1", "V2", "V3", "V5", "V1", "V2"], playPoints: 8 },
      opp: { field: ["V5"], ex: ["V1"] },
    });
    t.play("BP10-008").pick("V1", "V2");
    expect([t.field(), t.field("opp"), t.ex(), t.ex("opp"), t.hand(), t.zone("me", "deck")]).toEqual([[], [], ["V1", "V2"], [], [], ["V2"]]);
    expect(t.cemetery().sort()).toEqual(["BP10-008", "V1", "V1", "V2", "V3", "V3", "V5"]);
  });

  it("010 Salvia Panther (Evolved) — Storm; returns an enemy follower that costs 3 or less", () => {
    const t = d({ me: { field: ["BP10-009"], evolveDeck: ["BP10-010"], playPoints: 2 }, opp: { field: ["V3", "V5"] } }).evolve("BP10-009");
    expect([t.field("opp"), t.hand("opp"), t.keywords("BP10-009")]).toEqual([["V5"], ["V3"], ["storm"]]);
  });

  it("011 Optimistic Beastmaster — a card from the top 3 into the EX area; act: damage equal to the number of different costs there", () => {
    const t = d({ me: { hand: ["BP10-011"], deck: ["V1", "V2", "V3"], playPoints: 4 } }).play("BP10-011").pick("V2").order();
    expect(t.ex()).toEqual(["V2"]);
    const act = d({ me: { field: ["BP10-011"], ex: ["V1", "V2", "V3", "V1"] }, opp: { field: ["V5"] } }).activate("BP10-011");
    expect([act.stats("opp:V5"), act.engaged("BP10-011")]).toEqual([[5, 2], true]);
  });

  it("012 Lumbering Carapace — Rush; Combo (3): searches another Lumbering Carapace", () => {
    const t = d({ me: { hand: ["BP10-012"], deck: ["V1", "BP10-012"], playedThisTurn: 2, playPoints: 1 } }).play("BP10-012").pick("BP10-012");
    expect([t.hand(), t.keywords("BP10-012")]).toEqual([["BP10-012"], ["rush"]]);
    const one = d({ me: { hand: ["BP10-012"], deck: ["V1", "BP10-012"], playedThisTurn: 1, playPoints: 1 } }).play("BP10-012");
    expect(one.hand()).toEqual([]);
  });

  it("013 / 014 Reclusive Ponderer — Fanfare and evolved On Evolve: an Arcana card from the deck into the EX area", () => {
    const t = d({ me: { hand: ["BP10-013"], deck: ["V1", "BP10-001"], playPoints: 4 } }).play("BP10-013").pick("BP10-001");
    expect(t.ex()).toEqual(["BP10-001"]);
    const evo = d({ me: { field: ["BP10-013"], evolveDeck: ["BP10-014"], deck: ["V1", "BP10-005"], playPoints: 1 } }).evolve("BP10-013").pick("BP10-005");
    expect(evo.ex()).toEqual(["BP10-005"]);
  });

  it("015 Crocus Rat — Fanfare (5): an enemy follower to the bottom of its deck and a draw; returned to hand from your field: leader +1", () => {
    const t = d({ me: { hand: ["BP10-015"], deck: ["V1"], playPoints: 6 }, opp: { field: ["V5"], deck: ["V3"] } }).play("BP10-015").yes();
    expect([t.field("opp"), t.zone("opp", "deck"), t.hand()]).toEqual([[], ["V3", "V5"], ["V1"]]);
    // Windflower Tiger's cost returns it to the hand.
    const back = d({ me: { hand: ["BP10-007"], field: ["BP10-015"], playPoints: 2 } }).play("BP10-007").none().yes();
    expect([back.hand(), back.leader()]).toEqual([["BP10-015"], 21]);
  });

  it("016 Blossoming Archer — 3 damage to the selected follower with 3 different costs in the EX area", () => {
    const t = d({ me: { hand: ["BP10-016"], ex: ["V1", "V2", "V3"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP10-016");
    expect(t.stats("opp:V5")).toEqual([5, 2]);
    const two = d({ me: { hand: ["BP10-016"], ex: ["V1", "V1", "V2"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP10-016");
    expect(two.stats("opp:V5")).toEqual([5, 5]);
  });

  it("017 Deepwood Wolf — Storm; another Beast entering: +2/+2; from the hand (1, into the EX area): a card on your field into its owner's EX area", () => {
    const t = d({ me: { field: ["BP10-017"], hand: ["BP10-009"], playPoints: 3 } }).play("BP10-009");
    expect([t.stats("BP10-017"), t.keywords("BP10-017")]).toEqual([[6, 6], ["storm"]]);
    const act = d({ me: { hand: ["BP10-017"], field: ["V1"], playPoints: 1 } }).activate("BP10-017");
    expect([act.ex(), act.field()]).toEqual([["BP10-017", "V1"], []]);
    // The Wolf fills the EX area: the selected card stays (ruling); a full EX area can't pay the cost.
    const fills = d({ me: { hand: ["BP10-017"], field: ["V1"], ex: ["V2", "V2", "V2", "V2"], playPoints: 1 } }).activate("BP10-017");
    expect([fills.field(), fills.ex().length]).toEqual([["V1"], 5]);
    expect(d({ me: { hand: ["BP10-017"], field: ["V1"], ex: ["V2", "V2", "V2", "V2", "V2"], playPoints: 1 } }).canActivate("BP10-017")).toBe(false);
  });

  it("018 Fairy Assault — 2 Fairies, then damage equal to your Pixie tokens", () => {
    const t = d({ me: { hand: ["BP10-018"], field: ["BP01-T02", "V1"], playPoints: 3 } }).play("BP10-018");
    expect([t.field(), t.leader("opp")]).toEqual([["BP01-T02", "V1", "BP01-T03", "BP01-T03"], 17]);
  });
});
