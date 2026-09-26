import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP10 Dragoncraft (054–073). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); FAN-DMG deals 1 to an enemy
// follower (2); QUICK-SAC destroys one of your followers. BP02-T07 Draconic Weapon (an amulet token);
// BP03-056 Lævateinn Dragon; Armed cards: BP10-064, BP10-070; BP08-044 Morra draws, then discards.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const WEAPON = "BP02-T07";
const ARMED = ["BP10-064", "BP10-064", "BP10-064", "BP10-070", "BP10-070"];

describe("BP10 Dragoncraft", () => {
  it("054 / 055 Erntz — Ward; the top card into the EX area; if it costs 5 or more, evolves or returns to the hand; leaving the field: leader +8; evolved: Storm, ignores Ward", () => {
    const evolve = d({ me: { hand: ["BP10-054"], deck: ["V5"], evolveDeck: ["BP10-055"], playPoints: 8 } }).play("BP10-054").none().yes();
    expect([evolve.ex(), evolve.game.reader().info(evolve.id("BP10-054")).evolved, evolve.keywords("BP10-054")]).toEqual([["V5"], true, ["storm"]]);
    const back = d({ me: { hand: ["BP10-054"], deck: ["V5"], evolveDeck: ["BP10-055"], playPoints: 8 } }).play("BP10-054").none().no();
    expect([back.hand(), back.leader()]).toEqual([["BP10-054"], 28]);
    const cheap = d({ me: { hand: ["BP10-054"], deck: ["V1"], evolveDeck: ["BP10-055"], playPoints: 8 } }).play("BP10-054").none();
    expect([cheap.field(), cheap.ex()]).toEqual([["BP10-054"], ["V1"]]);
    // The evolved Erntz ignores Ward.
    const ward = d({ me: { field: [{ card: "BP10-054", evolvedInto: "BP10-055" }] }, opp: { field: [{ card: "WARD", engaged: true }, { card: "V1", engaged: true }] } });
    expect(ward.attackTargets("BP10-054").sort()).toEqual(["V1", "WARD", "opp:leader"]);
  });

  it("056 / T02 Aiela and Devoted Dragon — max PP +1 and recover 2, or with Overflow a Devoted Dragon and leader +2; the Dragon takes no ability damage while Aiela is on the field", () => {
    const points = d({ me: { hand: ["BP10-056"], playPoints: 5, maxPlayPoints: 5 } }).play("BP10-056").choose("points");
    expect([points.pp(), points.game.state.players[0].maxPlayPoints]).toEqual([2, 6]);
    const dragon = d({ me: { hand: ["BP10-056"], playPoints: 7, maxPlayPoints: 7 } }).play("BP10-056").choose("dragon").none();
    expect([dragon.field(), dragon.leader(), dragon.keywords("BP10-T02")]).toEqual([["BP10-056", "BP10-T02"], 22, ["ward"]]);
    const noOverflow = d({ me: { hand: ["BP10-056"], playPoints: 5, maxPlayPoints: 5 } }).play("BP10-056").choose("dragon");
    expect(noOverflow.field()).toEqual(["BP10-056"]);
    const shielded = d({ me: { hand: ["FAN-DMG"], playPoints: 2 }, opp: { field: ["BP10-056", "BP10-T02"] } }).play("FAN-DMG").pick("opp:BP10-T02");
    expect(shielded.stats("opp:BP10-T02")).toEqual([6, 6]);
    const alone = d({ me: { hand: ["FAN-DMG"], playPoints: 2 }, opp: { field: ["BP10-T02"] } }).play("FAN-DMG");
    expect(alone.stats("opp:BP10-T02")).toEqual([6, 5]);
  });

  it("057 Dual Form α — advanced; Rush; Strike: 4 damage and leader +2; Last Words: a Lævateinn Dragon from the cemetery onto the field engaged", () => {
    const t = d({ me: { field: ["BP10-057"] }, opp: { field: ["V5"] } }).attack("BP10-057", "opp:leader");
    expect([t.stats("opp:V5"), t.leader(), t.leader("opp"), t.keywords("BP10-057")]).toEqual([[5, 1], 22, 14, ["rush"]]);
    const lw = d({ me: { field: ["BP10-057"], cemetery: ["BP03-056"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC");
    // CR 9.2.2: the advanced card itself goes faceup into the evolve deck.
    const faceUp = lw.game.reader().faceUpEvolveDeck(0).map((id) => lw.game.state.cards[id]!.def);
    expect([lw.field(), lw.engaged("BP03-056"), faceUp, lw.cemetery()]).toEqual([["BP03-056"], true, ["BP10-057"], ["QUICK-SAC"]]);
  });

  it("058 Dual Form β — advanced; Ward; Fanfare: 2 to each enemy follower, leader +4; act (1, bury a Draconic Weapon), once per turn: draw, may summon a cheap Armed follower from the hand", () => {
    const t = d({ me: { ex: ["BP10-058"], playPoints: 6 }, opp: { field: ["V3", "V1"] } }).play("BP10-058").none();
    expect([t.field("opp"), t.stats("opp:V3"), t.leader()]).toEqual([["V3"], [3, 2], 24]);
    const act = d({ me: { field: ["BP10-058", WEAPON], hand: ["BP10-070"], deck: ["V1"], playPoints: 1 } }).activate("BP10-058").pick("BP10-070");
    expect([act.field(), act.hand(), act.canActivate("BP10-058")]).toEqual([["BP10-058", "BP10-070"], ["V1"], false]);
  });

  it("059 Dual Form γ — advanced; Storm with 5 Armed cards in the cemetery; act (1, bury a Draconic Weapon): 2 to each enemy follower, +2/+2", () => {
    expect(d({ me: { field: ["BP10-059"], cemetery: ARMED } }).keywords("BP10-059")).toEqual(["storm"]);
    expect(d({ me: { field: ["BP10-059"], cemetery: ARMED.slice(1) } }).keywords("BP10-059")).toEqual([]);
    const t = d({ me: { field: ["BP10-059", WEAPON], playPoints: 1 }, opp: { field: ["V3"] } }).activate("BP10-059");
    expect([t.stats("opp:V3"), t.stats("BP10-059"), t.field()]).toEqual([[3, 2], [8, 8], ["BP10-059"]]);
  });

  it("060 / 061 Slaughtering Dragonewt — banishes the top 5; evolved: 2 damage per 5 banished cards to the enemy leader and followers, in one damage", () => {
    const t = d({ me: { hand: ["BP10-060"], deck: ["V1", "V1", "V1", "V1", "V1", "V3"], playPoints: 3 } }).play("BP10-060");
    expect([t.zone("me", "banished").length, t.zone("me", "deck")]).toEqual([5, ["V3"]]);
    // Play one to banish 5, then evolve the other: 2 damage.
    const evo = d({ me: { hand: ["BP10-060"], field: ["BP10-060"], evolveDeck: ["BP10-061"], deck: Array<string>(10).fill("V1"), playPoints: 6 }, opp: { field: ["V5"] } });
    evo.play("BP10-060").evolve("BP10-060");
    expect([evo.leader("opp"), evo.stats("opp:V5")]).toEqual([18, [5, 3]]);
  });

  it("062 Eternal Whale — Ward; played from the EX area: recover 4 PP; Last Words: 2 to the enemy leader, then 2nd from the top or the bottom of its owner's deck", () => {
    const ex = d({ me: { ex: ["BP10-062"], playPoints: 5 } }).play("BP10-062").none();
    expect(ex.pp()).toBe(4);
    const hand = d({ me: { hand: ["BP10-062"], playPoints: 5 } }).play("BP10-062").none();
    expect(hand.pp()).toBe(0);
    const lw = d({ me: { field: ["BP10-062"], hand: ["QUICK-SAC"], deck: ["V1", "V3"] } }).play("QUICK-SAC").choose("second");
    expect([lw.leader("opp"), lw.zone("me", "deck")]).toEqual([18, ["V1", "BP10-062", "V3"]]);
  });

  it("063 Dual Rage — an Armed follower from the deck, then may summon one from the hand; from the cemetery: destroy a Lævateinn Dragon and 2 Draconic Weapons for a Dual Form", () => {
    const t = d({ me: { hand: ["BP10-063"], deck: ["V1", "BP10-070"], playPoints: 6 } }).play("BP10-063").pick("BP10-070").pick("BP10-070");
    expect(t.field()).toEqual(["BP10-070"]);
    const act = d({ me: { cemetery: ["BP10-063"], field: ["BP03-056", WEAPON, WEAPON], evolveDeck: ["BP10-057", "BP10-058"] } });
    act.activate("BP10-063").flush();
    expect(act.decision).toMatchObject({ type: "selectCards", min: 0, max: 1, candidateDefs: ["BP10-057", "BP10-058"] });
    act.pick("BP10-057");
    expect([act.field(), act.zone("me", "banished")]).toEqual([["BP10-057"], ["BP10-063"]]);
    expect(d({ me: { cemetery: ["BP10-063"], field: ["BP03-056", WEAPON], evolveDeck: ["BP10-057"] } }).canActivate("BP10-063")).toBe(false);
  });

  it("064 / 065 Swiftblade Dragonewt — with 3 Armed cards in the cemetery a Draconic Weapon and 3 to the enemy leader; evolved: a cheap Armed follower from the deck and a Draconic Weapon", () => {
    const t = d({ me: { hand: ["BP10-064"], cemetery: ARMED.slice(2), playPoints: 3 } }).play("BP10-064");
    expect([t.field(), t.leader("opp")]).toEqual([["BP10-064", WEAPON], 17]);
    const evo = d({ me: { field: ["BP10-064"], evolveDeck: ["BP10-065"], deck: ["V1", "BP10-070"], playPoints: 1 } }).evolve("BP10-064").pick("BP10-070");
    expect(evo.field()).toEqual(["BP10-064", "BP10-070", WEAPON]);
  });

  it("066 Heliodragon — discarded, it may go into the EX area; once on your turn, discarding gives leader +3", () => {
    const t = d({ me: { field: ["BP10-066"], hand: ["BP08-044", "BP08-044", "V1", "V1"], deck: ["V3", "V3"], playPoints: 2 } });
    t.play("BP08-044").pick("V1");
    expect(t.leader()).toBe(23);
    t.play("BP08-044").pick("V1");
    expect(t.leader()).toBe(23);
    const ex = d({ me: { hand: ["BP08-044", "BP10-066"], deck: ["V3"], playPoints: 1 } }).play("BP08-044").pick("BP10-066").yes();
    expect(ex.ex()).toEqual(["BP10-066"]);
  });

  it("067 Dragon Impact — the top card into the EX area and 4 to each enemy follower", () => {
    const t = d({ me: { hand: ["BP10-067"], deck: ["V1"], playPoints: 6 }, opp: { field: ["V3", "V5"] } }).play("BP10-067");
    expect([t.ex(), t.field("opp"), t.stats("opp:V5")]).toEqual([["V1"], ["V5"], [5, 1]]);
  });

  it("068 / 069 Springwell Dragon Keeper — evolved: discard a card for 4 damage, and a draw if it was an Arcana card", () => {
    const t = d({ me: { field: ["BP10-068"], evolveDeck: ["BP10-069"], hand: ["BP10-001"], deck: ["V1"], playPoints: 1 }, opp: { field: ["V5"] } });
    t.evolve("BP10-068").yes();
    expect([t.stats("opp:V5"), t.hand(), t.cemetery()]).toEqual([[5, 1], ["V1"], ["BP10-001"]]);
    const plain = d({ me: { field: ["BP10-068"], evolveDeck: ["BP10-069"], hand: ["V3"], deck: ["V1"], playPoints: 1 }, opp: { field: ["V5"] } });
    plain.evolve("BP10-068").yes();
    expect([plain.stats("opp:V5"), plain.hand()]).toEqual([[5, 1], []]);
  });

  it("070 Gallant Dragonewt — an Armed card from the top 2; with 3 Armed cards in the cemetery also a Draconic Weapon and 1 PP", () => {
    const t = d({ me: { hand: ["BP10-070"], cemetery: ARMED.slice(2), deck: ["V1", "BP10-064"], playPoints: 2 } }).play("BP10-070").pick("BP10-064");
    expect([t.hand(), t.field(), t.pp()]).toEqual([["BP10-064"], ["BP10-070", WEAPON], 1]);
  });

  it("071 Dragonclad Lancer — 2 damage to another of your followers for +1/+1 and Rush; act (3): +1/+1 and Assail", () => {
    const t = d({ me: { hand: ["BP10-071"], field: ["V3"], playPoints: 6 } }).play("BP10-071");
    expect([t.stats("V3"), t.stats("BP10-071"), t.keywords("BP10-071")]).toEqual([[3, 2], [4, 4], ["rush"]]);
    t.activate("BP10-071");
    expect([t.stats("BP10-071"), t.keywords("BP10-071"), t.pp()]).toEqual([[5, 5], ["rush", "assail"], 0]);
  });

  it("072 Tropical Grouper — Ward; end phase with an evolved follower on your field: search another Tropical Grouper", () => {
    const t = d({ me: { field: ["BP10-072", { card: "BP10-068", evolvedInto: "BP10-069" }], deck: ["V1", "BP10-072"] }, opp: { deck: ["V1"] } });
    t.end().pick("BP10-072");
    expect(t.hand()).toEqual(["BP10-072"]);
    const none = d({ me: { field: ["BP10-072"], deck: ["V1", "BP10-072"] }, opp: { deck: ["V1"] } }).end();
    expect(none.hand()).toEqual([]);
  });

  it("073 Dragon Spawning — a Dragoncraft follower from the top 3 into the EX area, 2 less with Overflow", () => {
    const t = d({ me: { hand: ["BP10-073"], deck: ["V1", "BP10-064", "V3"], playPoints: 7, maxPlayPoints: 7 } }).play("BP10-073").pick("BP10-064").order();
    expect([t.ex(), t.pp()]).toEqual([["BP10-064"], 5]);
    t.play("BP10-064");
    expect(t.pp()).toBe(4);
  });
});
