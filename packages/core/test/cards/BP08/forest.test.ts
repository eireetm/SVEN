import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP08 Forestcraft (001–017). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Forestcraft); QUICK-SAC destroys
// one of your followers, KILL an enemy follower. Tokens: BP05-T03 Puppet, BP08-T01 Lloyd,
// BP08-T02 Victoria, BP01-T02 Fairy Wisp, BP05-T04 Ancient Artifact. BP08-012 Junk and BP08-007
// are Puppetry and Hunter cards.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const PUPPET = "BP05-T03";
const LLOYD = "BP08-T01";
const VICTORIA = "BP08-T02";

describe("BP08 Forestcraft", () => {
  it("001 Forest Oracle Pascale — Ward; Fanfare puts an enemy follower on top of its deck; end phase: others +2/+2, leader +4", () => {
    const t = d({ me: { hand: ["BP08-001"], playPoints: 7 }, opp: { field: ["V5"], deck: ["V1"] } }).play("BP08-001").none();
    expect([t.field("opp"), t.zone("opp", "deck"), t.keywords("BP08-001")]).toEqual([[], ["V5", "V1"], ["ward"]]);
    const end = d({ me: { field: ["BP08-001", "V1"], deck: ["V3"] }, opp: { deck: ["V3"] } }).end();
    expect([end.stats("V1"), end.stats("BP08-001"), end.leader()]).toEqual([[4, 4], [4, 7], 24]);
  });

  it("002 Orchis, Puppet Girl — evolves into the Resolute face, or for 4 into the Vengeful face with 3 Puppetry cards in the cemetery", () => {
    const front = d({ me: { field: ["BP08-002"], evolveDeck: ["BP08-003"], playPoints: 1 } });
    expect(() => front.evolve("BP08-002", { into: "BP08-003_back" })).toThrow();
    front.evolve("BP08-002", { into: "BP08-003" });
    expect(front.field()).toEqual(["BP08-002", PUPPET, PUPPET]);
    const back = d({ me: { field: ["BP08-002"], evolveDeck: ["BP08-003"], cemetery: ["BP08-012", "BP08-012", "BP08-012"], playPoints: 4 } });
    back.evolve("BP08-002", { into: "BP08-003_back" });
    expect([back.field(), back.pp()]).toEqual([["BP08-002", PUPPET, PUPPET, PUPPET, PUPPET], 0]);
  });

  it("003 Orchis, Resolute Puppet — once on your turn a Puppet leaving puts a Lloyd into the EX area, also when Orchis leaves with it", () => {
    const orchis = { card: "BP08-002", evolvedInto: "BP08-003" };
    const t = d({ me: { field: [orchis, PUPPET, PUPPET], hand: ["QUICK-SAC", "QUICK-SAC"] } });
    t.play("QUICK-SAC").pick(PUPPET);
    expect(t.ex()).toEqual([LLOYD]);
    t.play("QUICK-SAC").pick(PUPPET);
    expect(t.ex()).toEqual([LLOYD]);
    // Unbodied Witch (Evolved) buries Orchis and the Puppet together (ruling).
    const both = d({ me: { field: ["BP08-038", orchis, PUPPET], evolveDeck: ["BP08-039"], playPoints: 1 } });
    both.evolve("BP08-038");
    expect([both.field(), both.ex()]).toEqual([["BP08-038"], [LLOYD]]);
  });

  it("003_back Orchis, Vengeful Puppet — Puppets (Lloyd too) have Assail; each Puppet leaving deals 2 to an enemy leader or follower", () => {
    const t = d({
      me: { field: [{ card: "BP08-002", evolvedInto: "BP08-003_back" }, PUPPET, LLOYD, "V1"], hand: ["QUICK-SAC"] },
      opp: { field: ["V3"] },
    });
    expect([t.keywords(PUPPET), t.keywords(LLOYD), t.keywords("V1")]).toEqual([["rush", "assail"], ["ward", "assail"], []]);
    t.play("QUICK-SAC").pick(LLOYD).pick("opp:leader");
    expect(t.leader("opp")).toBe(18);
    // Not for a follower that is not a Puppet.
    const other = d({ me: { field: [{ card: "BP08-002", evolvedInto: "BP08-003_back" }, "V1"], hand: ["QUICK-SAC"] } });
    other.play("QUICK-SAC").pick("V1");
    expect([other.decision?.type, other.leader("opp")]).toEqual(["mainPhase", 20]);
  });

  it("004 / 005 Zwei — Fanfare transforms a Puppet in the EX area into Victoria (not a Lloyd there); evolved: a Victoria takes no damage this turn", () => {
    const t = d({ me: { hand: ["BP08-004"], ex: [PUPPET, LLOYD], playPoints: 3 } }).play("BP08-004");
    expect(t.ex().sort()).toEqual([LLOYD, VICTORIA]);
    const evo = d({ me: { field: ["BP08-004", VICTORIA], evolveDeck: ["BP08-005"], playPoints: 2 }, opp: { field: [{ card: "V5", engaged: true }] } });
    evo.evolve("BP08-004").attack(VICTORIA, "opp:V5");
    expect([evo.stats(VICTORIA), evo.stats("opp:V5")]).toEqual([[4, 1], [5, 1]]);
  });

  it("006 Lycoris — Bane; on your turn an enemy follower going to the cemetery deals 1 to its leader; act: another follower gets Bane", () => {
    const t = d({ me: { field: ["BP08-006", "V1"], hand: ["KILL"], playPoints: 1 }, opp: { field: ["V3"] } });
    t.play("KILL");
    expect([t.leader("opp"), t.keywords("BP08-006")]).toEqual([19, ["bane"]]);
    t.activate("BP08-006");
    expect([t.keywords("V1"), t.engaged("BP08-006")]).toEqual([["bane"], true]);
  });

  it("007 Lina & Lena — Storm; Strike: +1 attack with at least 3 followers on your field", () => {
    const three = d({ me: { hand: ["BP08-007"], field: ["V1", "V1"], playPoints: 4 } }).play("BP08-007").attack("BP08-007", "opp:leader");
    expect([three.stats("BP08-007"), three.leader("opp")]).toEqual([[4, 3], 16]);
    const two = d({ me: { hand: ["BP08-007"], field: ["V1"], playPoints: 4 } }).play("BP08-007").attack("BP08-007", "opp:leader");
    expect(two.leader("opp")).toBe(17);
  });

  it("008 / 009 Michelle — evolved searches a Forestcraft follower that costs 5 or more", () => {
    // V5 is Neutral; BP08-001 is a 7-cost Forestcraft follower.
    const t = d({ me: { field: ["BP08-008"], evolveDeck: ["BP08-009"], deck: ["V5", "BP08-001"], playPoints: 2 } });
    t.evolve("BP08-008").pick("BP08-001");
    expect([t.hand(), t.zone("me", "deck")]).toEqual([["BP08-001"], ["V5"]]);
  });

  it("010 Liam — Fanfare: 2 Puppets into the EX area; act with 3 Puppetry cards in the cemetery: a Puppetry card from the top 3", () => {
    expect(d({ me: { hand: ["BP08-010"], playPoints: 2 } }).play("BP08-010").ex()).toEqual([PUPPET, PUPPET]);
    expect(d({ me: { field: ["BP08-010"], cemetery: ["BP08-012", "BP08-012"], deck: ["V1"] } }).canActivate("BP08-010")).toBe(false);
    const t = d({ me: { field: ["BP08-010"], cemetery: ["BP08-012", "BP08-012", "BP08-012"], deck: ["V1", "BP08-012", "V3", "V5"] } });
    t.activate("BP08-010").pick("BP08-012").order("V3", "V1");
    expect([t.hand(), t.zone("me", "deck"), t.engaged("BP08-010")]).toEqual([["BP08-012"], ["V5", "V3", "V1"], true]);
  });

  it("011 Heartless Battle — 2 Puppets in the EX area become a Lloyd and a Victoria; not playable with 1 Puppet", () => {
    const t = d({ me: { hand: ["BP08-011"], ex: [PUPPET, PUPPET], playPoints: 3 } }).play("BP08-011").pick(PUPPET);
    expect(t.ex().sort()).toEqual([LLOYD, VICTORIA]);
    expect(d({ me: { hand: ["BP08-011"], ex: [PUPPET, LLOYD], playPoints: 3 } }).canPlay("BP08-011")).toBe(false);
  });

  it("012 Junk — Fanfare: 2 Puppets into the EX area", () => {
    expect(d({ me: { hand: ["BP08-012"], playPoints: 1 } }).play("BP08-012").ex()).toEqual([PUPPET, PUPPET]);
  });

  it("013 / 014 Insane Dark Elf — Strike: a Fairy Wisp; evolved refreshes after combat damage on your turn, not after hitting a leader", () => {
    const t = d({ me: { field: ["BP08-013"] } }).attack("BP08-013", "opp:leader");
    expect([t.ex(), t.leader("opp")]).toEqual([["BP01-T02"], 16]);
    const evolved = { card: "BP08-013", evolvedInto: "BP08-014" };
    const fight = d({ me: { field: [evolved] }, opp: { field: [{ card: "V1", engaged: true }] } }).attack("BP08-013", "opp:V1");
    expect([fight.field("opp"), fight.engaged("BP08-013"), fight.ex()]).toEqual([[], false, ["BP01-T02"]]);
    const leader = d({ me: { field: [evolved] } }).attack("BP08-013", "opp:leader");
    expect([leader.engaged("BP08-013"), leader.leader("opp")]).toEqual([true, 15]);
  });

  it("015 Zealot of Unkilling — with 3 Hunter cards in the cemetery, an enemy follower gets -4 attack (can go negative)", () => {
    const hunters = ["BP08-007", "BP08-007", "BP08-017"];
    const t = d({ me: { hand: ["BP08-015"], cemetery: hunters, playPoints: 2 }, opp: { field: ["V1"] } }).play("BP08-015");
    expect(t.stats("opp:V1")).toEqual([-2, 2]);
    const few = d({ me: { hand: ["BP08-015"], cemetery: hunters.slice(1), playPoints: 2 }, opp: { field: ["V1"] } }).play("BP08-015");
    expect(few.stats("opp:V1")).toEqual([2, 2]);
  });

  it("016 Knower of History — Fanfare summons an Ancient Artifact; a token follower put onto your field deals 2 to an enemy follower", () => {
    const t = d({ me: { hand: ["BP08-016", "BP08-012"], playPoints: 6 }, opp: { field: ["V3"] } }).play("BP08-016");
    expect([t.field(), t.stats("opp:V3")]).toEqual([["BP08-016", "BP05-T04"], [3, 2]]);
    // A token played from the EX area.
    t.play("BP08-012").play(PUPPET);
    expect(t.field("opp")).toEqual([]);
  });

  it("017 Ward of Unkilling — Fanfare: -2 attack; act (1, engage, bury this): summon a Hunter follower that costs 2 or less from the cemetery", () => {
    const t = d({ me: { hand: ["BP08-017"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP08-017");
    expect(t.stats("opp:V5")).toEqual([3, 5]);
    const act = d({ me: { field: ["BP08-017"], cemetery: ["BP08-015", "BP08-007"], playPoints: 1 } }).activate("BP08-017");
    expect([act.field(), act.cemetery().sort(), act.pp()]).toEqual([["BP08-015"], ["BP08-007", "BP08-017"], 0]);
  });
});
