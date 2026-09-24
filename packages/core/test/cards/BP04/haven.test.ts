import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP04 Havencraft (098–115). BP04-105 is an alternate printing. V1 is 1c 2/2, V3 3c 3/4,
// V5 5c 5/5; AMULET is a plain 1-cost amulet. BP04-078 Dragon's Nest buries itself when activated.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);

describe("BP04 Havencraft", () => {
  it("098 Aether of the White Wing — Ward; a differently named Havencraft follower cheaper than your max PP enters", () => {
    const deck = ["BP04-098", "BP04-110", "V1", "BP04-106"];
    const t = d({ me: { hand: ["BP04-098"], deck, playPoints: 7, maxPlayPoints: 7 } });
    t.play("BP04-098").none();
    // Not another Aether, not a non-Havencraft card; BP04-106 costs 6 < 7.
    expect(t.decision?.type === "selectCards" ? t.decision.candidateDefs : []).toEqual(["BP04-110", "BP04-106"]);
    t.pick("BP04-110");
    expect([t.field(), t.keywords("BP04-098")]).toEqual([["BP04-098", "BP04-110"], ["ward"]]);
  });

  it("099 / 100 Dark Jeanne — 2 damage to every other follower and +2/+0 to yours; evolved: 4 to a follower and each leader", () => {
    const t = d({ me: { hand: ["BP04-099"], field: ["V1", "V3"], playPoints: 6 }, opp: { field: ["V5", "V1"] } }).play("BP04-099");
    expect([t.field(), t.stats("V3"), t.field("opp"), t.stats("opp:V5")]).toEqual([["V3", "BP04-099"], [5, 2], ["V5"], [5, 3]]);
    const evo = d({ me: { field: ["BP04-099"], evolveDeck: ["BP04-100"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP04-099");
    expect([evo.stats("opp:V5"), evo.leader(), evo.leader("opp")]).toEqual([[5, 1], 16, 16]);
    const low = d({ me: { field: ["BP04-099"], evolveDeck: ["BP04-100"], leaderDefense: 4, playPoints: 1 }, opp: { field: ["V5"] } });
    low.evolve("BP04-099");
    expect([low.stats("opp:V5"), low.leader()]).toEqual([[5, 5], 4]);
  });

  it("101 / 102 Zoe — 2 to your leader, mill 2, draw; drawing from an empty deck loses; evolved banishes a follower", () => {
    const t = d({ me: { hand: ["BP04-101"], deck: ["V1", "V2", "V3"], playPoints: 4 } }).play("BP04-101");
    expect([t.leader(), t.cemetery(), t.hand()]).toEqual([18, ["V1", "V2"], ["V3"]]);
    const out = d({ me: { hand: ["BP04-101"], deck: ["V1"], playPoints: 4 } }).play("BP04-101");
    expect(out.game.state.result).toMatchObject({ winner: 1, losses: [{ player: 0, reason: "deckOut" }] });
    const evo = d({ me: { field: ["BP04-101"], evolveDeck: ["BP04-102"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP04-101");
    expect(evo.zone("opp", "banished")).toEqual(["V5"]);
  });

  it("103 Andromeda — this turn your leader and current followers take no ability damage; later followers are not covered", () => {
    const t = d({ me: { hand: ["BP04-103", "V1"], field: ["BP04-096"], playPoints: 2 }, opp: { field: ["V5"] } });
    t.play("BP04-103").play("V1");
    t.attack("BP04-096", "opp:leader"); // Scorpius: 1 ability damage to each leader
    expect([t.leader(), t.leader("opp")]).toEqual([20, 17]);
    // A follower put onto the field afterwards is not covered (ruling): Dark Jeanne's 2 damage
    // only destroys the later V1.
    const later = d({ me: { hand: ["BP04-103", "V1", "BP04-099"], field: ["V3"], playPoints: 8 } });
    later.play("BP04-103").play("V1").play("BP04-099");
    expect([later.field(), later.stats("V3"), later.stats("BP04-103")]).toEqual([["V3", "BP04-103", "BP04-099"], [5, 4], [4, 2]]);
  });

  it("104 Globe of the Starways — search an amulet; Quick: pay 2, engage and bury it for leader +1 and a draw", () => {
    const t = d({ me: { hand: ["BP04-104"], deck: ["V1", "AMULET", "V3"], playPoints: 4 } });
    t.play("BP04-104").pick("AMULET");
    expect(t.hand()).toEqual(["AMULET"]);
    t.activate("BP04-104");
    expect([t.leader(), t.hand().length, t.cemetery()]).toEqual([21, 2, ["BP04-104"]]);
  });

  it("106 / 107 Star Priestess — evolve by banishing an amulet; engage 2 amulets: 3 damage and leader +3; evolved returns an amulet", () => {
    const t = d({ me: { hand: ["BP04-106"], field: ["AMULET", "AMULET"], playPoints: 6 }, opp: { field: ["V5"] } });
    t.play("BP04-106").yes();
    expect([t.stats("opp:V5"), t.leader(), t.engaged("AMULET")]).toEqual([[5, 2], 23, true]);
    const noFoe = d({ me: { hand: ["BP04-106"], field: ["AMULET", "AMULET"], playPoints: 6 } }).play("BP04-106");
    expect([noFoe.leader(), noFoe.engaged("AMULET")]).toEqual([20, false]); // nothing to select (ruling)

    const evo = d({ me: { field: ["BP04-106", "AMULET"], evolveDeck: ["BP04-107"], cemetery: ["BP04-115"] } });
    evo.evolve("BP04-106");
    expect([evo.zone("me", "banished"), evo.field()]).toEqual([["AMULET"], ["BP04-106", "BP04-115"]]);
  });

  it("108 Calydonian Boar — Rush; once per turn, when an amulet of yours leaves, +2/+2 and Assail", () => {
    const t = d({ me: { field: ["BP04-108", "BP04-078", "BP04-078"] } });
    t.activate("BP04-078");
    expect([t.stats("BP04-108"), t.keywords("BP04-108")]).toEqual([[7, 7], ["rush", "assail"]]);
    t.activate("BP04-078");
    expect(t.stats("BP04-108")).toEqual([7, 7]);
  });

  it("109 Star Torrent — Quick; 3 damage to each engaged enemy follower; leader +2 with an amulet on your field", () => {
    const t = d({ me: { hand: ["BP04-109"], field: ["AMULET"], playPoints: 4 }, opp: { field: [{ card: "V5", engaged: true }, "V3"] } });
    t.play("BP04-109");
    expect([t.stats("opp:V5"), t.stats("opp:V3"), t.leader()]).toEqual([[5, 2], [3, 4], 22]);
  });

  it("110 Starchaser Sprite — engage 2 amulets: draw 2, discard 1", () => {
    const t = d({ me: { hand: ["BP04-110"], field: ["AMULET", "AMULET"], deck: ["V1", "V2"], playPoints: 3 } });
    t.play("BP04-110").yes().pick("V2");
    expect([t.hand(), t.cemetery()]).toEqual([["V1"], ["V2"]]);
  });

  it("111 Sister of Punishment — once per turn, when an amulet of yours leaves, 2 damage to an enemy follower", () => {
    const t = d({ me: { field: ["BP04-111", "BP04-078", "BP04-078"] }, opp: { field: ["V5"] } });
    t.activate("BP04-078");
    expect(t.stats("opp:V5")).toEqual([5, 3]);
    t.activate("BP04-078");
    expect(t.stats("opp:V5")).toEqual([5, 3]);
  });

  it("112 / 113 Mist Shaman — evolve gives another follower Aura", () => {
    const t = d({ me: { field: ["BP04-112", "V1"], evolveDeck: ["BP04-113"], playPoints: 1 } }).evolve("BP04-112");
    expect([t.keywords("V1"), t.keywords("BP04-112")]).toEqual([["aura"], []]);
  });

  it("114 Octobishop — Ward; +0/+2 at the start of your end phase", () => {
    const t = d({ me: { field: ["BP04-114"], deck: ["V1"] }, opp: { deck: ["V1"] } }).end();
    expect([t.stats("BP04-114"), t.keywords("BP04-114")]).toEqual([[4, 6], ["ward"]]);
  });

  it("115 Candelabra of Prayers — once per turn, when another amulet enters your field, leader +1", () => {
    const t = d({ me: { hand: ["AMULET", "AMULET"], field: ["BP04-115"], playPoints: 2 } });
    t.play("AMULET").play("AMULET");
    expect(t.leader()).toBe(21);
  });
});
