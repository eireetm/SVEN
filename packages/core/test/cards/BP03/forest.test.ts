import { describe, expect, it } from "vitest";
import { createEngine } from "../../../src";
import { defineCard, spell } from "../../../src/script/helpers";
import { BP03_CARDS, BP03_SCRIPTS } from "../../../src/sets/bp03";
import { drive, testSpell, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP03 Forestcraft (001–017). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5, ZERO 1c 0/3.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const FAIRY = "BP01-T03";

const PLAYCEM = testSpell("PLAYCEM", 0, { text: "Play one card from your cemetery." });
const fromCemetery = createEngine({
  cards: [...BP03_CARDS, PLAYCEM],
  scripts: {
    ...BP03_SCRIPTS,
    PLAYCEM: defineCard({
      abilities: [
        spell({
          *resolve(fx) {
            const [id] = yield* fx.selectCards(fx.game.cards(fx.controller, "cemetery"), 1, 1);
            if (id) yield* fx.playCard(id, { cost: 0 });
          },
        }),
      ],
    }),
  },
});

describe("BP03 Forestcraft", () => {
  it("001 Beauty and the Beast — Rush, Aura, a Fable counter; Storm only when played from outside hand; Act +X/+X", () => {
    const played = d({ me: { hand: ["BP03-001"], playPoints: 6 }, opp: { field: [{ card: "V1", engaged: true }] } }).play("BP03-001");
    expect(played.keywords("BP03-001")).toEqual(["rush", "aura"]);
    expect(played.counters("BP03-001", "fable")).toBe(1);
    expect(played.attackTargets("BP03-001")).toEqual(["V1"]);
    played.attack("BP03-001", "opp:V1");
    expect([played.field("opp"), played.stats("BP03-001")]).toEqual([[], [5, 5]]);

    const aura = d({ turn: 6, me: { field: ["BP03-001", "V1"] }, opp: { hand: ["BP01-179"], playPoints: 1 } });
    expect(aura.canPlay("opp:BP01-179")).toBe(true);
    aura.play("opp:BP01-179");
    expect(aura.field()).toEqual(["BP03-001"]);
    expect(d({ turn: 6, me: { field: ["BP03-001"] }, opp: { hand: ["BP01-179"], playPoints: 1 } }).canPlay("opp:BP01-179")).toBe(false);

    const storm = drive(fromCemetery, { me: { hand: ["PLAYCEM"], cemetery: ["BP03-001"] } }).play("PLAYCEM");
    expect(storm.keywords("BP03-001")).toEqual(["rush", "aura", "storm"]);
    expect(storm.counters("BP03-001", "fable")).toBe(1);

    const act = d({ me: { field: [{ card: "BP03-001", counters: { fable: 3 } }], playPoints: 1 } });
    act.activate("BP03-001").choose("2");
    expect([act.stats("BP03-001"), act.counters("BP03-001", "fable"), act.pp()]).toEqual([[7, 9], 1, 0]);
  });

  it("002 / 003 Cosmos Fang — search a Beast; a 2-cost one may enter; evolve returns or destroys", () => {
    const cheap = d({ me: { hand: ["BP03-002"], deck: ["BP03-009", "V5"], playPoints: 5 } });
    cheap.play("BP03-002").pick("BP03-009").yes();
    expect(cheap.field()).toEqual(["BP03-002", "BP03-009"]);
    // "Instead": straight from the deck onto the field, never through the hand.
    expect(cheap.game.state.cards[cheap.id("BP03-009")]!.enteredFrom).toBe("deck");
    const keep = d({ me: { hand: ["BP03-002"], deck: ["BP03-009", "V5"], playPoints: 5 } });
    keep.play("BP03-002").pick("BP03-009").no();
    expect([keep.hand(), keep.field()]).toEqual([["BP03-009"], ["BP03-002"]]);
    const pricey = d({ me: { hand: ["BP03-002"], deck: ["BP03-001", "V5"], playPoints: 5 } });
    pricey.play("BP03-002").pick("BP03-001");
    expect(pricey.decision?.type).toBe("mainPhase");
    expect(pricey.hand()).toEqual(["BP03-001"]);
    const skip = d({ me: { hand: ["BP03-002"], deck: ["BP03-009", "V5"], playPoints: 5 } }).play("BP03-002").none();
    expect(skip.hand()).toEqual([]);

    // The evolve cost returns another follower: an amulet cannot pay it.
    expect(d({ me: { field: ["BP03-002", "AMULET"], evolveDeck: ["BP03-003"], playPoints: 1 } }).canEvolve("BP03-002")).toBe(false);
    const base = { me: { field: ["BP03-002", "V1"], evolveDeck: ["BP03-003"], playPoints: 1 } };
    const destroy = d({ ...base, opp: { field: ["V5", { card: "BP03-014", evolvedInto: "BP03-015" }] } });
    destroy.evolve("BP03-002").pick("opp:BP03-014");
    expect(destroy.stats("BP03-002")).toEqual([5, 5]);
    expect(destroy.hand()).toEqual(["V1"]);
    expect(destroy.field("opp")).toEqual(["V5"]);
    expect(destroy.cemetery("opp")).toEqual(["BP03-014"]);
    expect(destroy.zone("opp", "evolveDeck")).toEqual(["BP03-015"]);
    const bounce = d({ ...base, opp: { field: ["V5", { card: "BP03-014", evolvedInto: "BP03-015" }] } });
    bounce.evolve("BP03-002").pick("opp:V5");
    expect([bounce.hand("opp"), bounce.field("opp")]).toEqual([["V5"], ["BP03-014"]]);
  });

  it("004 Magical Fairy, Lilac — engage for a Fable counter, then spend it to destroy", () => {
    const t = d({ me: { field: ["BP03-004"], playPoints: 1 }, opp: { field: ["V5", "V3"] } });
    expect(t.canActivate("BP03-004")).toBe(true);
    t.activate("BP03-004");
    expect([t.counters("BP03-004", "fable"), t.engaged("BP03-004")]).toEqual([1, true]);
    t.activate("BP03-004").pick("opp:V5");
    expect([t.field("opp"), t.counters("BP03-004", "fable"), t.pp()]).toEqual([["V3"], 0, 0]);
    expect(d({ me: { field: ["BP03-004"] } }).canActivate("BP03-004", )).toBe(true);
  });

  it("005 / 006 Slade, Blossoming Wolf — evolve after a return; replay a cheap Elf, including itself", () => {
    expect(d({ me: { field: ["BP03-005"], evolveDeck: ["BP03-006"] } }).canEvolve("BP03-005")).toBe(false);
    const evo = d({
      me: { field: ["BP03-005"], hand: ["BP03-016"], evolveDeck: ["BP03-006"], deck: ["V1"], playPoints: 1, returnedToHand: 1 },
    });
    evo.evolve("BP03-005");
    expect([evo.stats("BP03-005"), evo.hand()]).toEqual([[3, 3], ["BP03-016", "V1"]]);
    evo.play("BP03-016").yes();
    expect(evo.field()).toEqual(["BP03-005"]);
    expect(evo.zone("me", "evolveDeck")).toEqual(["BP03-006"]);
    expect(evo.leader()).toBe(21);

    const other = d({ me: { field: ["BP03-005"], hand: ["BP03-016", "BP03-014"], playPoints: 1 } });
    other.play("BP03-016").yes().pick("BP03-014");
    expect([other.field(), other.hand(), other.leader()]).toEqual([["BP03-014"], ["BP03-005"], 21]);
    const decline = d({ me: { field: ["BP03-005"], hand: ["BP03-016"], playPoints: 1 } }).play("BP03-016").no();
    expect([decline.field(), decline.hand(), decline.leader()]).toEqual([[], ["BP03-005"], 21]);
  });

  it("007 Elf Twins' Assault — X divided between up to 2 enemies, X equal to your EX area", () => {
    // X = 3 between two followers: at least 1 each (rulings BP08-028 / EBD02-015).
    const t = d({ me: { hand: ["BP03-007"], ex: ["V1", "V2", "V3"], playPoints: 2 }, opp: { field: ["V5", "V3"] } });
    t.play("BP03-007").pick("opp:V5", "opp:V3");
    const split = t.decision?.type === "choose" ? t.decision : null;
    expect([split?.reason, split?.options.map((o) => o.id), split?.subject?.def]).toEqual(["divideDamage", ["1", "2"], "V5"]);
    t.choose("2");
    expect([t.stats("opp:V5"), t.stats("opp:V3")]).toEqual([[5, 3], [3, 3]]);
    // X = 1: only one follower can be selected; X = 0: none.
    const one = d({ me: { hand: ["BP03-007"], ex: ["V1"], playPoints: 2 }, opp: { field: ["V5", "V3"] } }).play("BP03-007");
    expect(one.decision).toMatchObject({ type: "selectCards", min: 0, max: 1 });
    const none = d({ me: { hand: ["BP03-007"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP03-007");
    expect([none.decision?.type, none.stats("opp:V5")]).toEqual(["mainPhase", [5, 5]]);
    // Two Diamond Masters must both be selected when X allows (ruling), and each gets damage.
    const dm = d({ me: { hand: ["BP03-007"], ex: ["V1", "V2"], playPoints: 2 }, opp: { field: ["BP03-091", "BP03-091", "V1"] } });
    dm.play("BP03-007");
    expect(dm.decision).toMatchObject({ type: "selectCards", min: 2, max: 2 });
    const all = d({ me: { hand: ["BP03-007"], ex: ["V1", "V2", "V3"], playPoints: 2 }, opp: { field: ["V5"] } });
    all.play("BP03-007").pick("opp:V5");
    expect(all.stats("opp:V5")).toEqual([5, 2]);
  });

  it("008 Abby the Axe Girl — Strike +1 attack, then 2 to the enemy leader once attack reaches 5", () => {
    const once = d({ me: { field: ["BP03-008"] }, opp: { field: [{ card: "ZERO", engaged: true }] } });
    once.attack("BP03-008", "opp:ZERO");
    expect([once.stats("BP03-008"), once.leader("opp"), once.field("opp")]).toEqual([[4, 4], 20, []]);
    const five = d({ me: { hand: ["BUFF-SOME"], field: ["BP03-008"] }, opp: { field: [{ card: "ZERO", engaged: true }] } });
    five.play("BUFF-SOME").pick("BP03-008").attack("BP03-008", "opp:ZERO");
    expect([five.stats("BP03-008"), five.leader("opp")]).toEqual([[5, 5], 18]);
  });

  it("009 / 010 Gerbera Bear — +1 leader defense per card returned, including itself; evolved searches Floral Breeze", () => {
    const self = d({ me: { field: ["BP03-009"], hand: ["BP03-016"], playPoints: 1 } }).play("BP03-016");
    expect([self.leader(), self.hand(), self.field()]).toEqual([22, ["BP03-009"], []]);
    const both = d({ me: { field: ["BP03-009", "BP03-009"], hand: ["BP03-016"], playPoints: 1 } });
    both.play("BP03-016").pick("BP03-009").flush();
    expect([both.leader(), both.field().length, both.hand()]).toEqual([23, 1, ["BP03-009"]]);

    const evo = d({
      me: { field: ["BP03-009", "V1"], hand: ["BP03-016"], evolveDeck: ["BP03-010"], deck: ["BP03-016", "V5"], playPoints: 2 },
    });
    evo.evolve("BP03-009").pick("BP03-016");
    expect(evo.stats("BP03-009")).toEqual([3, 3]);
    expect(evo.hand()).toContain("BP03-016");
    evo.play("BP03-016").pick("V1");
    expect([evo.leader(), evo.field(), evo.hand()]).toEqual([22, ["BP03-009"], ["BP03-016", "V1"]]);
  });

  it("011 Wood of Brambles — Fairy, Combo Rush that summoning does not count, strike 2, destroy next main phase", () => {
    const plain = d({ me: { hand: ["BP03-011"], playPoints: 1 } }).play("BP03-011");
    expect(plain.field()).toEqual(["BP03-011", FAIRY]);
    expect(plain.keywords(FAIRY)).toEqual([]);
    const combo = d({ me: { hand: ["V1", "V1", "BP03-011"], playPoints: 3 }, opp: { field: [{ card: "V2", engaged: true }] } });
    combo.play("V1").play("V1").play("BP03-011");
    expect(combo.keywords(FAIRY)).toEqual(["rush"]);
    expect(combo.attackTargets(FAIRY)).toEqual(["V2"]);
    const notAPlay = d({ me: { hand: ["BP03-011", "BP03-012"], playPoints: 3 } }).play("BP03-011").play("BP03-012");
    expect(notAPlay.counters("BP03-012", "fable")).toBe(0);

    const strike = d({ me: { field: ["BP03-011", "V5"] }, opp: { field: [{ card: "V1", engaged: true }] } });
    strike.attack("V5", "opp:V1");
    expect([strike.field("opp"), strike.stats("V5")]).toEqual([[], [5, 5]]);
    const aura = d({ me: { field: ["BP03-011", "V5"] }, opp: { field: [{ card: "BP03-001", engaged: true }] } });
    aura.attack("V5", "opp:BP03-001");
    expect([aura.field(), aura.field("opp")]).toEqual([["BP03-011"], []]);
    // The follower has the ability, so the follower deals the damage (CR 10.9.1.2); two Woods
    // give it twice.
    const two = d({ me: { field: ["BP03-011", "BP03-011", "V1"] }, opp: { field: [{ card: "V5", engaged: true }] } });
    two.attack("V1", "opp:V5");
    const pending = two.game.state.pending.map((p) => [p.sourceDef, two.game.state.cards[p.source]?.def]);
    expect(pending).toEqual([
      ["grant:followerStrike2", "V1"],
      ["grant:followerStrike2", "V1"],
    ]);
    two.flush(); // 2 + 2 from the Strikes, then 2 combat damage: the 5/5 is destroyed
    expect(two.field("opp")).toEqual([]);
    const one = d({ me: { field: ["BP03-011", "V1"] }, opp: { field: [{ card: "V5", engaged: true }] } });
    one.attack("V1", "opp:V5");
    expect(one.stats("opp:V5@field")).toEqual([5, 1]);

    const gone = d({ me: { hand: ["BP03-011"], deck: ["V1"], playPoints: 1 }, opp: { deck: ["V1"] } });
    gone.play("BP03-011").end().end();
    expect(gone.field()).toEqual([FAIRY]);
    expect(gone.cemetery()).toEqual(["BP03-011"]);
  });

  it("012 Flower Princess — a Fairy in EX, Combo Fable counter, engage to deal 3", () => {
    const plain = d({ me: { hand: ["BP03-012"], playPoints: 2 } }).play("BP03-012");
    expect([plain.ex(), plain.counters("BP03-012", "fable"), plain.canActivate("BP03-012")]).toEqual([[FAIRY], 0, false]);
    const combo = d({ me: { hand: ["V1", "V1", "BP03-012"], playPoints: 4 }, opp: { field: ["V5", "V3"] } });
    combo.play("V1").play("V1").play("BP03-012");
    expect(combo.counters("BP03-012", "fable")).toBe(1);
    combo.activate("BP03-012").pick("opp:V5");
    expect([combo.stats("opp:V5"), combo.engaged("BP03-012"), combo.counters("BP03-012", "fable")]).toEqual([[5, 2], true, 0]);
  });

  it("013 Fen Sprite — the chosen enemy cannot attack on its next turn", () => {
    const t = d({
      me: { hand: ["BP03-013"], deck: ["V1", "V1"], playPoints: 3 },
      opp: { field: ["V5", "V1"], deck: ["V1", "V1"] },
    });
    t.play("BP03-013").pick("opp:V5").end();
    expect(t.attackTargets("opp:V5")).toEqual([]);
    expect(t.attackTargets("opp:V1")).toContain("opp:leader");
    t.end().end();
    expect(t.attackTargets("opp:V5")).toContain("opp:leader");
  });

  it("014 / 015 Tweedle Dum, Tweedle Dee — evolve, then may take a 1-cost card from the top 4", () => {
    const t = d({ me: { field: ["BP03-014"], evolveDeck: ["BP03-015"], deck: ["V1", "V5"], playPoints: 1 } });
    t.evolve("BP03-014").pick("V1");
    expect([t.stats("BP03-014"), t.hand(), t.zone("me", "deck")]).toEqual([[3, 3], ["V1"], ["V5"]]);
    const skip = d({ me: { field: ["BP03-014"], evolveDeck: ["BP03-015"], deck: ["V2"], playPoints: 1 } });
    skip.evolve("BP03-014");
    expect([skip.hand(), skip.zone("me", "deck")]).toEqual([[], ["V2"]]);
  });

  it("016 Floral Breeze — return one of your cards and give your leader +1 defense", () => {
    const t = d({ me: { hand: ["BP03-016"], field: ["V1", "V2"], playPoints: 1 } }).play("BP03-016").pick("V2");
    expect([t.field(), t.hand(), t.leader()]).toEqual([["V1"], ["V2"], 21]);
  });

  it("017 Woodland Band — a Fable follower from the top 4 into EX; bury to add a Fable counter", () => {
    const t = d({
      me: { hand: ["BP03-017"], field: ["BP03-004"], deck: ["BP03-014", "V2"], playPoints: 1 },
    });
    t.play("BP03-017").pick("BP03-014");
    expect([t.ex(), t.zone("me", "deck")]).toEqual([["BP03-014"], ["V2"]]);
    t.activate("BP03-017");
    expect([t.counters("BP03-004", "fable"), t.field(), t.cemetery()]).toEqual([1, ["BP03-004"], ["BP03-017"]]);
    const skip = d({ me: { hand: ["BP03-017"], deck: ["BP03-014"], playPoints: 1 } }).play("BP03-017").none();
    expect([skip.ex(), skip.zone("me", "deck")]).toEqual([[], ["BP03-014"]]);
  });
});
