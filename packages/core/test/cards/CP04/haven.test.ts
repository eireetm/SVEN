import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// CP04 Havencraft (091–108, T12), Princess Connect! Re: Dive. Both decks are based on the universe (CR 14.5.1.2). V1 is 1c 2/2,
// V3 3c 3/4, V5 5c 5/5 (Neutral); AMULET is a 1-cost amulet. CP04-105 Suzume (2c; UB Fanfare: leader +2) executes a Union Burst
// ability. Sarendia Orphanage followers: CP04-105 Suzume (2c), CP04-107 Kurumi (1c). CP04-102 Threading Snare is a Carmina amulet,
// CP04-005 Shiori an Elizabeth Park follower, CP04-072 Prank Proclamation an amulet.
const E = cardEngine();
const PC = { universe: "princessConnect" as const };
const d = (spec: DriveSpec) => drive(E, { ...spec, me: { ...PC, ...spec.me }, opp: { ...PC, ...spec.opp } });

describe("CP04 Havencraft", () => {
  it("091 / T12 Saren — Fanfare: choose 1 (up to 2 at 10 defense or less): a Glorious Feather, or Sarendia Orphanage followers costing 3 in all", () => {
    expect(d({ me: { hand: ["CP04-091"], playPoints: 5 } }).play("CP04-091").choose("1").zone("me", "equipmentZone")).toEqual(["CP04-T12"]);
    const t = d({ me: { hand: ["CP04-091"], deck: ["CP04-105", "CP04-107"], leaderDefense: 10, playPoints: 5 } }).play("CP04-091").choose("1", "2");
    t.pick("CP04-105").pick("CP04-107").flush();
    expect([t.field(), t.zone("me", "equipmentZone"), t.leader()]).toEqual([["CP04-091", "CP04-105", "CP04-107"], ["CP04-T12"], 12]);
    // Glorious Feather: +1 damage dealt, and leader +3 at the start of your end phase.
    const g = d({ me: { field: [{ card: "V1", equipped: ["CP04-T12"] }] }, opp: { field: [{ card: "V3", engaged: true }] } }).attack("V1", "opp:V3");
    expect(g.stats("opp:V3")).toEqual([3, 1]);
    expect(d({ me: { field: [{ card: "V1", equipped: ["CP04-T12"] }] }, opp: { deck: ["V1"] } }).end().leader()).toBe(23);
  });

  it("092 Saren (Evolved) — UB On Evolve: 4 damage and 1 to each other enemy follower; super-evolved: 2 to each enemy", () => {
    const t = d({ me: { field: ["CP04-091"], evolveDeck: ["CP04-092"], playPoints: 1 }, opp: { field: ["V5", "V3"] } }).evolve("CP04-091").pick("opp:V5");
    expect([t.stats("opp:V5"), t.stats("opp:V3")]).toEqual([[5, 1], [3, 3]]);
  });

  it("093 Nozomi — UB Fanfare: an amulet from the deck; act, engage an amulet: 1 damage; act, engage, bury 3 amulets: 3 to a follower and its leader", () => {
    expect(d({ me: { hand: ["CP04-093"], deck: ["V1", "AMULET"], playPoints: 3 } }).play("CP04-093").pick("AMULET").hand()).toEqual(["AMULET"]);
    const a = d({ me: { field: ["CP04-093", "AMULET"] }, opp: { field: ["V5"] } }).activate("CP04-093");
    expect([a.stats("opp:V5"), a.engaged("AMULET")]).toEqual([[5, 4], true]);
    const b = d({ me: { field: ["CP04-093", "AMULET", "AMULET", "AMULET"] }, opp: { field: ["V5"] } }).activate("CP04-093", 1);
    expect([b.stats("opp:V5"), b.leader("opp"), b.field()]).toEqual([[5, 2], 17, ["CP04-093"]]);
  });

  it("094 Akino — Ward; Fanfare: leader +3, draw 3; UB Activate: up to 2 enemy followers take damage equal to your hand", () => {
    const t = d({ me: { hand: ["CP04-094"], deck: ["V1", "V1", "V1"], playPoints: 7 } }).play("CP04-094").none();
    expect([t.leader(), t.hand().length, t.keywords("CP04-094")]).toEqual([23, 3, ["ward"]]);
    const a = d({ me: { field: ["CP04-094"], hand: ["V1", "V1"] }, opp: { field: ["V5", "V3"] } }).activate("CP04-094").pick("opp:V5", "opp:V3");
    expect([a.stats("opp:V5"), a.stats("opp:V3")]).toEqual([[5, 3], [3, 2]]);
  });

  it("095 / 096 Yui — evolved UB On Evolve (X): a PriConne follower costing X or less from the cemetery; another's UB: leader +1", () => {
    const t = d({ me: { field: ["CP04-095"], evolveDeck: ["CP04-096"], cemetery: ["CP04-105"], playPoints: 3 } }).evolve("CP04-095").yes().flush();
    expect([t.field(), t.pp(), t.leader()]).toEqual([["CP04-095", "CP04-105"], 0, 23]);
    expect(d({ me: { field: ["CP04-095"], evolveDeck: ["CP04-096"], cemetery: ["CP04-105"], playPoints: 2 } }).evolve("CP04-095").field()).toEqual(["CP04-095"]);
  });

  it("097 Clear — UB Fanfare: 1 damage to the enemy leader; another's UB: 1 more", () => {
    expect(d({ me: { hand: ["CP04-097"], playPoints: 2 } }).play("CP04-097").leader("opp")).toBe(19);
    expect(d({ me: { field: ["CP04-097"], hand: ["CP04-105"], playPoints: 2 } }).play("CP04-105").flush().leader("opp")).toBe(19);
  });

  it("098 Yukari — Ward; UB Fanfare, engage an amulet: another follower +2 defense; act, engage: refresh your amulets", () => {
    const t = d({ me: { hand: ["CP04-098"], field: ["AMULET", "V1"], playPoints: 2 } }).play("CP04-098").none().yes();
    expect([t.stats("V1"), t.engaged("AMULET")]).toEqual([[2, 4], true]);
    const a = d({ me: { field: ["CP04-098", { card: "AMULET", engaged: true }, { card: "AMULET", engaged: true }] } }).activate("CP04-098");
    expect(a.ids("AMULET").map((id) => a.game.state.cards[id]!.engaged)).toEqual([false, false]);
  });

  it("099 / 100 Chika — act, engage an amulet: another follower gets Rush, Bane or Ward; evolved UB: a Carmina card from the deck", () => {
    expect(d({ me: { field: ["CP04-099", "AMULET", "V1"] } }).activate("CP04-099").choose("bane").keywords("V1")).toEqual(["bane"]);
    expect(d({ me: { field: ["CP04-099"], evolveDeck: ["CP04-100"], deck: ["CP04-102"], playPoints: 1 } }).evolve("CP04-099").pick("CP04-102").hand()).toEqual(["CP04-102"]);
  });

  it("101 Misato — Ward; UB Fanfare, bury an amulet: leader +2", () => {
    const t = d({ me: { hand: ["CP04-101"], field: ["AMULET"], playPoints: 1 } }).play("CP04-101").none().yes();
    expect([t.leader(), t.cemetery()]).toEqual([22, ["AMULET"]]);
  });

  it("102 Threading Snare — Fanfare: 3 damage; when engaged, 1 damage to an enemy leader or follower; Last Words: the same", () => {
    expect(d({ me: { hand: ["CP04-102"], playPoints: 2 }, opp: { field: ["V5"] } }).play("CP04-102").stats("opp:V5")).toEqual([5, 2]);
    const t = d({ me: { field: ["CP04-102", "CP04-093"] }, opp: { field: ["V5"] } }).activate("CP04-093").pick("opp:leader");
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[5, 4], 19]);
  });

  it("103 / 104 Mimi — Fanfare: a Prank Proclamation from the deck; evolved UB, engage X amulets: 2 damage to up to X enemy followers", () => {
    expect(d({ me: { hand: ["CP04-103"], deck: ["V1", "CP04-072"], playPoints: 2 } }).play("CP04-103").pick("CP04-072").hand()).toEqual(["CP04-072"]);
    const t = d({ me: { field: ["CP04-103", "AMULET", "AMULET"], evolveDeck: ["CP04-104"], playPoints: 2 }, opp: { field: ["V5", "V3"] } });
    t.evolve("CP04-103").yes().pick("opp:V5", "opp:V3");
    expect([t.stats("opp:V5"), t.stats("opp:V3"), t.ids("AMULET").every((id) => t.game.state.cards[id]!.engaged)]).toEqual([[5, 3], [3, 2], true]);
  });

  it("105 Suzume — UB Fanfare: leader +2", () => {
    expect(d({ me: { hand: ["CP04-105"], playPoints: 2 } }).play("CP04-105").leader()).toBe(22);
  });

  it("106 Mahiru — UB Activate, engage this and another card: an enemy follower into its owner's EX area; Fanfare: an Elizabeth Park card into the EX area", () => {
    const t = d({ me: { field: ["CP04-106", "V1"] }, opp: { field: ["V5"] } }).activate("CP04-106");
    expect([t.ex("opp"), t.engaged("V1")]).toEqual([["V5"], true]);
    expect(d({ me: { hand: ["CP04-106"], deck: ["CP04-005"], playPoints: 3 } }).play("CP04-106").pick("CP04-005").ex()).toEqual(["CP04-005"]);
  });

  it("107 Kurumi — UB Fanfare: engage an enemy follower", () => {
    expect(d({ me: { hand: ["CP04-107"], playPoints: 1 }, opp: { field: ["V5"] } }).play("CP04-107").engaged("opp:V5")).toBe(true);
  });

  it("108 Amped on Acorns — Fanfare: may take the top card if it's a PriConne card; when engaged, leader +1", () => {
    expect(d({ me: { hand: ["CP04-108"], deck: ["CP04-001"], playPoints: 1 } }).play("CP04-108").pick("CP04-001").hand()).toEqual(["CP04-001"]);
    expect(d({ me: { field: ["CP04-108", "CP04-093"] }, opp: { field: ["V5"] } }).activate("CP04-093").leader()).toBe(21);
  });
});
