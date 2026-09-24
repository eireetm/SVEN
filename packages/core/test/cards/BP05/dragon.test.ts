import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP05 Dragoncraft (052–068). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5; STORM 2c 2/1 Storm.
// BP05-059 Disciple of Disdain deals 1 ability damage to a follower of yours (activate, 0).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);

describe("BP05 Dragoncraft", () => {
  it("052 / 053 Galmieux — ability damage on your turn makes its evolve cost 0; evolved plays an Omen for 0 and hits for 3 when damaged", () => {
    const t = d({
      me: { field: ["BP05-052", "BP05-059"], evolveDeck: ["BP05-053"], cemetery: ["BP05-058"], playPoints: 0 },
      opp: { field: ["V5"] },
    });
    expect(t.canEvolve("BP05-052")).toBe(false);
    t.activate("BP05-059").pick("BP05-052");
    // On Evolve plays Disdainful Rending from the cemetery: 1 to Galmieux, 3 to V5; Galmieux's
    // damage then hits the enemy leader for 3.
    t.evolve("BP05-052").pick("BP05-052").pick("opp:leader");
    expect([t.stats("opp:V5"), t.leader("opp"), t.cemetery()]).toEqual([[5, 2], 17, ["BP05-058"]]);
  });

  it("054 Electromagical Rhino — Storm; +3/+0 and mill 4, again while a Rhino is milled; Last Words: Rhinos back to the deck", () => {
    const deck = ["V1", "BP05-054", "V1", "V1", "V1", "V1", "V1", "V1", "V2"];
    const t = d({ me: { hand: ["BP05-054"], deck, playPoints: 5 } }).play("BP05-054");
    expect([t.stats("BP05-054"), t.zone("me", "deck"), t.attackTargets("BP05-054")]).toEqual([[6, 7], ["V2"], ["opp:leader"]]);
    const lw = d({ me: { field: ["BP05-054"], hand: ["QUICK-SAC"], cemetery: ["BP05-054"] } }).play("QUICK-SAC");
    lw.pick("BP05-054", "BP05-054");
    expect([lw.cemetery(), lw.zone("me", "deck")]).toEqual([["QUICK-SAC"], ["BP05-054", "BP05-054"]]);
  });

  it("055 / 056 Apostle of Disdain — +1/+0 and Storm on ability damage; evolved: discard for up to 2 Omen cards from the top 5", () => {
    const t = d({ me: { field: ["BP05-055", "BP05-059"] } }).activate("BP05-059").pick("BP05-055");
    expect([t.stats("BP05-055"), t.keywords("BP05-055")]).toEqual([[3, 3], ["storm"]]);
    const deck = ["BP05-058", "V1", "BP05-063", "BP05-068", "V2"];
    const evo = d({ me: { field: ["BP05-055"], evolveDeck: ["BP05-056"], hand: ["V1"], deck, playPoints: 1 } });
    evo.evolve("BP05-055").yes().pick("BP05-058", "BP05-068").order();
    expect([evo.hand(), evo.cemetery()]).toEqual([["BP05-058", "BP05-068"], ["V1"]]);
  });

  it("057 God Bullet Golem — can't attack leaders; engage and bury another follower for damage equal to its attack", () => {
    const t = d({ me: { field: ["BP05-057", "V5"] }, opp: { field: ["V3"] } }).activate("BP05-057").pick("opp:V3");
    expect([t.field(), t.field("opp"), t.cemetery()]).toEqual([["BP05-057"], [], ["V5"]]);
    const atk = d({ me: { field: ["BP05-057"] }, opp: { field: [{ card: "V1", engaged: true }] } });
    expect([atk.attackTargets("BP05-057"), atk.canActivate("BP05-057")]).toEqual([["V1"], false]);
  });

  it("058 Disdainful Rending — 1 to a follower of yours and 3 to an enemy follower; needs both", () => {
    const t = d({ me: { hand: ["BP05-058"], field: ["V3"] }, opp: { field: ["V5"] } }).play("BP05-058");
    expect([t.stats("V3"), t.stats("opp:V5")]).toEqual([[3, 3], [5, 2]]);
    expect(d({ me: { hand: ["BP05-058"] }, opp: { field: ["V5"] } }).canPlay("BP05-058")).toBe(false);
  });

  it("059 Disciple of Disdain — once per turn, 1 damage to a follower of yours", () => {
    const t = d({ me: { field: ["BP05-059", "V3"] } }).activate("BP05-059").pick("V3");
    expect([t.stats("V3"), t.canActivate("BP05-059")]).toEqual([[3, 3], false]);
  });

  it("060 / 061 Cursed Stone — Ward; evolved: an enemy follower loses its abilities and can't attack through its next turn", () => {
    const t = d({ me: { field: ["BP05-060"], evolveDeck: ["BP05-061"], deck: ["V1"], playPoints: 1 }, opp: { field: ["STORM"], deck: ["V1"] } });
    t.evolve("BP05-060").end().none();
    expect([t.keywords("opp:STORM"), t.attackTargets("opp:STORM"), t.keywords("BP05-060")]).toEqual([[], [], ["ward"]]);
  });

  it("062 Amethyst Giant — discard for Rush and Aura; Strike: refresh, once per turn", () => {
    const t = d({
      me: { hand: ["BP05-062", "V1"], playPoints: 9 },
      opp: { field: [{ card: "V1", engaged: true }, { card: "V2", engaged: true }] },
    });
    t.play("BP05-062").yes();
    expect(t.keywords("BP05-062")).toEqual(["rush", "aura"]);
    t.attack("BP05-062", "opp:V1");
    expect(t.engaged("BP05-062")).toBe(false);
    t.attack("BP05-062", "opp:V2");
    expect([t.engaged("BP05-062"), t.field("opp")]).toEqual([true, []]);
  });

  it("063 Servant of Disdain — with Overflow, 1 to another follower and itself; draws when it takes ability damage on your turn", () => {
    const t = d({ me: { hand: ["BP05-063"], field: ["V3"], deck: ["V1"], playPoints: 7 }, opp: { field: ["V5"] } });
    t.play("BP05-063").pick("opp:V5");
    expect([t.stats("opp:V5"), t.stats("BP05-063"), t.hand()]).toEqual([[5, 4], [2, 2], ["V1"]]);
    const low = d({ me: { hand: ["BP05-063"], field: ["V3"], deck: ["V1"] }, opp: { field: ["V5"] } }).play("BP05-063");
    expect([low.stats("BP05-063"), low.hand()]).toEqual([[2, 3], []]);
  });

  it("064 Silver Automaton — Ward; Last Words: 2 Puppets into the EX area", () => {
    const t = d({ me: { field: ["BP05-064"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC");
    expect(t.ex()).toEqual(["BP05-T03", "BP05-T03"]);
  });

  it("065 / 066 Airship Whale — evolved: a follower costing 3 or less from the top 5 onto the field", () => {
    const t = d({ me: { field: ["BP05-065"], evolveDeck: ["BP05-066"], deck: ["V5", "V3", "V1", "KILL", "V2"], playPoints: 1 } });
    t.evolve("BP05-065").pick("V3").order();
    expect([t.field(), t.zone("me", "deck")]).toEqual([["BP05-065", "V3"], ["V5", "V1", "KILL", "V2"]]);
  });

  it("067 Colossal Construct — Ward; return 5 cemetery cards to the deck for 5 damage", () => {
    const t = d({ me: { hand: ["BP05-067"], cemetery: ["V1", "V1", "V1", "V1", "V1"], playPoints: 7 }, opp: { field: ["V5"] } });
    t.play("BP05-067").none().yes();
    expect([t.cemetery(), t.zone("me", "deck").length, t.field("opp")]).toEqual([[], 5, []]);
    const few = d({ me: { hand: ["BP05-067"], cemetery: ["V1", "V1", "V1", "V1"], playPoints: 7 }, opp: { field: ["V5"] } });
    expect(few.play("BP05-067").none().stats("opp:V5")).toEqual([5, 5]);
  });

  it("068 Total Domination — 2 to a follower of yours and each enemy follower; 2 more to them with Galmieux", () => {
    const t = d({ me: { hand: ["BP05-068"], field: ["V3"] }, opp: { field: ["V5", "V1"] } }).play("BP05-068");
    expect([t.stats("V3"), t.stats("opp:V5"), t.field("opp")]).toEqual([[3, 2], [5, 3], ["V5"]]);
    const gal = d({ me: { hand: ["BP05-068"], field: ["BP05-052"] }, opp: { field: ["V5"] } }).play("BP05-068");
    expect(gal.stats("opp:V5")).toEqual([5, 1]);
  });
});
