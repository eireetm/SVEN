import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP17 Havencraft (091–109, T09, T10). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); AMULET (1) is an amulet; KILL (1)
// destroys an enemy follower; PING-UPTO2 (0) deals 1 damage to up to 2 enemy followers. Machina followers: BP17-077 (2),
// BP07-081 Bone Drone (2), BP17-106 (1), BP17-107 (2). Tokens: BP05-T04 Ancient Artifact, BP07-T01 Assembly Droid,
// BP07-T02 Repair Mode, BP17-T09 Eschamali Adviser (Ward; Fanfare: draw), BP17-T10 Eschamali Constable (Rush; Fanfare:
// leader +2).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const ARTIFACT = "BP05-T04";
const DROID = "BP07-T01";
const REPAIR = "BP07-T02";
const ADVISER = "BP17-T09";
const CONSTABLE = "BP17-T10";
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };
const n = (count: number, id = "AMULET") => Array<string>(count).fill(id);

describe("BP17 Havencraft", () => {
  it("091 Eris, Atoned Priestess — Fanfare: banish up to 1 enemy follower per 2 amulets; adv (3), bury it, with 4 amulets: a Relic Goddess", () => {
    const t = d({ me: { hand: ["BP17-091"], field: n(4), playPoints: 3 }, opp: { field: ["V5", "V3", "V1"] } });
    t.play("BP17-091").pick("opp:V5", "opp:V3");
    expect([t.field("opp"), t.zone("opp", "banished")]).toEqual([["V1"], ["V5", "V3"]]);
    const adv = d({ me: { field: ["BP17-091", ...n(4)], evolveDeck: ["BP17-092"], playPoints: 3 } }).activate("BP17-091").pick("BP17-092");
    expect([adv.field(), adv.cemetery(), adv.pp()]).toEqual([[...n(4), "BP17-092"], ["BP17-091"], 0]);
    expect(d({ me: { field: ["BP17-091", ...n(3)], evolveDeck: ["BP17-092"], playPoints: 3 } }).canActivate("BP17-091")).toBe(false);
  });

  it("092 Relic Goddess — end phase: leader +1 per 2 amulets; can't be destroyed by abilities or take ability damage", () => {
    expect(d({ me: { field: ["BP17-092", ...n(4)] }, opp: { deck: ["V1"] } }).end().leader()).toBe(22);
    const t = d({ me: { hand: ["KILL", "PING-UPTO2"], field: ["V5"], playPoints: 1 }, opp: { field: [{ card: "BP17-092", engaged: true }] } });
    t.play("KILL").play("PING-UPTO2").pick("opp:BP17-092");
    expect([t.field("opp"), t.stats("opp:BP17-092")]).toEqual([["BP17-092"], [6, 6]]);
    expect(t.attack("V5", "opp:BP17-092").stats("opp:BP17-092")).toEqual([6, 1]);
  });

  it("093 / 094 Yuwan, Dimensional Avenger — Fanfare: a follower from the top 2 into the EX area, then discard; evolved: an Ancient Artifact; super-evolved: 4 damage and 2 to its leader", () => {
    const t = d({ me: { hand: ["BP17-093", "V1"], deck: ["V3", "KILL"], playPoints: 2 } }).play("BP17-093").pick("V3");
    expect([t.ex(), t.hand(), t.cemetery()]).toEqual([["V3"], [], ["V1"]]);
    const kept = d({ me: { hand: ["BP17-093", "V1"], deck: ["V3", "KILL"], playPoints: 2 } }).play("BP17-093").none().order();
    expect([kept.ex(), kept.hand()]).toEqual([[], ["V1"]]);
    expect(d({ me: { field: ["BP17-093"], evolveDeck: ["BP17-094"], playPoints: 1 } }).evolve("BP17-093").ex()).toEqual([ARTIFACT]);
    const s = d({ me: { field: ["BP17-093"], evolveDeck: ["BP17-094"], playPoints: 1, ...SUPER }, opp: { field: ["V5"] } });
    s.evolve("BP17-093", { sep: true }).flush();
    expect([s.stats("opp:V5"), s.leader("opp"), s.ex()]).toEqual([[5, 1], 18, [ARTIFACT]]);
  });

  it("095 Meowskers, Fluffy Consul — Storm; Fanfare: draw when put onto the field by an ability; Strike, (1): 2 damage", () => {
    const t = d({ me: { hand: ["BP17-095"], deck: ["V1"], playPoints: 1 } }).play("BP17-095");
    expect([t.hand(), t.keywords("BP17-095")]).toEqual([[], ["storm"]]);
    const ab = d({ me: { hand: ["BP17-103"], cemetery: ["BP17-095"], deck: ["V1"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP17-103").choose("summon");
    expect([ab.field(), ab.hand()]).toEqual([["BP17-095"], ["V1"]]);
    const s = d({ me: { field: ["BP17-095"], playPoints: 1 }, opp: { field: ["V5"] } }).attack("BP17-095", "opp:leader").yes();
    expect([s.stats("opp:V5"), s.pp(), s.leader("opp")]).toEqual([[5, 3], 0, 19]);
  });

  it("096 / 097 Marlone, Peace Advocate — Fanfare: an Eschamali Adviser; evolved: an Eschamali Constable", () => {
    const t = d({ me: { hand: ["BP17-096"], deck: ["V1"], playPoints: 4 } }).play("BP17-096").none();
    expect([t.field(), t.hand(), t.keywords(ADVISER)]).toEqual([["BP17-096", ADVISER], ["V1"], ["ward"]]);
    const e = d({ me: { field: ["BP17-096"], evolveDeck: ["BP17-097"], playPoints: 1 } }).evolve("BP17-096");
    expect([e.field(), e.leader(), e.keywords(CONSTABLE)]).toEqual([["BP17-096", CONSTABLE], 22, ["rush"]]);
  });

  it("098 Vice, Death Grip — other Machina followers of yours have Rush; Fanfare: up to 2 Machina followers from the top 5, then up to 2 small Machina followers from the hand onto the field", () => {
    const f = d({ me: { field: ["BP17-098", "BP17-077", "V1"] }, opp: { field: ["BP17-077"] } });
    expect([f.keywords("BP17-077"), f.keywords("V1"), f.keywords("BP17-098"), f.keywords("opp:BP17-077")]).toEqual([["rush"], [], [], []]);
    const t = d({ me: { hand: ["BP17-098"], deck: ["BP17-077", "BP17-098", "BP07-081", "V1", "V3"], playPoints: 5 } });
    t.play("BP17-098").pick("BP17-077", "BP07-081").order().pick("BP17-077", "BP07-081");
    expect([t.field(), t.hand(), t.keywords("BP07-081")]).toEqual([["BP17-098", "BP17-077", "BP07-081"], [], ["rush"]]);
  });

  it("099 Automachina Maiden — Ward; act (0) in the EX area with 5 Machina cards there: onto the field engaged; act (1) from the hand into the EX area: a Machina card on top into the hand", () => {
    const t = d({ me: { ex: ["BP17-099", DROID, DROID, REPAIR, "BP17-077"] } }).activate("BP17-099@ex");
    expect([t.field(), t.engaged("BP17-099")]).toEqual([["BP17-099"], true]);
    expect(d({ me: { ex: ["BP17-099", DROID, DROID, REPAIR, "V1"] } }).canActivate("BP17-099@ex")).toBe(false);
    const h = d({ me: { hand: ["BP17-099"], deck: ["BP17-077", "V1"], playPoints: 1 } }).activate("BP17-099@hand").pick("BP17-077");
    expect([h.hand(), h.ex()]).toEqual([["BP17-077"], ["BP17-099"]]);
    const left = d({ me: { hand: ["BP17-099"], deck: ["BP17-077", "V1"], playPoints: 1 } }).activate("BP17-099@hand").none();
    expect(left.zone("me", "deck")).toEqual(["BP17-077", "V1"]);
  });

  it("100 / 101 Aerial Craft — Fanfare: a Repair Mode; evolved: may put a small Machina follower from the hand onto the field", () => {
    expect(d({ me: { hand: ["BP17-100"], playPoints: 3 } }).play("BP17-100").ex()).toEqual([REPAIR]);
    const t = d({ me: { field: ["BP17-100"], evolveDeck: ["BP17-101"], hand: ["BP17-107", "V1"], playPoints: 1 }, opp: { field: ["V5"] } });
    t.evolve("BP17-100").pick("BP17-107").flush();
    expect([t.field(), t.ex(), t.stats("opp:V5")]).toEqual([["BP17-100", "BP17-107"], [REPAIR], [5, 3]]);
  });

  it("102 Balance and Obliteration — a Marlone follower and a 2-cost follower from the deck onto the field, leader +2", () => {
    const t = d({ me: { hand: ["BP17-102"], deck: ["BP17-096", "V1", "V5"], playPoints: 6 } }).play("BP17-102").pick("BP17-096").pick("V1").none();
    expect([t.field(), t.hand(), t.leader()]).toEqual([["BP17-096", "V1", ADVISER], ["V5"], 22]);
  });

  it("103 Unlikely Fellowship — 2 damage, or a Meowskers follower from the cemetery; not playable without a target", () => {
    const t = d({ me: { hand: ["BP17-103"], cemetery: ["BP17-095"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP17-103").choose("damage");
    expect([t.stats("opp:V5"), t.cemetery()]).toEqual([[5, 3], ["BP17-095", "BP17-103"]]);
    expect(d({ me: { hand: ["BP17-103"], cemetery: ["V1"], playPoints: 1 } }).canPlay("BP17-103")).toBe(false);
  });

  it("104 / 105 Steelwing — Storm; Fanfare: 2 Assembly Droids; evolved: 2 Assembly Droids", () => {
    const t = d({ me: { hand: ["BP17-104"], playPoints: 7 } }).play("BP17-104");
    expect([t.field(), t.keywords("BP17-104")]).toEqual([["BP17-104", DROID, DROID], ["storm"]]);
    const e = d({ me: { field: ["BP17-104"], evolveDeck: ["BP17-105"], playPoints: 1 } }).evolve("BP17-104");
    expect([e.field(), e.keywords("BP17-104")]).toEqual([["BP17-104", DROID, DROID], ["storm"]]);
  });

  it("106 Technomancer — Fanfare: a Repair Mode, then draw with 3 Machina cards in the EX area", () => {
    expect(d({ me: { hand: ["BP17-106"], ex: [DROID, REPAIR], deck: ["V1"], playPoints: 1 } }).play("BP17-106").hand()).toEqual(["V1"]);
    expect(d({ me: { hand: ["BP17-106"], ex: [DROID], deck: ["V1"], playPoints: 1 } }).play("BP17-106").hand()).toEqual([]);
  });

  it("107 Android Artisan — Fanfare: a Repair Mode; Fanfare: damage per Machina follower of yours only when put onto the field by an ability", () => {
    const t = d({ me: { hand: ["BP17-107"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP17-107").flush();
    expect([t.ex(), t.stats("opp:V5")]).toEqual([[REPAIR], [5, 5]]);
  });

  it("108 Mark Unleashed — 1 less with a Marlone follower; damage per Faith follower of yours", () => {
    const t = d({ me: { hand: ["BP17-108"], field: ["BP17-096", ADVISER], playPoints: 0 }, opp: { field: ["V5"] } });
    expect(t.play("BP17-108").stats("opp:V5")).toEqual([5, 3]);
    expect(d({ me: { hand: ["BP17-108"], field: [ADVISER], playPoints: 0 }, opp: { field: ["V5"] } }).canPlay("BP17-108")).toBe(false);
  });

  it("109 Unicorn Altar — Fanfare: 2 damage, 3 with 3 amulets; act (1), engage and bury it, with 3 amulets: leader +1", () => {
    expect(d({ me: { hand: ["BP17-109"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP17-109").stats("opp:V5")).toEqual([5, 3]);
    expect(d({ me: { hand: ["BP17-109"], field: n(2), playPoints: 1 }, opp: { field: ["V5"] } }).play("BP17-109").stats("opp:V5")).toEqual([5, 2]);
    const t = d({ me: { field: ["BP17-109", ...n(2)], playPoints: 1 } }).activate("BP17-109");
    expect([t.leader(), t.field()]).toEqual([21, n(2)]);
    expect(d({ me: { field: ["BP17-109", "AMULET"], playPoints: 1 } }).canActivate("BP17-109")).toBe(false);
  });

  it("T09 Eschamali Adviser / T10 Eschamali Constable — Ward, Fanfare: draw / Rush, Fanfare: leader +2", () => {
    const a = d({ me: { ex: [ADVISER], deck: ["V1"], playPoints: 2 } }).play(`${ADVISER}@ex`).none();
    expect([a.hand(), a.keywords(ADVISER)]).toEqual([["V1"], ["ward"]]);
    const c = d({ me: { ex: [CONSTABLE], playPoints: 2 } }).play(`${CONSTABLE}@ex`);
    expect([c.leader(), c.keywords(CONSTABLE)]).toEqual([22, ["rush"]]);
  });
});
