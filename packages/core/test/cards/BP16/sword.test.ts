import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP16 Swordcraft (019–036). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); QUICK-SAC (0) destroys one of your
// followers. BP02-027 is Yurius, Levin Duke (Levin); BP14-022 Jiemon, Thief Lord; BP16-031 an Officer follower.
// Tokens: BP01-T07 Steelclad Knight, BP02-T02 Shield Guardian (Ward), BP01-T05 Knight, BP14-T02 Glittering Gold.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const STEELCLAD = "BP01-T07";
const SHIELD = "BP02-T02";
const KNIGHT = "BP01-T05";
const GOLD = "BP14-T02";
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };
const n = (count: number, id = "V1") => Array<string>(count).fill(id);

describe("BP16 Swordcraft", () => {
  it("019 / 020 Amelia, Silver Captain — at the start of your end phase, a Steelclad Knight, Shield Guardian or Knight into the EX area; evolved: the top card into the EX area; super-evolved: +4/+4 to an Officer follower", () => {
    expect(d({ me: { field: ["BP16-019"] }, opp: { deck: ["V1"] } }).end().choose("Knight").ex()).toEqual([KNIGHT]);
    expect(d({ me: { field: ["BP16-019"], evolveDeck: ["BP16-020"], deck: ["V3"], playPoints: 1 } }).evolve("BP16-019").ex()).toEqual(["V3"]);
    const s = d({ me: { field: ["BP16-019", "BP16-031"], evolveDeck: ["BP16-020"], deck: ["V3"], playPoints: 1, ...SUPER } }).evolve("BP16-019", { sep: true }).flush();
    expect(s.stats("BP16-031")).toEqual([5, 5]);
  });

  it("021 Albert, Levin Stormsaber — Storm; Fanfare: +1 attack to another Levin follower; act (3), once per turn with 10 Swordcraft followers in the cemetery: refresh this", () => {
    const t = d({ me: { hand: ["BP16-021"], field: ["BP02-027"], playPoints: 4 } }).play("BP16-021");
    expect([t.stats("BP02-027"), t.keywords("BP16-021")]).toEqual([[1, 4], ["storm"]]);
    const act = d({ me: { field: [{ card: "BP16-021", engaged: true }], cemetery: n(10, "BP16-031"), playPoints: 3 } }).activate("BP16-021");
    expect([act.engaged("BP16-021"), act.canActivate("BP16-021")]).toEqual([false, false]);
    expect(d({ me: { field: ["BP16-021"], cemetery: n(9, "BP16-031"), playPoints: 3 } }).canActivate("BP16-021")).toBe(false);
  });

  it("022 Ginne, Bewitching Courtesan — Fanfare, up to 2 (3 with Jiemon): engage an enemy follower that won't refresh; draw and put a card on top or bottom; 2 Glittering Golds", () => {
    const t = d({ me: { hand: ["BP16-022"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP16-022").choose("engage", "gold");
    expect([t.engaged("opp:V5"), t.ex(), t.game.state.effects.some((e) => e.change.kind === "skipNextRefresh")]).toEqual([true, [GOLD, GOLD], true]);
    const all = d({ me: { hand: ["BP16-022"], field: ["BP14-022"], deck: ["V1", "V3"], playPoints: 2 }, opp: { field: ["V5"] } });
    all.play("BP16-022").choose("engage", "draw", "gold").choose("bottom");
    expect([all.hand(), all.zone("me", "deck"), all.ex()]).toEqual([[], ["V3", "V1"], [GOLD, GOLD]]);
  });

  it("023 / 024 Zirconia, Ironcrown Ward — evolved: a Steelclad Knight and a Shield Guardian; super-evolved: +1/+1 and Storm to up to 2 Officer token followers", () => {
    expect(d({ me: { field: ["BP16-023"], evolveDeck: ["BP16-024"], playPoints: 1 } }).evolve("BP16-023").none().field()).toEqual(["BP16-023", STEELCLAD, SHIELD]);
    const s = d({ me: { field: ["BP16-023", KNIGHT], evolveDeck: ["BP16-024"], playPoints: 1, ...SUPER } });
    s.evolve("BP16-023", { sep: true }).pending().none().pick(KNIGHT, STEELCLAD);
    expect([s.stats(KNIGHT), s.keywords(STEELCLAD), s.stats(SHIELD)]).toEqual([[2, 2], ["storm"], [1, 1]]);
  });

  it("025 Amalia, Luxsteel Paladin — Fanfare: 4 damage and an Officer token follower from the EX area; act (0), with 3 differently named Officer tokens: 4 to the enemy leader, draw", () => {
    const t = d({ me: { hand: ["BP16-025"], ex: [KNIGHT, STEELCLAD], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP16-025").pick(STEELCLAD);
    expect([t.stats("opp:V5"), t.field(), t.ex()]).toEqual([[5, 1], ["BP16-025", STEELCLAD], [KNIGHT]]);
    const act = d({ me: { field: ["BP16-025", STEELCLAD, SHIELD, KNIGHT], deck: ["V1"] } }).activate("BP16-025");
    expect([act.leader("opp"), act.hand(), act.canActivate("BP16-025")]).toEqual([16, ["V1"], false]);
    expect(d({ me: { field: ["BP16-025", KNIGHT, KNIGHT, STEELCLAD] } }).canActivate("BP16-025")).toBe(false);
  });

  it("026 Ravening Tentacles — engage a Levin follower; 4 damage, leader +2, draw with a Yurius follower", () => {
    const t = d({ me: { hand: ["BP16-026"], field: ["BP02-027"], deck: ["V1"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP16-026");
    expect([t.stats("opp:V5"), t.leader(), t.hand(), t.engaged("BP02-027")]).toEqual([[5, 1], 22, ["V1"], true]);
    expect(d({ me: { hand: ["BP16-026"], field: ["V1"], playPoints: 1 }, opp: { field: ["V5"] } }).canPlay("BP16-026")).toBe(false);
  });

  it("027 / 028 Luminous Commander — evolved: a Knight, and a Steelclad Knight or Shield Guardian into the EX area; act (0), with 3 Officer token names: 3 to an enemy follower and its leader", () => {
    const t = d({ me: { field: ["BP16-027"], evolveDeck: ["BP16-028"], playPoints: 1 } }).evolve("BP16-027").choose("Shield Guardian");
    expect([t.field(), t.ex()]).toEqual([["BP16-027", KNIGHT], [SHIELD]]);
    const act = d({ me: { field: [{ card: "BP16-027", evolvedInto: "BP16-028" }, STEELCLAD, SHIELD, KNIGHT] }, opp: { field: ["V5"] } }).activate("BP16-027");
    expect([act.stats("opp:V5"), act.leader("opp")]).toEqual([[5, 2], 17]);
  });

  it("029 Luminous Magus — Fanfare: a Shield Guardian or Knight; act (0), with 3 Officer token names: 5 damage and draw", () => {
    expect(d({ me: { hand: ["BP16-029"], playPoints: 2 } }).play("BP16-029").choose("Knight").field()).toEqual(["BP16-029", KNIGHT]);
    const act = d({ me: { field: ["BP16-029", STEELCLAD, SHIELD, KNIGHT], deck: ["V1"] }, opp: { field: ["V5"] } }).activate("BP16-029");
    expect([act.field("opp"), act.hand()]).toEqual([[], ["V1"]]);
  });

  it("030 Rusty, Luxcard Trickster — Storm; Last Words: a Rusty from the deck", () => {
    const t = d({ me: { field: ["BP16-030"], hand: ["QUICK-SAC"], deck: ["V1", "BP16-030"] } }).play("QUICK-SAC").pick("BP16-030");
    expect([t.hand(), t.keywords("BP16-030@hand")]).toEqual([["BP16-030"], ["storm"]]);
  });

  it("031 / 032 Flashstep Quickblader — Storm; evolved: 1 damage to an enemy leader or follower", () => {
    const t = d({ me: { field: ["BP16-031"], evolveDeck: ["BP16-032"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP16-031").pick("opp:leader");
    expect([t.leader("opp"), t.keywords("BP16-031")]).toEqual([19, ["storm"]]);
  });

  it("033 Luminous Lancetrooper — Fanfare: a Steelclad Knight; act (0), with 3 Officer token names: +2 attack and Storm to an Officer token follower", () => {
    expect(d({ me: { hand: ["BP16-033"], playPoints: 2 } }).play("BP16-033").field()).toEqual(["BP16-033", STEELCLAD]);
    const act = d({ me: { field: ["BP16-033", STEELCLAD, SHIELD, KNIGHT] } }).activate("BP16-033").pick(KNIGHT);
    expect([act.stats(KNIGHT), act.keywords(KNIGHT)]).toEqual([[3, 1], ["storm"]]);
  });

  it("034 Lyrala, Luminous Potionwright — Ward; Fanfare: a Steelclad Knight and a Shield Guardian into the EX area; act (0), with 3 Officer token names: leader +2", () => {
    const t = d({ me: { hand: ["BP16-034"], playPoints: 1 } }).play("BP16-034").none();
    expect([t.ex(), t.keywords("BP16-034")]).toEqual([[STEELCLAD, SHIELD], ["ward"]]);
    expect(d({ me: { field: ["BP16-034", STEELCLAD, SHIELD, KNIGHT] } }).activate("BP16-034").leader()).toBe(22);
  });

  it("035 Ignominious Samurai — Assail; Strike: 4 damage to an enemy follower", () => {
    const t = d({ me: { field: ["BP16-035"] }, opp: { field: ["V5"] } }).attack("BP16-035", "opp:leader");
    expect([t.stats("opp:V5"), t.keywords("BP16-035"), t.leader("opp")]).toEqual([[5, 1], ["assail"], 16]);
  });

  it("036 Ironcrown Majesty — a Steelclad Knight, Shield Guardian and Knight, or +1/+1 to your Officer tokens; both after an evolution this turn", () => {
    expect(d({ me: { hand: ["BP16-036"], playPoints: 3 } }).play("BP16-036").choose("summon").none().field()).toEqual([STEELCLAD, SHIELD, KNIGHT]);
    const t = d({ me: { hand: ["BP16-036"], field: ["EVOLVER"], evolveDeck: ["EVOLVER-E"], playPoints: 5 } }).evolve("EVOLVER");
    t.play("BP16-036").choose("summon", "buff").none();
    expect([t.stats(STEELCLAD), t.stats(SHIELD), t.stats(KNIGHT)]).toEqual([[3, 3], [2, 2], [2, 2]]);
  });
});
