import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP08 Abysscraft (069–085). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5;
// QUICK-SAC destroys one of your followers. BP03-089 deals 1 to your leader and enables Sanguine.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const ten = (card: string) => Array<string>(10).fill(card);

describe("BP08 Abysscraft", () => {
  it("069 / 070 Crimson Rose Queen — Thorn Burst; evolved reveals the hand, recovers PP, and triggers once for an original-cost-2 card", () => {
    expect(d({ me: { hand: ["BP08-069"], playPoints: 6 } }).play("BP08-069").ex()).toEqual(["BP01-T01"]);

    const t = d({
      me: { field: ["BP08-069"], evolveDeck: ["BP08-070"], hand: ["V2", "BP08-079", "V1"], playPoints: 2 },
      opp: { field: ["V5"] },
    });
    t.evolve("BP08-069");
    expect(t.pp()).toBe(2);
    t.play("V2").choose("leader");
    expect([t.pp(), t.leader("opp")]).toEqual([0, 18]);
  });

  it("071 Nephthys — up to 4 differently named qualifying followers from the top 7, then destroys them", () => {
    const t = d({
      me: { hand: ["BP08-071"], deck: ["BP08-074", "BP08-074", "BP08-076", "V1"], playPoints: 7 },
    });
    t.play("BP08-071").pick("BP08-074").pick("BP08-076").order();
    expect([t.field(), t.cemetery(), t.zone("me", "deck")]).toEqual([
      ["BP08-071"],
      ["BP08-074", "BP08-076"],
      ["BP08-074", "V1"],
    ]);
  });

  it("071 / 080 Nephthys and Arion — Arion may revive a cheap follower destroyed simultaneously", () => {
    const t = d({ me: { hand: ["BP08-071"], deck: ["BP08-080", "BP08-076"], playPoints: 7 } });
    t.play("BP08-071").pick("BP08-080").pick("BP08-076").flush();
    expect([t.field(), t.cemetery()]).toEqual([["BP08-071", "BP08-076"], ["BP08-080"]]);
  });

  it("072 Tartarus — costs 5 less at 15 Departed; hand act moves itself to EX and takes a Departed from the top 2", () => {
    const reduced = d({ me: { hand: ["BP08-072"], cemetery: Array<string>(15).fill("BP08-076"), playPoints: 5 } });
    reduced.play("BP08-072");
    expect(reduced.pp()).toBe(0);

    const act = d({ me: { hand: ["BP08-072"], deck: ["BP08-076", "V1"], playPoints: 1 } });
    act.activate("BP08-072").pick("BP08-076");
    expect([act.pp(), act.ex(), act.hand(), act.cemetery()]).toEqual([0, ["BP08-072"], ["BP08-076"], ["V1"]]);
  });

  it("073 Tartarus (Evolved) — puts a Departed follower from the cemetery onto the field", () => {
    const t = d({ me: { field: ["BP08-072"], evolveDeck: ["BP08-073"], cemetery: ["BP08-076"], playPoints: 1 } });
    t.evolve("BP08-072");
    expect([t.field(), t.cemetery()]).toEqual([["BP08-072", "BP08-076"], []]);
  });

  it("074 Vuella — reveals the top card once; an original-cost-2 card goes to EX and costs 2 less", () => {
    const two = d({ me: { field: ["BP08-074"], deck: ["BP08-079"], playPoints: 1 } }).activate("BP08-074");
    expect([two.ex(), two.canPlay("BP08-079"), two.canActivate("BP08-074")]).toEqual([["BP08-079"], true, false]);
    const other = d({ me: { field: ["BP08-074"], deck: ["V3"], playPoints: 1 } }).activate("BP08-074");
    expect([other.zone("me", "deck"), other.ex(), other.canActivate("BP08-074")]).toEqual([["V3"], [], false]);
  });

  it("075 / 083 Sonata — fixes Necrocharge before moving Rulenye; its discard can revive Zealot of Silence", () => {
    const t = d({
      me: {
        hand: ["BP08-075"],
        cemetery: ["BP05-070", "BP08-083", ...Array<string>(8).fill("V1")],
        playPoints: 3,
      },
      opp: { hand: ["V2"] },
    });
    t.play("BP08-075").pending("BP08-083").yes().flush();
    expect([t.field(), t.hand("opp"), t.pp()]).toEqual([["BP05-070", "BP08-083"], [], 0]);
  });

  it("076 / 077 Chris Pumpkinhead — end phase Necrocharge buffs, gives Ward and engages; evolved buries 2", () => {
    const end = d({ me: { field: ["BP08-076", "V1"], cemetery: ten("V2"), deck: ["V3"] }, opp: { deck: ["V1"] } });
    end.end().pick("V1");
    expect([end.stats("V1"), end.keywords("V1"), end.engaged("V1")]).toEqual([[3, 3], ["ward"], true]);

    const evo = d({ me: { field: ["BP08-076"], evolveDeck: ["BP08-077"], deck: ["V1", "V2", "V3"], playPoints: 1 } });
    evo.evolve("BP08-076");
    expect([evo.cemetery(), evo.zone("me", "deck")]).toEqual([["V1", "V2"], ["V3"]]);
  });

  it("078 Salome — Fanfare and Last Words each deal 2 to a required enemy follower and give leader +1", () => {
    const noTarget = d({ me: { hand: ["BP08-078"], playPoints: 3 } }).play("BP08-078");
    expect([noTarget.field(), noTarget.leader()]).toEqual([["BP08-078"], 20]);
    const t = d({ me: { hand: ["BP08-078", "QUICK-SAC"], playPoints: 3 }, opp: { field: ["V5"] } });
    t.play("BP08-078").play("QUICK-SAC");
    expect([t.stats("opp:V5"), t.leader()]).toEqual([[5, 1], 22]);
  });

  it("079 Kiss of Lust — leader +2 and draws 2 instead of 1 while Sanguine is active", () => {
    const t = d({ me: { hand: ["BP03-089", "BP08-079"], deck: ["V1", "V2"], playPoints: 3 } });
    t.play("BP03-089").play("BP08-079");
    expect([t.leader(), t.hand()]).toEqual([21, ["V1", "V2"]]);
  });

  it("081 / 082 Marian — buries 2; evolved keywords follow both Necrocharge thresholds", () => {
    const t = d({ me: { hand: ["BP08-081"], deck: ["V1", "V2", "V3"], playPoints: 3 } }).play("BP08-081");
    expect([t.cemetery(), t.zone("me", "deck")]).toEqual([["V1", "V2"], ["V3"]]);
    const seven = d({ me: { field: [{ card: "BP08-081", evolvedInto: "BP08-082" }], cemetery: Array<string>(7).fill("V1") } });
    expect(seven.keywords("BP08-081")).toEqual(["ward", "assail"]);
    const fifteen = d({ me: { field: [{ card: "BP08-081", evolvedInto: "BP08-082" }], cemetery: Array<string>(15).fill("V1") } });
    expect(fifteen.keywords("BP08-081")).toEqual(["ward", "assail", "storm", "bane"]);
  });

  it("084 Zealot of Lust — leader-defense cost and target are required; usable exactly twice per turn", () => {
    expect(d({ me: { field: ["BP08-084"] } }).canActivate("BP08-084")).toBe(false);
    const t = d({ me: { field: ["BP08-084"] }, opp: { field: ["V5"] } });
    t.activate("BP08-084").activate("BP08-084");
    expect([t.leader(), t.stats("opp:V5"), t.canActivate("BP08-084")]).toEqual([18, [5, 3], false]);
  });

  it("085 Manifest Malice — deals 3, then may banish 4 cemetery cards to return the resolving spell", () => {
    const t = d({ me: { hand: ["BP08-085"], cemetery: ["V1", "V2", "V3", "V5"], playPoints: 2 }, opp: { field: ["V5"] } });
    t.play("BP08-085").yes();
    expect([t.stats("opp:V5"), t.hand(), t.zone("me", "banished"), t.cemetery()]).toEqual([
      [5, 2],
      ["BP08-085"],
      ["V1", "V2", "V3", "V5"],
      [],
    ]);
  });
});
