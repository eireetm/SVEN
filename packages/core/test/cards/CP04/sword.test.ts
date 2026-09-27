import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// CP04 Swordcraft (019–036, T02–T04), Princess Connect! Re: Dive. Both decks are based on the universe (CR 14.5.1.2). V1 is 1c
// 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). CP04-105 Suzume (2c; UB Fanfare: leader +2) executes a Union Burst ability. CP04-001
// Kokkoro is a 1-cost PriConne follower; CP04-023 Jun is a Nightmare follower.
const E = cardEngine();
const PC = { universe: "princessConnect" as const };
const d = (spec: DriveSpec) => drive(E, { ...spec, me: { ...PC, ...spec.me }, opp: { ...PC, ...spec.opp } });
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };

describe("CP04 Swordcraft", () => {
  it("019 / 020 / T02 Pecorine — Ward; Fanfare (2): a Princess Sword; evolved UB: 4 damage; super-evolved: 4 to the enemy leader", () => {
    const t = d({ me: { hand: ["CP04-019"], playPoints: 5 } }).play("CP04-019").none().yes();
    expect([t.zone("me", "equipmentZone"), t.keywords("CP04-019")]).toEqual([["CP04-T02"], ["ward"]]);
    const e = d({ me: { field: ["CP04-019"], evolveDeck: ["CP04-020"], playPoints: 1, ...SUPER }, opp: { field: ["V5"] } });
    e.evolve("CP04-019", { sep: true }).flush();
    expect([e.stats("opp:V5"), e.leader("opp")]).toEqual([[5, 1], 16]);
  });

  it("021 / T03 Christina — Storm; UB Strike, discard a card: 5 damage; a Sanctum Blade Avalon refreshes it and draws once per turn", () => {
    const t = d({ me: { field: ["CP04-021"], hand: ["V1"] }, opp: { field: ["V5"] } }).attack("CP04-021", "opp:leader").yes();
    expect([t.field("opp"), t.cemetery(), t.leader("opp")]).toEqual([[], ["V1"], 16]);
    const a = d({ me: { field: [{ card: "CP04-021", equipped: ["CP04-T03"] }], deck: ["V1", "V3"] } }).attack("CP04-021", "opp:leader").flush();
    expect([a.engaged("CP04-021"), a.hand()]).toEqual([false, ["V1"]]);
    // Once per turn: the second attack doesn't refresh it or draw (no enemy follower, so its UB Strike isn't played either).
    a.attack("CP04-021", "opp:leader");
    expect([a.engaged("CP04-021"), a.hand(), a.leader("opp")]).toEqual([true, ["V1"], 12]);
  });

  it("022 / T04 Labyrista — with 4 followers a Queen's Console (UB: 1-cost followers +1 attack); end phase: 2 damage with 10 attack of 1-cost followers", () => {
    const t = d({ me: { hand: ["CP04-022"], field: ["V1", "V1", "V1"], playPoints: 2 } }).play("CP04-022");
    expect(t.zone("me", "equipmentZone")).toEqual(["CP04-T04"]);
    t.activate("CP04-022", 1);
    expect([t.stats("V1"), t.stats("CP04-022"), t.engaged("CP04-022"), t.pp()]).toEqual([[3, 2], [3, 2], true, 0]);
    expect(d({ me: { field: ["CP04-022"] } }).activate("CP04-022").stats("CP04-022")).toEqual([3, 2]);
    const e = d({ me: { field: ["CP04-022", "V1", "V1", "V1", "V1"] }, opp: { field: ["V5"], deck: ["V1"] } }).end();
    expect(e.stats("opp:V5")).toEqual([5, 3]);
    const short = d({ me: { field: ["CP04-022", "V1", "V1", "V1"] }, opp: { field: ["V5"], deck: ["V1"] } }).end();
    expect(short.stats("opp:V5")).toEqual([5, 5]);
  });

  it("023 / 024 Jun — Ward; evolved UB: up to 2 Nightmare followers into the EX area, the next Nightmare follower costs 2 less", () => {
    const t = d({ me: { field: ["CP04-023"], evolveDeck: ["CP04-024"], deck: ["CP04-027", "CP04-023", "CP04-034"], playPoints: 1 } }).evolve("CP04-023");
    t.pick("CP04-027", "CP04-034");
    expect([t.ex(), t.keywords("CP04-023"), t.canPlay("CP04-034"), t.canPlay("CP04-027")]).toEqual([["CP04-027", "CP04-034"], ["ward"], true, true]);
  });

  it("025 Lily — Rush; UB Fanfare / UB Strike: draw, may summon a follower costing 2 or less from the hand", () => {
    const f = d({ me: { hand: ["CP04-025", "V1"], deck: ["V3"], playPoints: 5 } }).play("CP04-025").pick("V1");
    expect([f.field(), f.hand(), f.keywords("CP04-025")]).toEqual([["CP04-025", "V1"], ["V3"], ["rush"]]);
    const s = d({ me: { field: ["CP04-025"], hand: ["V1"], deck: ["V3"] } }).attack("CP04-025", "opp:leader").pick("V1");
    expect(s.field()).toEqual(["CP04-025", "V1"]);
  });

  it("026 Creditta — UB Activate: an enemy follower takes 2 more damage this turn; Fanfare: a Pecorine follower into the EX area, 3 less", () => {
    const t = d({ me: { field: ["CP04-026", "V1"] }, opp: { field: [{ card: "V5", engaged: true }] } }).activate("CP04-026").attack("V1", "opp:V5");
    expect(t.stats("opp:V5")).toEqual([5, 1]);
    const f = d({ me: { hand: ["CP04-026"], deck: ["V1", "CP04-019"], playPoints: 4 } }).play("CP04-026").pick("CP04-019");
    expect([f.ex(), f.canPlay("CP04-019")]).toEqual([["CP04-019"], true]);
  });

  it("027 / 028 Tomo — Storm; Fanfare with 4 PriConne followers: it evolves; evolved UB Strike: 2 damage", () => {
    const t = d({ me: { hand: ["CP04-027"], field: ["CP04-001", "CP04-001", "CP04-001"], evolveDeck: ["CP04-028"], playPoints: 2 } }).play("CP04-027").yes();
    expect([t.stats("CP04-027"), t.keywords("CP04-027")]).toEqual([[3, 2], ["storm"]]);
    const s = d({ me: { field: [{ card: "CP04-027", evolvedInto: "CP04-028" }] }, opp: { field: ["V5"] } }).attack("CP04-027", "opp:leader");
    expect(s.stats("opp:V5")).toEqual([5, 3]);
  });

  it("029 Shizuru — Ward; UB Activate: 1 damage, leader +1; Fanfare: a 1-cost PriConne follower with Evolve into the EX area", () => {
    const t = d({ me: { hand: ["CP04-029"], deck: ["CP04-105", "CP04-001"], playPoints: 3 } }).play("CP04-029").none().pick("CP04-001");
    expect(t.ex()).toEqual(["CP04-001"]);
    const a = d({ me: { field: ["CP04-029"] }, opp: { field: ["V5"] } }).activate("CP04-029");
    expect([a.stats("opp:V5"), a.leader()]).toEqual([[5, 4], 21]);
  });

  it("030 Ruka — Ward; UB Activate (1), engage: 2 damage", () => {
    const t = d({ me: { field: ["CP04-030"], playPoints: 1 }, opp: { field: ["V5"] } }).activate("CP04-030");
    expect([t.stats("opp:V5"), t.pp(), t.keywords("CP04-030")]).toEqual([[5, 3], 0, ["ward"]]);
  });

  it("031 / 032 Tamaki — Storm; evolved UB Strike: 2 damage to an enemy follower with at least 3 attack", () => {
    expect(d({ me: { field: ["CP04-031"] } }).keywords("CP04-031")).toEqual(["storm"]);
    const t = d({ me: { field: [{ card: "CP04-031", evolvedInto: "CP04-032" }] }, opp: { field: ["V5", "V1"] } }).attack("CP04-031", "opp:leader");
    expect([t.stats("opp:V5"), t.stats("opp:V1")]).toEqual([[5, 3], [2, 2]]);
  });

  it("033 Mitsuki — UB Fanfare: up to 2 enemy followers -2/-2; another follower's Union Burst: an enemy follower -1/-1", () => {
    const t = d({ me: { hand: ["CP04-033"], playPoints: 4 }, opp: { field: ["V5", "V3"] } }).play("CP04-033").pick("opp:V5", "opp:V3");
    expect([t.stats("opp:V5"), t.stats("opp:V3")]).toEqual([[3, 3], [1, 2]]);
    expect(d({ me: { field: ["CP04-033"], hand: ["CP04-105"], playPoints: 2 }, opp: { field: ["V5"] } }).play("CP04-105").stats("opp:V5")).toEqual([4, 4]);
  });

  it("034 Matsuri — Rush, Assail with another Nightmare follower; UB Strike: 1 damage", () => {
    expect(d({ me: { field: ["CP04-034", "CP04-023"] } }).keywords("CP04-034")).toEqual(["rush", "assail"]);
    expect(d({ me: { field: ["CP04-034"] } }).keywords("CP04-034")).toEqual(["rush"]);
    expect(d({ me: { field: ["CP04-034"] }, opp: { field: ["V5"] } }).attack("CP04-034", "opp:leader").stats("opp:V5")).toEqual([5, 4]);
  });

  it("035 Ninon — UB Activate (4), engage: 5 damage and refresh, once per turn; another follower's Union Burst: +1/+1", () => {
    const t = d({ me: { field: ["CP04-035"], playPoints: 8 }, opp: { field: ["V5", "V3"] } }).activate("CP04-035").pick("opp:V5");
    expect([t.field("opp"), t.engaged("CP04-035"), t.canActivate("CP04-035")]).toEqual([["V3"], false, false]);
    expect(d({ me: { field: ["CP04-035"], hand: ["CP04-105"], playPoints: 2 } }).play("CP04-105").stats("CP04-035")).toEqual([3, 3]);
  });

  it("036 Princess Strike — engaging a Pecorine follower makes it 3 less; 5 damage to a follower and 2 to its leader", () => {
    const t = d({ me: { field: ["CP04-019"], hand: ["CP04-036"], playPoints: 0 }, opp: { field: ["V5"] } });
    expect(t.canPlay("CP04-036")).toBe(true);
    t.play("CP04-036");
    expect([t.field("opp"), t.leader("opp"), t.engaged("CP04-019")]).toEqual([[], 18, true]);
    expect(d({ me: { hand: ["CP04-036"], playPoints: 0 }, opp: { field: ["V5"] } }).canPlay("CP04-036")).toBe(false);
  });
});
