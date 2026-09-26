import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP11 Abysscraft (069–085, T02). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); AMULET a 1-cost
// amulet; QUICK-SAC destroys one of your followers; BUFF-SOME gives up to 2 of your followers +1/+1.
// BP01-108 Dire Bond (1-cost amulet: 1 damage to your leader, draw) turns Sanguine on. Wasteland followers
// that cost 3 or less: BP11-076 Wretch, BP11-082 Skeleton Dreamer. Tokens: BP11-T02 Magitrain,
// BP11-T03 Dutiful Steed, BP11-T04 Bullet Bike.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const MAGITRAIN = "BP11-T02";
const STEED = "BP11-T03";
const BIKE = "BP11-T04";
const cards = (n: number, id = "V1") => Array<string>(n).fill(id);

describe("BP11 Abysscraft", () => {
  it("069 Iceschillendrig — Fanfare summons a Magitrain unless there is one; becoming engaged makes the opponent discard", () => {
    expect(d({ me: { hand: ["BP11-069"], playPoints: 5 } }).play("BP11-069").field()).toEqual(["BP11-069", MAGITRAIN]);
    expect(d({ me: { hand: ["BP11-069"], field: [MAGITRAIN], playPoints: 5 } }).play("BP11-069").field()).toEqual([MAGITRAIN, "BP11-069"]);
    const t = d({ me: { field: ["BP11-069"] }, opp: { hand: ["V1"] } }).attack("BP11-069", "opp:leader");
    expect([t.hand("opp"), t.cemetery("opp"), t.leader("opp")]).toEqual([[], ["V1"], 15]);
  });

  it("070 Iceschillendrig (Evolved) — On Evolve discard: 2 followers from the cemetery; during your turn a discard engages an enemy follower", () => {
    const t = d({ me: { field: ["BP11-069"], evolveDeck: ["BP11-070"], hand: ["V3"], cemetery: ["V1", "V5"], playPoints: 1 }, opp: { field: ["V5"] } });
    t.evolve("BP11-069").yes();
    expect([t.hand(), t.cemetery(), t.engaged("opp:V5")]).toEqual([["V1", "V5"], ["V3"], true]);
  });

  it("071 Illganeau — Necrocharge (10): may summon a Wasteland follower from the cemetery and banish itself; Last Words into the EX area and bury 1", () => {
    const t = d({ me: { hand: ["BP11-071"], cemetery: [...cards(9), "BP11-082"], playPoints: 1 } }).play("BP11-071").yes();
    expect([t.field(), t.zone("me", "banished")]).toEqual([["BP11-082"], ["BP11-071"]]);
    const few = d({ me: { hand: ["BP11-071"], cemetery: [...cards(8), "BP11-082"], playPoints: 1 } }).play("BP11-071");
    expect(few.field()).toEqual(["BP11-071"]);
    const lw = d({ me: { field: ["BP11-071"], hand: ["QUICK-SAC"], deck: ["V3", "V5"] } }).play("QUICK-SAC");
    expect([lw.ex(), lw.cemetery(), lw.zone("me", "deck")]).toEqual([["BP11-071"], ["QUICK-SAC", "V3"], ["V5"]]);
  });

  it("072 / 073 Hazhan — evolves for 1 with Sanguine; evolved: Strike 2 to the enemy leader and refresh, once a turn", () => {
    const t = d({ me: { field: ["BP11-072"], hand: ["BP01-108"], evolveDeck: ["BP11-073"], deck: ["V1"], playPoints: 2 } });
    expect([t.canEvolve("BP11-072"), t.keywords("BP11-072")]).toEqual([false, ["assail", "bane", "drain"]]);
    t.play("BP01-108").evolve("BP11-072");
    expect(t.pp()).toBe(0);
    const evo = d({ me: { field: [{ card: "BP11-072", evolvedInto: "BP11-073" }] } }).attack("BP11-072", "opp:leader");
    expect([evo.leader("opp"), evo.engaged("BP11-072")]).toEqual([17, false]);
    evo.attack("BP11-072", "opp:leader");
    expect([evo.leader("opp"), evo.engaged("BP11-072")]).toEqual([16, true]);
  });

  it("074 Greatpick Corpse — Fanfare bury another card: 4 damage; once a turn a 1-cost token leaving your field comes back", () => {
    const t = d({ me: { hand: ["BP11-074"], field: ["V1"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP11-074").yes();
    expect([t.field(), t.cemetery(), t.stats("opp:V5")]).toEqual([["BP11-074"], ["V1"], [5, 1]]);
    const token = d({ me: { field: ["BP11-074", STEED, STEED] } }).activate(STEED);
    expect(token.field()).toEqual(["BP11-074", STEED, STEED]);
    token.activate(STEED);
    expect(token.field()).toEqual(["BP11-074", STEED]);
  });

  it("075 Dead to Rights — Quick; −2/−2; from the cemetery, banish it and an Iceschillendrig: engage an enemy follower", () => {
    expect(d({ me: { hand: ["BP11-075"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP11-075").stats("opp:V5")).toEqual([3, 3]);
    const act = d({ me: { cemetery: ["BP11-075", "BP11-069"] }, opp: { field: ["V5"] } }).activate("BP11-075");
    expect([act.engaged("opp:V5"), act.zone("me", "banished")]).toEqual([true, ["BP11-075", "BP11-069"]]);
    expect(d({ me: { cemetery: ["BP11-075"] }, opp: { field: ["V5"] } }).canActivate("BP11-075")).toBe(false);
  });

  it("076 / 077 Wretch — Rush; evolves only after entering from the cemetery; evolved: Storm and 5 damage; Last Words a Bike and bury 2", () => {
    expect(d({ me: { field: ["BP11-076"], evolveDeck: ["BP11-077"], playPoints: 1 } }).canEvolve("BP11-076")).toBe(false);
    const t = d({ me: { hand: ["BP11-079"], cemetery: [...cards(8), "BP11-076", "BP11-082"], evolveDeck: ["BP11-077"], playPoints: 5 }, opp: { field: ["V5"] } });
    t.play("BP11-079").evolve("BP11-076");
    expect([t.field().sort(), t.field("opp"), t.keywords("BP11-076")]).toEqual([["BP11-076", "BP11-082"], [], ["storm"]]);
    const lw = d({ me: { field: ["BP11-076"], hand: ["QUICK-SAC"], deck: ["V1", "V3", "V5"] } }).play("QUICK-SAC");
    expect([lw.field(), lw.zone("me", "deck"), lw.keywords(BIKE)]).toEqual([[BIKE], ["V5"], []]);
  });

  it("078 Gold Mine Necromancer — Necrocharge (10): 4 damage and summon a Wasteland follower from the cemetery", () => {
    const t = d({ me: { hand: ["BP11-078"], cemetery: [...cards(9), "BP11-082"], playPoints: 5 }, opp: { field: ["V5"] } }).play("BP11-078");
    expect([t.stats("opp:V5"), t.field()]).toEqual([[5, 1], ["BP11-078", "BP11-082"]]);
    const few = d({ me: { hand: ["BP11-078"], cemetery: ["BP11-082"], playPoints: 5 }, opp: { field: ["V5"] } }).play("BP11-078");
    expect([few.stats("opp:V5"), few.field()]).toEqual([[5, 5], ["BP11-078"]]);
  });

  it("079 Wretched Tryst — needs 2 Wasteland followers in the cemetery; Necrocharge (10) summons them", () => {
    expect(d({ me: { hand: ["BP11-079"], cemetery: [...cards(9), "BP11-082"], playPoints: 4 } }).canPlay("BP11-079")).toBe(false);
    const few = d({ me: { hand: ["BP11-079"], cemetery: ["BP11-076", "BP11-082"], playPoints: 4 } }).play("BP11-079");
    expect([few.field(), few.cemetery().length]).toEqual([[], 3]);
  });

  it("080 / 081 Redcap — Rush and Assail with an amulet; evolved: Follower Strike takes no damage this turn, refreshes at the end phase", () => {
    expect(d({ me: { hand: ["BP11-080"], field: ["AMULET"], playPoints: 4 } }).play("BP11-080").keywords("BP11-080")).toEqual(["rush", "assail"]);
    expect(d({ me: { hand: ["BP11-080"], playPoints: 4 } }).play("BP11-080").keywords("BP11-080")).toEqual([]);
    const evo = d({ me: { field: [{ card: "BP11-080", evolvedInto: "BP11-081" }] }, opp: { field: [{ card: "V5", engaged: true }], deck: ["V1"] } });
    evo.attack("BP11-080", "opp:V5");
    expect([evo.stats("BP11-080"), evo.field("opp"), evo.engaged("BP11-080")]).toEqual([[6, 5], [], true]);
    evo.end();
    expect(evo.engaged("BP11-080")).toBe(false);
  });

  it("082 Skeleton Dreamer — gaining stats gives it Storm; Last Words a Bike and bury 1", () => {
    expect(d({ me: { field: ["BP11-082"], hand: ["BUFF-SOME"], playPoints: 1 } }).play("BUFF-SOME").pick("BP11-082").keywords("BP11-082")).toEqual(["storm"]);
    const lw = d({ me: { field: ["BP11-082"], hand: ["QUICK-SAC"], deck: ["V1", "V3"] } }).play("QUICK-SAC");
    expect([lw.field(), lw.zone("me", "deck")]).toEqual([[BIKE], ["V3"]]);
  });

  it("083 Fulminating Berserker — Rush; Strike 5 damage to an enemy follower", () => {
    const t = d({ me: { field: ["BP11-083"] }, opp: { field: ["V5", { card: "V3", engaged: true }] } }).attack("BP11-083", "opp:V3").pick("opp:V5");
    expect([t.field("opp"), t.stats("BP11-083")]).toEqual([[], [6, 3]]);
  });

  it("084 Grudge Teller — Fanfare 1 to the enemy leader, 3 with Sanguine", () => {
    expect(d({ me: { hand: ["BP11-084"], playPoints: 2 } }).play("BP11-084").leader("opp")).toBe(19);
    expect(d({ me: { hand: ["BP01-108", "BP11-084"], deck: ["V1"], playPoints: 3 } }).play("BP01-108").play("BP11-084").leader("opp")).toBe(17);
  });

  it("085 Spiderweb Array — engage an enemy follower and draw; it doesn't refresh in its controller's next start phase", () => {
    const t = d({ me: { hand: ["BP11-085"], deck: ["V1"], playPoints: 2 }, opp: { field: ["V5"], deck: ["V1"] } }).play("BP11-085");
    expect([t.engaged("opp:V5"), t.hand()]).toEqual([true, ["V1"]]);
    t.end();
    expect(t.engaged("opp:V5")).toBe(true);
  });

  it("T02 Magitrain — (1) and engage followers costing 5: maneuvered into a 4/5 Rush follower; Strike destroys an engaged enemy follower, leader +2", () => {
    const t = d({ me: { field: [MAGITRAIN, "V5"], playPoints: 1 }, opp: { field: [{ card: "V3", engaged: true }], deck: ["V1"] } }).activate(MAGITRAIN);
    expect([t.stats(MAGITRAIN), t.engaged("V5"), t.keywords(MAGITRAIN)]).toEqual([[4, 5], true, ["rush"]]);
    t.attack(MAGITRAIN, "opp:V3");
    expect([t.field("opp"), t.leader()]).toEqual([[], 22]);
    t.end();
    expect(t.game.reader().info(t.id(MAGITRAIN)).type).toBe("amulet");
    expect(d({ me: { field: [MAGITRAIN, "V3", "V1"], playPoints: 1 } }).canActivate(MAGITRAIN)).toBe(false);
  });
});
