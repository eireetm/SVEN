import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// CSD02b (CINDERELLA GIRLS starter deck, Cool). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). CP02-T01 is a Magical Item. Cool
// followers with only Evolve: CP02-042 Hina Araki (2c 2/2), CP02-039 Kanade Hayami (3c 3/3). QUICK-SAC (0) destroys a follower of yours.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const ITEM = "CP02-T01";

describe("CSD02b Cool", () => {
  it("001 Rin Shibuya [Triad Primus] — Storm; Fanfare with 3 Cool followers: another follower with 3 attack or less gets Storm; act (1), Lesson (1): +1 attack", () => {
    const t = d({ me: { hand: ["CSD02b-001"], field: ["CP02-042", "CP02-039"], playPoints: 3 } }).play("CSD02b-001").pick("CP02-042");
    expect([t.keywords("CP02-042"), t.keywords("CSD02b-001")]).toEqual([["storm"], ["storm"]]);
    const a = d({ me: { field: ["CSD02b-001"], ex: [ITEM, ITEM], playPoints: 2 } }).activate("CSD02b-001");
    expect([a.stats("CSD02b-001"), a.canActivate("CSD02b-001")]).toEqual([[4, 3], false]);
  });

  it("002 Nao Kamiya [Over the Rainbow] — Fanfare: up to 2 Cool followers costing 4 in total from the top 5", () => {
    const t = d({ me: { hand: ["CSD02b-002"], deck: ["CP02-042", "CP02-039", "CP02-042", "V1", "V3"], playPoints: 5 } }).play("CSD02b-002");
    t.pick("CP02-042").pick("CP02-042").order();
    expect([t.field(), t.zone("me", "deck")]).toEqual([["CSD02b-002", "CP02-042", "CP02-042"], ["CP02-039", "V1", "V3"]]);
  });

  it("003 Karen Hojo [Song for Life] — end phase without another Cool follower: 1 damage to itself; act (3), Lesson (1): each follower of yours +1 attack", () => {
    expect(d({ me: { field: ["CSD02b-003"] }, opp: { deck: ["V1"] } }).end().stats("CSD02b-003")).toEqual([3, 1]);
    expect(d({ me: { field: ["CSD02b-003", "CP02-042"] }, opp: { deck: ["V1"] } }).end().stats("CSD02b-003")).toEqual([3, 2]);
    const a = d({ me: { field: ["CSD02b-003", "V1"], ex: [ITEM], playPoints: 3 } }).activate("CSD02b-003");
    expect([a.stats("CSD02b-003"), a.stats("V1")]).toEqual([[4, 2], [3, 2]]);
  });

  it("004 Yasuha Okazaki — Fanfare: a Cool follower costing 2 or less from the deck onto the field", () => {
    expect(d({ me: { hand: ["CSD02b-004"], deck: ["CP02-039", "CP02-042"], playPoints: 4 } }).play("CSD02b-004").pick("CP02-042").field()).toEqual(["CSD02b-004", "CP02-042"]);
  });

  it("005 / 006 Yukimi Sajo — Fanfare (2), Lesson (1): +1/+1; evolved: another Cool follower +1 attack, Rush, Assail", () => {
    expect(d({ me: { hand: ["CSD02b-005"], ex: [ITEM], playPoints: 4 } }).play("CSD02b-005").yes().stats("CSD02b-005")).toEqual([3, 3]);
    const e = d({ me: { field: ["CSD02b-005", "CP02-042"], evolveDeck: ["CSD02b-006"], playPoints: 1 } }).evolve("CSD02b-005");
    expect([e.stats("CP02-042"), e.keywords("CP02-042")]).toEqual([[3, 2], ["rush", "assail"]]);
  });

  it("007 / 008 Kako Takafuji — Evolve (2); evolved, (3): 3 damage to the enemy leader", () => {
    const e = d({ me: { field: ["CSD02b-007"], evolveDeck: ["CSD02b-008"], playPoints: 5 } }).evolve("CSD02b-007").yes();
    expect([e.leader("opp"), e.pp()]).toEqual([17, 0]);
  });

  it("009 Chizuru Matsuo — Fanfare: another Cool follower +1 attack; Last Words: a Cool follower +1 attack", () => {
    expect(d({ me: { hand: ["CSD02b-009"], field: ["CP02-042"], playPoints: 2 } }).play("CSD02b-009").stats("CP02-042")).toEqual([3, 2]);
    const t = d({ me: { field: ["CSD02b-009", "CP02-042"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").pick("CSD02b-009");
    expect(t.stats("CP02-042")).toEqual([3, 2]);
  });

  it("010 / 011 Seira Mizuki — Storm; evolved: 5 damage", () => {
    expect(d({ me: { hand: ["CSD02b-010"], playPoints: 5 } }).play("CSD02b-010").attackTargets("CSD02b-010")).toEqual(["opp:leader"]);
    const e = d({ me: { field: ["CSD02b-010"], evolveDeck: ["CSD02b-011"], playPoints: 2 }, opp: { field: ["V5"] } }).evolve("CSD02b-010");
    expect([e.field("opp"), e.keywords("CSD02b-010")]).toEqual([[], ["storm"]]);
  });
});
