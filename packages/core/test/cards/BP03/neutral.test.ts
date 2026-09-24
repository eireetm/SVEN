import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP03 Neutral (107–121).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);

describe("BP03 Neutral", () => {
  it("107 / 108 Alice, Wonderland Explorer — a Fable counter, moved onto a Fable follower; evolved takes up to 2 from the top 4", () => {
    const t = d({
      me: {
        hand: ["BP03-107"],
        ex: ["BP03-101"],
        evolveDeck: ["BP03-108"],
        deck: ["BP03-090", "BP03-101", "V1", "V5"],
        playPoints: 4,
      },
    });
    t.play("BP03-107");
    expect(t.counters("BP03-107", "fable")).toBe(1);
    t.activate("BP03-107").pick("BP03-101");
    expect([t.counters("BP03-101", "fable"), t.counters("BP03-107", "fable")]).toEqual([1, 0]);
    t.evolve("BP03-107").pick("BP03-090", "BP03-101").order();
    expect([t.stats("BP03-107"), t.ex(), t.zone("me", "deck")]).toEqual([[4, 4], ["BP03-101", "BP03-090", "BP03-101"], ["V1", "V5"]]);
    // The counter on the EX card stays when it is played (CR 10.6.2.1.3, 10.6.2.8.1.1; ruling):
    // Tin Soldier then gets one more from its own Fanfare.
    const play = d({ me: { field: [{ card: "BP03-107", counters: { fable: 1 } }], ex: ["BP03-101"], playPoints: 3 } });
    play.activate("BP03-107").pick("BP03-101@ex").play("BP03-101");
    expect(play.counters("BP03-101", "fable")).toBe(2);
  });

  it("109 Angel of Chaos — banish 3 Fallen Angels, Steal an enemy follower and refresh it, once per turn", () => {
    const t = d({
      me: { field: ["BP03-109"], cemetery: ["BP03-118", "BP03-119", "BP03-111"] },
      opp: { field: [{ card: "V5", damage: 2, engaged: true }] },
    });
    t.activate("BP03-109");
    expect(t.field("opp")).toEqual([]);
    expect([t.stats("V5"), t.engaged("V5"), t.canActivate("BP03-109")]).toEqual([[5, 3], false, false]);
    const stolen = t.game.state.players[0].zones.field.find((id) => t.game.state.cards[id]!.def === "V5")!;
    expect(t.game.state.cards[stolen]!.owner).toBe(1);
    expect(t.zone("me", "banished")).toEqual(["BP03-118", "BP03-119", "BP03-111"]);

    const full = d({
      me: { field: ["BP03-109", "V1", "V1", "V1", "V1"], cemetery: ["BP03-118", "BP03-119", "BP03-111"] },
      opp: { field: [{ card: "V5", engaged: true }] },
    });
    full.activate("BP03-109");
    // Not stolen (field full), but still refreshed on its own field (ruling).
    expect([full.field("opp"), full.engaged("opp:V5"), full.zone("me", "banished")]).toEqual([["V5"], false, ["BP03-118", "BP03-119", "BP03-111"]]);
  });

  it("110 Rapunzel — Ward; it cannot attack until it has a Fable counter", () => {
    const none = d({ me: { field: ["BP03-110"] }, opp: { field: [{ card: "V1", engaged: true }] } });
    expect([none.keywords("BP03-110"), none.attackTargets("BP03-110")]).toEqual([["ward"], []]);
    const marked = d({ me: { field: [{ card: "BP03-110", counters: { fable: 1 } }] }, opp: { field: [{ card: "V1", engaged: true }] } });
    expect(marked.attackTargets("BP03-110")).toEqual(["V1", "opp:leader"]);
  });

  it("111 Seraph of Sin — 2 damage; Last Words returns a Fallen Angel costing 3 or less", () => {
    const t = d({
      me: { hand: ["BP03-111", "QUICK-SAC"], cemetery: ["BP03-119", "BP03-109"], playPoints: 4 },
      opp: { field: ["V5"] },
    });
    t.play("BP03-111").pick("opp:leader");
    expect(t.leader("opp")).toBe(18);
    t.play("QUICK-SAC");
    expect([t.hand(), t.cemetery()]).toEqual([["BP03-119"], ["BP03-109", "BP03-111", "QUICK-SAC"]]);
  });

  it("112 / 113 Garuel, Seraphic Leo — may put a cheap Neutral follower that returns to the deck bottom; evolve bounces another", () => {
    const t = d({
      me: { hand: ["BP03-112", "V1", "V5"], deck: ["V2"], maxPlayPoints: 2, playPoints: 4 },
      opp: { deck: ["V1"] },
    });
    t.play("BP03-112").yes();
    expect(t.field()).toEqual(["BP03-112", "V1"]);
    expect(t.hand()).toEqual(["V5"]);
    t.end();
    expect([t.field(), t.zone("me", "deck")]).toEqual([["BP03-112"], ["V2", "V1"]]);
    const evo = d({
      me: { field: ["BP03-112", "V1", "BP03-090"], evolveDeck: ["BP03-113"], playPoints: 1 },
    });
    evo.evolve("BP03-112");
    expect([evo.stats("BP03-112"), evo.field(), evo.hand()]).toEqual([[3, 4], ["BP03-112", "BP03-090"], ["V1"]]);
  });

  it("114 Actress Feria — engage to put a Fable counter on another Fable follower", () => {
    const t = d({ me: { field: ["BP03-114", "BP03-110", "V1"] } });
    expect(t.canActivate("BP03-114")).toBe(true);
    t.activate("BP03-114");
    expect([t.counters("BP03-110", "fable"), t.engaged("BP03-114")]).toEqual([1, true]);
    expect(d({ me: { field: ["BP03-114"] } }).canActivate("BP03-114")).toBe(false);
  });

  it("115 / 116 Humpty Dumpty — evolve, then 5 to every follower, 3 to the enemy leader, and discard your hand", () => {
    const t = d({
      me: { field: ["BP03-115", "V1", "BP03-093"], hand: ["V2", "V3"], evolveDeck: ["BP03-116"], playPoints: 0 },
      opp: { field: ["V5"] },
    });
    t.evolve("BP03-115");
    expect([t.field(), t.stats("BP03-093"), t.leader("opp"), t.hand(), t.cemetery(), t.cemetery("opp")]).toEqual([
      ["BP03-093"],
      [4, 1],
      17,
      [],
      ["V2", "V3", "BP03-115", "V1"],
      ["V5"],
    ]);
  });

  it("117 Winged Inversion — discard an Angel to destroy, or a Fallen Angel for +3 defense and a draw", () => {
    // The discards are optional additional costs: the spell can be played for 1 play point with
    // no effect, even without an Angel or Fallen Angel follower in hand (ruling).
    const bare = d({ me: { hand: ["BP03-117"], playPoints: 1 }, opp: { field: ["V5"] } });
    expect(bare.canPlay("BP03-117")).toBe(true);
    bare.play("BP03-117").choose("angel"); // the only enemy follower is selected automatically
    expect([bare.field("opp"), bare.pp(), bare.cemetery()]).toEqual([["V5"], 0, ["BP03-117"]]);
    const angel = d({
      me: { hand: ["BP03-117", "BP03-112", "BP03-109"], playPoints: 1 },
      opp: { field: ["V5", "V3"] },
    });
    angel.play("BP03-117").choose("angel").pick("opp:V5").yes().pick("BP03-112");
    expect([angel.field("opp"), angel.cemetery()]).toEqual([["V3"], ["BP03-112", "BP03-117"]]);
    const decline = d({ me: { hand: ["BP03-117", "BP03-112"], playPoints: 1 }, opp: { field: ["V5"] } });
    decline.play("BP03-117").choose("angel").no();
    expect([decline.field("opp"), decline.hand()]).toEqual([["V5"], ["BP03-112"]]);
    const fallen = d({ me: { hand: ["BP03-117", "BP03-119"], deck: ["V1"], playPoints: 1 } });
    fallen.play("BP03-117").yes();
    expect([fallen.leader(), fallen.hand(), fallen.cemetery()]).toEqual([23, ["V1"], ["BP03-119", "BP03-117"]]);
  });

  it("118 Angel of Darkness — engage and bury a Fallen Angel follower to deal 4", () => {
    const self = d({ me: { field: ["BP03-118"] }, opp: { field: ["V5", "V3"] } });
    self.activate("BP03-118").pick("opp:V3");
    expect([self.field("opp"), self.field(), self.cemetery(), self.cemetery("opp")]).toEqual([["V5"], [], ["BP03-118"], ["V3"]]);
    const other = d({ me: { field: ["BP03-118", "BP03-119"] }, opp: { field: ["V5"] } });
    other.activate("BP03-118").pick("BP03-119");
    expect([other.stats("opp:V5"), other.field(), other.engaged("BP03-118")]).toEqual([[5, 1], ["BP03-118"], true]);
  });

  it("119 / 120 Harbinger of the Night — 1 damage to an enemy follower; evolve deals 1 to the enemy leader", () => {
    const t = d({
      me: { hand: ["BP03-119"], evolveDeck: ["BP03-120"], playPoints: 3 },
      opp: { field: ["V5", "V3"] },
    });
    t.play("BP03-119").pick("opp:V5");
    expect(t.stats("opp:V5")).toEqual([5, 4]);
    t.evolve("BP03-119");
    expect([t.stats("BP03-119"), t.leader("opp")]).toEqual([[3, 3], 19]);
  });

  it("121 Eggsplosion — X is 1 plus Eggsplosions and Humpty Dumptys in your cemetery, not this spell", () => {
    const plain = d({ me: { hand: ["BP03-121"], field: ["V1"], playPoints: 3 }, opp: { field: ["V5"] } });
    plain.play("BP03-121");
    expect([plain.stats("V1"), plain.stats("opp:V5"), plain.leader("opp"), plain.cemetery()]).toEqual([[2, 1], [5, 4], 19, ["BP03-121"]]);
    const more = d({
      me: { hand: ["BP03-121"], cemetery: ["BP03-115", "BP03-121"], field: ["BP03-093"], playPoints: 3 },
      opp: { field: ["V5"] },
    });
    more.play("BP03-121");
    expect([more.stats("BP03-093"), more.stats("opp:V5"), more.leader("opp")]).toEqual([[4, 3], [5, 2], 17]);
  });
});
