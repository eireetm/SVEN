import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../src/testing";
import { cardEngine } from "../helpers";

// Engine behaviour added for BP05 that the card tests do not show directly. V1 is 1c 2/2, V3 3c
// 3/4, V5 5c 5/5; WARD 2c 1/3 Ward; LW-DRAW 1c 1/1 "Last Words: draw"; EVOLVER 2c 2/2 "Evolve 2".
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const HUNTERS = ["BP05-004", "BP05-004", "BP05-004"];

describe("BP05 mechanics", () => {
  it("a follower changed into an amulet has no attack or defense, is not attacked, and keeps its abilities (CR 5.25)", () => {
    const t = d({
      me: { hand: ["BP05-001"], field: ["V3"], cemetery: HUNTERS, playPoints: 5 },
      opp: { field: [{ card: "WARD", engaged: true }] },
    });
    expect(t.attackTargets("V3")).toEqual(["WARD"]);
    t.play("BP05-001");
    const info = t.game.reader().info(t.id("opp:WARD"));
    expect([info.type, info.attack, info.defense, info.keywords]).toEqual(["amulet", null, null, ["ward"]]);
    // Not a follower: its Ward doesn't hold attacks back and it can't be attacked (rulings).
    expect(t.attackTargets("V3")).toEqual(["opp:leader"]);
    expect(t.game.reader().followers(1)).toEqual([]);
  });

  it("the changed card can use the given ability, and it evolves and stays an amulet (BP05-001 rulings)", () => {
    const t = d({
      me: { hand: ["BP05-001"], cemetery: HUNTERS, playPoints: 5 },
      opp: { field: ["EVOLVER", "V1"], evolveDeck: ["EVOLVER-E"], deck: ["V1"], maxPlayPoints: 5 },
    });
    t.play("BP05-001").pick("opp:EVOLVER").end();
    // The opponent's turn (6 play points): evolve it (2), then pay 2 to put it into the cemetery.
    t.evolve("opp:EVOLVER");
    expect([t.game.reader().info(t.id("opp:EVOLVER")).type, t.stats("opp:EVOLVER")]).toEqual(["amulet", [null, null]]);
    t.activate("opp:EVOLVER");
    expect([t.cemetery("opp"), t.pp("opp")]).toEqual([["EVOLVER"], 2]);
  });

  it("a card that lost all abilities loses keywords and Last Words until the end of the opponent's next turn (BP05-061)", () => {
    const t = d({
      me: { field: ["BP05-060", "V3"], evolveDeck: ["BP05-061"], deck: ["V1"], playPoints: 2 },
      opp: { field: [{ card: "WARD", engaged: true }], deck: ["V1"] },
    });
    t.evolve("BP05-060");
    // Without Ward it no longer holds attacks back (it is still an engaged follower).
    expect([t.keywords("opp:WARD"), t.attackTargets("V3")]).toEqual([[], ["WARD", "opp:leader"]]);
    t.end().none(); // Cursed Stone's Ward: stay reserved
    expect([t.keywords("opp:WARD"), t.game.state.activePlayer]).toEqual([[], 1]);
    t.end(); // no Ward to engage for the opponent's WARD in its end phase; back to me
    expect(t.keywords("opp:WARD")).toEqual(["ward"]);
    const lw = d({
      me: { field: ["BP05-060"], evolveDeck: ["BP05-061"], hand: ["KILL"], playPoints: 2 },
      opp: { field: ["LW-DRAW"], deck: ["V1"] },
    });
    lw.evolve("BP05-060").play("KILL");
    expect([lw.cemetery("opp"), lw.hand("opp")]).toEqual([["LW-DRAW"], []]);
  });

  it("an ability given after the loss works (BP05-061 ruling)", () => {
    const t = d({
      me: { field: ["BP05-060"], evolveDeck: ["BP05-061"], playPoints: 1 },
      opp: { field: ["V1"], hand: ["GIVE-STORM"], deck: ["V1"] },
    });
    t.evolve("BP05-060").end().none();
    t.play("opp:GIVE-STORM");
    expect(t.keywords("opp:V1")).toEqual(["storm"]);
    expect(t.attackTargets("opp:V1")).toEqual([]); // it still can't attack
  });

  it("restrictions on the opponent's next turn: no draw, no max PP increase, no followers played (BP05-006)", () => {
    const draw = d({ me: { field: ["BP05-006"] }, opp: { deck: ["V1", "V1"], maxPlayPoints: 2 } });
    draw.end().choose("noStartPhaseDraw");
    expect([draw.hand("opp"), draw.game.state.players[1].maxPlayPoints]).toEqual([[], 3]);
    const pp = d({ me: { field: ["BP05-006"] }, opp: { deck: ["V1", "V1"], maxPlayPoints: 2 } });
    pp.end().choose("noStartPhaseMaxPlayPoints");
    expect([pp.hand("opp"), pp.game.state.players[1].maxPlayPoints, pp.pp("opp")]).toEqual([["V1"], 2, 2]);
    const play = d({ me: { field: ["BP05-006"], deck: ["V1"] }, opp: { deck: ["V1", "V1"], hand: ["V1", "KILL"], maxPlayPoints: 2 } });
    play.end().choose("cantPlayFollowers");
    expect([play.canPlay("opp:V1"), play.canPlay("opp:KILL")]).toEqual([false, true]);
    // It ends with that turn.
    play.end().end();
    expect(play.game.state.restrictions).toEqual([]);
  });

  it("skipping your next turn: the opponent takes two turns in a row (CR 5.26.2, BP05-086)", () => {
    const t = d({
      me: { field: ["BP05-086"], evolveDeck: ["BP05-087"], deck: ["V1", "V1"], playPoints: 3 },
      opp: { deck: ["V1", "V1", "V1"] },
    });
    t.evolve("BP05-086");
    expect([t.game.state.players[0].skipNextTurn, t.game.state.players[0].maxPlayPoints, t.leader()]).toEqual([true, 4, 23]);
    t.end().none(); // Marwynn's Ward: stay reserved
    expect([t.game.state.turn, t.game.state.activePlayer]).toEqual([6, 1]);
    t.end();
    expect([t.game.state.turn, t.game.state.activePlayer, t.game.state.players[0].skipNextTurn]).toEqual([7, 1, false]);
    t.end();
    expect([t.game.state.turn, t.game.state.activePlayer]).toEqual([8, 0]);
  });

  it("'the next time your leader would take damage' is used up by one instance only (BP05-017)", () => {
    const t = d({ me: { hand: ["BP05-017", "BP05-075", "BP05-075"], playPoints: 3 } });
    t.play("BP05-017").play("BP05-075");
    expect([t.leader(), t.leader("opp")]).toEqual([20, 19]);
    t.play("BP05-075");
    expect([t.leader(), t.leader("opp")]).toEqual([19, 18]);
  });

  it("damage of 0 does not use the prevention up (BP05-017 ruling)", () => {
    // In the opponent's turn: 0-attack ZERO attacks, then V1 attacks; only V1's damage is prevented.
    const t = d({ me: { hand: ["BP05-017"] }, opp: { field: ["ZERO", "V1"], deck: ["V1"] } });
    t.end();
    t.attack("opp:ZERO", "leader");
    t.quick("BP05-017");
    t.attack("opp:V1", "leader");
    expect(t.leader()).toEqual(20);
  });

  it("each instance of damage to the leader is capped at 4 (BP05-101)", () => {
    const t = d({ me: { field: ["BP05-101"], hand: ["BOTH-20"] }, opp: { leaderDefense: 30 } });
    t.activate("BP05-101").play("BOTH-20");
    expect([t.leader(), t.leader("opp"), t.cemetery()]).toEqual([16, 10, ["BP05-101", "BOTH-20"]]);
  });

  it("'your leader doesn't take ability damage' prevents it without losing defense (BP05-108)", () => {
    const t = d({ me: { field: ["BP05-108"], hand: ["BOTH-20"] }, opp: { leaderDefense: 30 } });
    t.play("BOTH-20");
    expect([t.leader(), t.leader("opp"), t.game.reader().leaderDefenseLostThisTurn(0), t.game.reader().sanguine(0)]).toEqual([
      20,
      10,
      0,
      false,
    ]);
  });

  it("you can't lose while Ancient Protector is on your field; it then sets your leader's defense to 1 (BP05-092)", () => {
    const t = d({ me: { field: ["BP05-092"], hand: ["BOTH-20"], leaderDefense: 5 }, opp: { leaderDefense: 30 } });
    t.play("BOTH-20");
    expect([t.game.state.result, t.leader(), t.field(), t.cemetery()]).toEqual([null, 1, [], ["BOTH-20", "BP05-092"]]);
    // Drawing from an empty deck doesn't lose either, not even after it has left (ruling).
    const out = d({ me: { field: ["BP05-092"], hand: ["FAN-DRAW", "KILL"] }, opp: { field: ["V1"] } });
    out.play("FAN-DRAW");
    expect(out.game.state.result).toBeNull();
  });

  it("'you win the game' is prohibited by Ancient Protector (CR 1.3.3, BP05-092 ruling)", () => {
    const t = d({ me: { field: ["BP05-092"] }, opp: { field: ["BP04-003"], deck: ["V1"] } });
    t.end();
    t.attack("opp:BP04-003", "leader");
    expect(t.game.state.result).toBeNull();
  });

  it("an effect can set a follower's evolve cost to 0 for the turn (BP05-048)", () => {
    const t = d({
      me: { hand: ["BP05-048"], field: ["BP05-047", "BP05-047"], evolveDeck: ["BP05-049"], playPoints: 2 },
      opp: { field: ["V5"] },
    });
    t.play("BP05-048").evolve("BP05-048");
    expect([t.pp(), t.stats("opp:V5"), t.leader("opp")]).toEqual([0, [5, 3], 18]);
  });

  it("an opponent's card can make your spells cost more; two of them stack (BP05-070)", () => {
    const t = d({ me: { hand: ["KILL"], playPoints: 2 }, opp: { field: ["BP05-070", "BP05-070"] } });
    expect(t.canPlay("KILL")).toBe(false);
    expect(d({ me: { hand: ["KILL"], playPoints: 3 }, opp: { field: ["BP05-070", "BP05-070"] } }).canPlay("KILL")).toBe(true);
  });

  it("'your Golem followers cost 1 less' still helps only its controller now that both fields are asked (BP01-055)", () => {
    const alchemist = { card: "BP01-054", evolvedInto: "BP01-055" };
    expect(d({ me: { ex: ["BP01-T08"], playPoints: 1 }, opp: { field: [alchemist] } }).canPlay("BP01-T08")).toBe(false);
    expect(d({ me: { ex: ["BP01-T08"], field: [alchemist], playPoints: 1 } }).canPlay("BP01-T08")).toBe(true);
  });

  it("an option's play-point cost is asked after the card's own cost (BP05-041)", () => {
    const t = d({ me: { hand: ["BP05-041"], field: ["BP05-047"], playPoints: 3 }, opp: { field: ["V1"] } });
    t.play("BP05-041").choose("damage").yes();
    expect([t.pp(), t.stats("opp:V1")]).toEqual([0, [2, 1]]);
    // With 2 play points only the card can be paid: the option does nothing.
    const poor = d({ me: { hand: ["BP05-041"], field: ["BP05-047"], playPoints: 2 }, opp: { field: ["V1"] } });
    poor.play("BP05-041").choose("damage");
    expect([poor.pp(), poor.stats("opp:V1")]).toEqual([1, [2, 2]]);
  });

  it("a card from an opponent's cemetery played by you stays theirs and goes back to their zones (BP05-019)", () => {
    const t = d({
      me: { field: ["BP05-018"], evolveDeck: ["BP05-019"], hand: ["QUICK-SAC"], playPoints: 3 },
      opp: { cemetery: ["V1"] },
    });
    t.evolve("BP05-018");
    expect([t.ex(), t.game.state.cards[t.id("V1@ex")]!.owner]).toEqual([["V1"], 1]);
    t.play("V1");
    expect(t.field()).toEqual(["BP05-018", "V1"]);
    t.play("QUICK-SAC").pick("V1");
    expect([t.cemetery(), t.cemetery("opp")]).toEqual([["QUICK-SAC"], ["V1"]]);
  });

  it("playing an opponent's spell from their cemetery for 0: it returns to their cemetery (BP05-018)", () => {
    const t = d({
      me: { field: [{ card: "BP05-018", evolvedInto: "BP05-019" }], playPoints: 8 },
      opp: { cemetery: ["KILL"], field: ["V5"] },
    });
    t.activate("BP05-018");
    // V5 is destroyed while KILL resolves; KILL then goes to its owner's cemetery.
    expect([t.pp(), t.field("opp"), t.cemetery("opp")]).toEqual([0, [], ["V5", "KILL"]]);
  });
});
