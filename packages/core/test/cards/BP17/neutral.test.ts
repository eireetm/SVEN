import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP17 Neutral (110–119). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); KILL (1) is a spell. BP07-104 / 105 Viridia Magna
// (Natura); BP17-003 an evolved Natura follower; BP01-176 Angelic Sword Maiden (an Angel, Ward); BP17-009 a Natura card;
// BP17-077 a Machina follower. Tokens: BP07-T01 Assembly Droid, BP07-T02 Repair Mode, BP07-T03 Naterran Great Tree.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const DROID = "BP07-T01";
const REPAIR = "BP07-T02";
const TREE = "BP07-T03";
const MAISHA = { card: "BP17-110", evolvedInto: "BP17-111" };
const n = (count: number, id = "V1") => Array<string>(count).fill(id);

describe("BP17 Neutral", () => {
  it("110 / 111 Maisha, Purgation's Vessel — evolved: draw; Storm with 10 followers in the cemetery; act (0) once per turn: 4 damage per 5 followers there", () => {
    expect(d({ me: { field: ["BP17-110"], evolveDeck: ["BP17-111"], deck: ["V1"], playPoints: 1 } }).evolve("BP17-110").hand()).toEqual(["V1"]);
    expect(d({ me: { field: [MAISHA], cemetery: n(10) } }).keywords("BP17-110")).toEqual(["storm"]);
    expect(d({ me: { field: [MAISHA], cemetery: [...n(9), "KILL"] } }).keywords("BP17-110")).toEqual([]);
    const t = d({ me: { field: [MAISHA], cemetery: [...n(5), ...n(4, "KILL")] }, opp: { field: ["V5"] } }).activate("BP17-110");
    expect([t.stats("opp:V5"), t.canActivate("BP17-110")]).toEqual([[5, 1], false]);
    expect(d({ me: { field: [MAISHA], cemetery: n(10) }, opp: { field: ["V5"] } }).activate("BP17-110").field("opp")).toEqual([]);
  });

  it("112 Great Mother's Embrace — up to 2 of destroy, a Viridia Magna from the deck, and turn 2 faceup evolved Natura followers facedown: draw, recover 2", () => {
    const t = d({ me: { hand: ["BP17-112"], deck: ["BP07-104", "V1"], playPoints: 5 }, opp: { field: ["V5"] } }).play("BP17-112").choose("destroy", "search").pick("BP07-104");
    expect([t.field(), t.field("opp")]).toEqual([["BP07-104"], []]);
    const f = d({ me: { hand: ["BP17-112"], faceUpEvolveDeck: ["BP07-105", "BP17-003"], deck: ["V1"], playPoints: 5 } }).play("BP17-112").choose("facedown").yes();
    expect([f.hand(), f.pp(), f.game.state.cards[f.id("BP17-003")]!.faceUp]).toEqual([["V1"], 2, false]);
    const one = d({ me: { hand: ["BP17-112"], faceUpEvolveDeck: ["BP07-105"], deck: ["V1"], playPoints: 5 } }).play("BP17-112").choose("facedown");
    expect([one.hand(), one.pp()]).toEqual([[], 0]);
  });

  it("113 / 114 Hoverboard Mercenary — Fanfare and evolved: an Assembly Droid and a Repair Mode", () => {
    const t = d({ me: { hand: ["BP17-113"], playPoints: 2 } }).play("BP17-113");
    expect([t.field(), t.ex()]).toEqual([["BP17-113", DROID], [REPAIR]]);
    const e = d({ me: { field: ["BP17-113"], evolveDeck: ["BP17-114"], playPoints: 1 } }).evolve("BP17-113");
    expect([e.field(), e.ex()]).toEqual([["BP17-113", DROID], [REPAIR]]);
  });

  it("115 Cosmic Angel — Ward; Fanfare: another Angel card from the deck, leader +2 with 5 Angel cards in the cemetery", () => {
    const t = d({ me: { hand: ["BP17-115"], deck: ["BP17-115", "BP01-176"], playPoints: 3 } }).play("BP17-115").none().pick("BP01-176");
    expect([t.hand(), t.leader()]).toEqual([["BP01-176"], 20]);
    const five = d({ me: { hand: ["BP17-115"], cemetery: n(5, "BP01-176"), playPoints: 3 } }).play("BP17-115").none();
    expect(five.leader()).toBe(22);
  });

  it("116 Guild Assembly — Quick; additional cost: turn a facedown evolved follower faceup; 3 damage", () => {
    const t = d({ me: { hand: ["BP17-116"], evolveDeck: ["BP17-003"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP17-116");
    expect([t.stats("opp:V5"), t.game.state.cards[t.id("BP17-003")]!.faceUp]).toEqual([[5, 2], true]);
    expect(d({ me: { hand: ["BP17-116"], faceUpEvolveDeck: ["BP17-003"], playPoints: 2 }, opp: { field: ["V5"] } }).canPlay("BP17-116")).toBe(false);
    expect(d({ me: { hand: ["BP17-116"], evolveDeck: ["BP17-003"], playPoints: 2 } }).canPlay("BP17-116")).toBe(false);
  });

  it("117 Naterra's Future — a Natura card on top may go to the hand (else it stays on top); a Naterran Great Tree into the EX area", () => {
    const t = d({ me: { hand: ["BP17-117"], deck: ["BP17-009", "V1"], playPoints: 1 } }).play("BP17-117").pick("BP17-009");
    expect([t.hand(), t.ex()]).toEqual([["BP17-009"], [TREE]]);
    const left = d({ me: { hand: ["BP17-117"], deck: ["BP17-009", "V1"], playPoints: 1 } }).play("BP17-117").none();
    expect([left.hand(), left.zone("me", "deck")]).toEqual([[], ["BP17-009", "V1"]]);
  });

  it("118 Unnamed Determination — a Maisha follower from the deck into the EX area, 1 less this turn with 5 followers in the cemetery", () => {
    const t = d({ me: { hand: ["BP17-118"], deck: ["V1", "BP17-110"], cemetery: n(5), playPoints: 2 } }).play("BP17-118").pick("BP17-110");
    expect([t.ex(), t.canPlay("BP17-110@ex")]).toEqual([["BP17-110"], true]);
    const four = d({ me: { hand: ["BP17-118"], deck: ["BP17-110"], cemetery: n(4), playPoints: 2 } }).play("BP17-118").pick("BP17-110");
    expect(four.canPlay("BP17-110@ex")).toBe(false);
  });

  it("119 Aiolon's Remains — Fanfare, discard a Machina card: draw 2, recover 1 with 3 Machina cards in the EX area; act, engage and bury it: a Machina follower +0/+1 or leader +1", () => {
    const t = d({ me: { hand: ["BP17-119", "BP17-077"], ex: [DROID, REPAIR, "BP17-077"], deck: ["V1", "V3"], playPoints: 2 } }).play("BP17-119").yes();
    expect([t.hand(), t.pp()]).toEqual([["V1", "V3"], 1]);
    const f = d({ me: { field: ["BP17-119", "BP17-077"] } }).activate("BP17-119").choose("follower");
    expect([f.stats("BP17-077"), f.field()]).toEqual([[1, 2], ["BP17-077"]]);
    expect(d({ me: { field: ["BP17-119"] } }).activate("BP17-119").leader()).toBe(21);
  });
});
