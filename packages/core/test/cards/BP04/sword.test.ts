import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP04 Swordcraft (020–037). BP04-027 is an alternate printing of 026. V1 is 1c 2/2, V2 2c 2/3,
// V3 3c 3/4, V5 5c 5/5 (Neutral). BP04-033 Flail Knight is a 2-cost 2/3 Officer (兵士).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);

describe("BP04 Swordcraft", () => {
  it("020 Mars — evolve for 0; each Officer follower put onto your field gets +1 attack, once per Mars", () => {
    const t = d({ me: { hand: ["BP04-033", "V1"], field: ["BP04-020"], playPoints: 3 } });
    t.play("BP04-033").play("V1");
    expect([t.stats("BP04-033"), t.stats("V1")]).toEqual([[3, 3], [2, 2]]);
    const two = d({ me: { hand: ["BP04-033"], field: ["BP04-020", "BP04-020"], playPoints: 2 } }).play("BP04-033").flush();
    expect(two.stats("BP04-033")).toEqual([4, 3]);
  });

  it("021 Mars (Evolved) — pay X of your choice to put an Officer costing X or less from the deck; optional", () => {
    const deck = ["BP04-033", "BP04-022", "V1"];
    const t = d({ me: { field: ["BP04-020"], evolveDeck: ["BP04-021"], deck, playPoints: 3 } });
    t.evolve("BP04-020").yes().choose("2").pick("BP04-033");
    // Evolved Mars also gives the entering Officer +1 attack.
    expect([t.pp(), t.field(), t.stats("BP04-033")]).toEqual([1, ["BP04-020", "BP04-033"], [3, 3]]);
    const decline = d({ me: { field: ["BP04-020"], evolveDeck: ["BP04-021"], deck, playPoints: 3 } }).evolve("BP04-020").no();
    expect([decline.pp(), decline.field(), decline.zone("me", "deck")]).toEqual([3, ["BP04-020"], deck]);
    const zero = d({ me: { field: ["BP04-020"], evolveDeck: ["BP04-021"], deck, playPoints: 3 } }).evolve("BP04-020").yes().choose("0");
    expect([zero.pp(), zero.field(), zero.decision?.type]).toEqual([3, ["BP04-020"], "mainPhase"]);
  });

  it("022 Gawain — Rush; reveal 2 Commander / Arthurian cards to recover 2; the 1st Commander card each turn costs 1 less", () => {
    const fan = d({ me: { hand: ["BP04-022", "BP04-023", "BP04-035"], playPoints: 5 } });
    fan.play("BP04-022").yes();
    expect([fan.pp(), fan.keywords("BP04-022"), fan.game.state.revealed.length]).toEqual([2, ["rush"], 0]);
    const cost = d({ me: { hand: ["BP04-025", "BP04-025"], field: ["BP04-022"], playPoints: 1 } });
    expect(cost.canPlay("BP04-025")).toBe(true);
    cost.play("BP04-025");
    expect(cost.pp()).toBe(1); // the first one was free
    cost.play("BP04-025");
    expect(cost.pp()).toBe(0);
    // A Commander card played before Gawain came out was already the first (ruling).
    const late = d({ me: { hand: ["BP04-025", "BP04-022", "BP04-025"], playPoints: 7 } });
    late.play("BP04-025").play("BP04-022");
    if (late.decision?.type === "confirm") late.no();
    late.play("BP04-025");
    expect(late.pp()).toBe(0);
    // Two Gawains: 2 less (ruling).
    const two = d({ me: { hand: ["BP04-030"], field: ["BP04-022", "BP04-022"], playPoints: 1 } });
    two.play("BP04-030").none();
    expect(two.pp()).toBe(0);
  });

  it("023 / 024 Barbarossa — 2 less with at least 3 enemy cards on the field; Assail; evolved goes to EX when destroyed", () => {
    const cheap = d({ me: { hand: ["BP04-023"], playPoints: 3 }, opp: { field: ["V1", "V1", "AMULET"] } });
    expect(cheap.canPlay("BP04-023")).toBe(true);
    expect(d({ me: { hand: ["BP04-023"], playPoints: 3 }, opp: { field: ["V1", "V1"] } }).canPlay("BP04-023")).toBe(false);
    const evo = d({ me: { field: ["BP04-023"], evolveDeck: ["BP04-024"], hand: ["QUICK-SAC"], playPoints: 1 } });
    evo.evolve("BP04-023");
    expect([evo.stats("BP04-023"), evo.keywords("BP04-023")]).toEqual([[7, 6], ["assail"]]);
    evo.play("QUICK-SAC");
    expect([evo.ex(), evo.zone("me", "evolveDeck")]).toEqual([["BP04-023"], ["BP04-024"]]);
  });

  it("025 Perseus — +1/+1 with at least 4 followers on your field, itself included", () => {
    const t = d({ me: { hand: ["BP04-025"], field: ["V1", "V1", "V1"], playPoints: 1 } }).play("BP04-025");
    expect(t.stats("BP04-025")).toEqual([3, 3]);
    expect(d({ me: { hand: ["BP04-025"], field: ["V1", "V1"], playPoints: 1 } }).play("BP04-025").stats("BP04-025")).toEqual([2, 2]);
  });

  it("026 Cyclone Blade — damage to each enemy follower equal to a Commander follower's current attack", () => {
    const t = d({ me: { hand: ["BP04-026"], field: ["BP04-020", "V5"], playPoints: 3 }, opp: { field: ["V3", "V2"] } });
    t.play("BP04-026");
    expect([t.stats("opp:V3"), t.field("opp")]).toEqual([[3, 1], ["V3"]]);
    expect(d({ me: { hand: ["BP04-026"], field: ["V5"], playPoints: 3 } }).canPlay("BP04-026")).toBe(false);
  });

  it("028 / 029 Shrouded Assassin — Bane; evolved has Assail and Bane", () => {
    const t = d({ me: { field: ["BP04-028"], evolveDeck: ["BP04-029"], playPoints: 2 } });
    expect(t.keywords("BP04-028")).toEqual(["bane"]);
    t.evolve("BP04-028");
    expect([t.stats("BP04-028"), t.keywords("BP04-028")]).toEqual([[3, 4], ["assail", "bane"]]);
  });

  it("030 / 032 Romeo and Juliet — each costs 2 less beside the other; end phase: leader +2 / 2 damage", () => {
    const romeo = d({ me: { hand: ["BP04-030"], field: ["BP04-032", "BP04-032"], playPoints: 1 } });
    romeo.play("BP04-030").none();
    expect([romeo.pp(), romeo.keywords("BP04-030")]).toEqual([0, ["ward"]]);
    const juliet = d({ me: { hand: ["BP04-032"], field: ["BP04-030"], playPoints: 1 } }).play("BP04-032");
    expect([juliet.pp(), juliet.keywords("BP04-032"), juliet.attackTargets("BP04-032")]).toEqual([0, ["storm"], ["opp:leader"]]);

    const end = d({ me: { field: ["BP04-030", "BP04-032"], deck: ["V1"] }, opp: { field: ["V5"], deck: ["V1"] } });
    end.end().flush();
    expect([end.leader(), end.stats("opp:V5")]).toEqual([22, [5, 3]]);
    const alone = d({ me: { field: ["BP04-030"], deck: ["V1"] }, opp: { deck: ["V1"] } }).end();
    expect(alone.leader()).toBe(20);
  });

  it("031 Round Table Assembly — search an Arthurian follower, or +1/+2 to one", () => {
    const search = d({ me: { hand: ["BP04-031"], deck: ["V1", "BP04-035"], playPoints: 1 } });
    search.play("BP04-031").pick("BP04-035"); // no Arthurian follower out: only the search can be chosen
    expect(search.hand()).toEqual(["BP04-035"]);
    const buff = d({ me: { hand: ["BP04-031"], field: ["BP04-035"], playPoints: 1 } });
    buff.play("BP04-031").choose("buff");
    expect(buff.stats("BP04-035")).toEqual([3, 4]);
  });

  it("033 Flail Knight — Strike: 1 damage to an enemy follower and its leader", () => {
    const t = d({ me: { field: ["BP04-033"] }, opp: { field: ["V5"] } });
    t.attack("BP04-033", "opp:leader");
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[5, 4], 17]);
  });

  it("034 Pollux — +1/+1 and Rush beside a non-Swordcraft follower", () => {
    const t = d({ me: { hand: ["BP04-034"], field: ["V1"], playPoints: 4 } }).play("BP04-034");
    expect([t.stats("BP04-034"), t.keywords("BP04-034")]).toEqual([[6, 6], ["rush"]]);
    const sword = d({ me: { hand: ["BP04-034"], field: ["BP04-033"], playPoints: 4 } }).play("BP04-034");
    expect([sword.stats("BP04-034"), sword.keywords("BP04-034")]).toEqual([[5, 5], []]);
  });

  it("035 / 036 Tristan — Ward; evolve returns an Arthurian card from the cemetery to hand", () => {
    const t = d({ me: { field: ["BP04-035"], evolveDeck: ["BP04-036"], cemetery: ["BP04-022", "V1", "BP04-031"], playPoints: 1 } });
    expect(t.keywords("BP04-035")).toEqual(["ward"]);
    t.evolve("BP04-035").pick("BP04-031");
    expect([t.hand(), t.cemetery(), t.keywords("BP04-035")]).toEqual([["BP04-031"], ["BP04-022", "V1"], ["ward"]]);
  });

  it("037 Armor of the Stars — +1/+2 and Aura", () => {
    const t = d({ me: { hand: ["BP04-037"], field: ["V1"], playPoints: 2 } }).play("BP04-037");
    expect([t.stats("V1"), t.keywords("V1")]).toEqual([[3, 4], ["aura"]]);
  });
});
