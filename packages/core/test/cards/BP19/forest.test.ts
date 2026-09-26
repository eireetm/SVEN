import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP19 Forestcraft (001–018). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); QUICK-SAC (0) destroys one of your followers.
// Condemned followers: BP19-001 (2), BP19-005 (2), BP19-009 (1), BP19-011 (2). Orchis / Zwei: BP08-002 (3), BP08-004 (3,
// Fanfare: a Puppet in the EX area becomes a Victoria). Puppetry: BP19-016. Tokens: BP05-T03 Puppet, BP08-T02 Victoria (also
// a Puppet on the field), BP17-T01 Lococo's Teddy Bear (a Puppetry token).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const PUPPET = "BP05-T03";
const VICTORIA = "BP08-T02";
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };
const n = (count: number, id: string) => Array<string>(count).fill(id);

describe("BP19 Forestcraft", () => {
  it("001 / 002 Magachiyo, Barbed Convict — evolved: Storm, Combo (3): 4 damage; super-evolved: Storm to the other Condemned followers", () => {
    const spec = (played: number): DriveSpec => ({ me: { field: ["BP19-001"], evolveDeck: ["BP19-002"], playedThisTurn: played, playPoints: 1 }, opp: { field: ["V5"] } });
    expect(d(spec(3)).evolve("BP19-001").stats("opp:V5")).toEqual([5, 1]);
    expect(d(spec(2)).evolve("BP19-001").stats("opp:V5")).toEqual([5, 5]);
    const s = d({ me: { field: ["BP19-001", "BP19-009"], evolveDeck: ["BP19-002"], playPoints: 1, ...SUPER }, opp: { field: ["V5"] } });
    s.evolve("BP19-001", { sep: true }).flush();
    expect([s.keywords("BP19-009"), s.keywords("BP19-001")]).toEqual([["storm"], ["storm"]]);
  });

  it("003 Wimael, Redolent Enforcer — Fanfare: 4 damage; Last Words: summon this (its Fanfare again)", () => {
    const t = d({ me: { field: ["BP19-003"], hand: ["QUICK-SAC"] }, opp: { field: ["V5"] } }).play("QUICK-SAC").flush();
    expect([t.field(), t.stats("opp:V5")]).toEqual([["BP19-003"], [5, 1]]);
  });

  it("004 Zwei, Symphonic Heart — Fanfare, banish 2 Puppets from the EX area: a Victoria; act, engage, with 3 Puppetry cards: up to 2 Puppets +1/+1", () => {
    const t = d({ me: { hand: ["BP19-004"], ex: [PUPPET, PUPPET], playPoints: 2 } }).play("BP19-004").yes();
    expect(t.ex()).toEqual([VICTORIA]);
    const act = d({ me: { field: ["BP19-004", PUPPET, VICTORIA], cemetery: n(3, "BP19-016") } }).activate("BP19-004").pick(PUPPET, VICTORIA);
    expect([act.stats(PUPPET), act.stats(VICTORIA)]).toEqual([[2, 2], [5, 2]]);
    expect(d({ me: { field: ["BP19-004", PUPPET], cemetery: n(2, "BP19-016") } }).canActivate("BP19-004")).toBe(false);
  });

  it("005 / 006 Verdant Lieutenant — whenever a Condemned follower of yours evolves, Combo (3): draw; evolved: 2 damage", () => {
    const t = d({ me: { field: ["BP19-005", "BP19-001"], evolveDeck: ["BP19-002"], deck: ["V1"], playedThisTurn: 3, playPoints: 1 }, opp: { field: ["V5"] } });
    t.evolve("BP19-001").flush();
    expect([t.hand(), t.stats("opp:V5")]).toEqual([["V1"], [5, 1]]);
    const e = d({ me: { field: ["BP19-005"], evolveDeck: ["BP19-006"], deck: ["V1"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP19-005").flush();
    expect([e.stats("opp:V5"), e.hand()]).toEqual([[5, 3], []]);
  });

  it("007 Warden of Balms — Ward; Fanfare and Last Words: 3 to the enemy leader; act in the hand, discard it: destroy a Condemned follower of yours, 1 to the enemy leader, draw", () => {
    expect(d({ me: { hand: ["BP19-007"], playPoints: 6 } }).play("BP19-007").none().leader("opp")).toBe(17);
    const t = d({ me: { hand: ["BP19-007"], field: ["BP19-001"], deck: ["V1"] } }).activate("BP19-007@hand");
    expect([t.field(), t.leader("opp"), t.hand()]).toEqual([[], 19, ["V1"]]);
    expect(d({ me: { hand: ["BP19-007"], field: ["V1"] } }).canActivate("BP19-007@hand")).toBe(false);
  });

  it("008 Synchronous Hearts — a small Orchis and Zwei follower from the deck onto the field; 2 Puppets into the EX area", () => {
    const t = d({ me: { hand: ["BP19-008"], deck: ["BP08-002", "V1", "BP08-004"], playPoints: 5 } }).play("BP19-008").pick("BP08-002").pick("BP08-004").flush().pick(PUPPET);
    expect([t.field(), t.ex()]).toEqual([["BP08-002", "BP08-004"], [PUPPET, VICTORIA]]);
  });

  it("009 / 010 Budding Initiate — Fanfare, Combo (3): evolve this; evolved: a Condemned card from the top 4", () => {
    const t = d({ me: { hand: ["BP19-009"], evolveDeck: ["BP19-010"], deck: ["V1", "BP19-001", "V3"], playedThisTurn: 2, playPoints: 1 } });
    t.play("BP19-009").yes().pick("BP19-001").order();
    expect([t.hand(), t.game.reader().info(t.id("BP19-009")).evolved]).toEqual([["BP19-001"], true]);
    const two = d({ me: { hand: ["BP19-009"], evolveDeck: ["BP19-010"], playedThisTurn: 1, playPoints: 1 } }).play("BP19-009");
    expect(two.game.reader().info(two.id("BP19-009")).evolved).toBe(false);
  });

  it("011 Leafshade Assassin — a Condemned follower of yours evolving: Combo (3), 3 damage; Fanfare: the next Condemned card 1 less", () => {
    const t = d({ me: { field: ["BP19-011", "BP19-001"], evolveDeck: ["BP19-002"], playedThisTurn: 3, playPoints: 1 }, opp: { field: ["V5"] } });
    t.evolve("BP19-001").flush();
    expect(t.field("opp")).toEqual([]);
    const next = d({ me: { hand: ["BP19-011", "BP19-001"], playPoints: 3 } }).play("BP19-011").play("BP19-001");
    expect(next.pp()).toBe(0);
  });

  it("012 Puppet Workout — 2 Puppets; each Puppetry token follower +2 attack and Assail", () => {
    const t = d({ me: { hand: ["BP19-012"], field: ["BP17-T01"], playPoints: 3 } }).play("BP19-012");
    expect([t.field(), t.stats(PUPPET), t.keywords(PUPPET), t.stats("BP17-T01")]).toEqual([["BP17-T01", PUPPET, PUPPET], [3, 1], ["rush", "assail"], [4, 2]]);
  });

  it("013 / 014 Beast Lancer — Ward; Fanfare and evolved: 3 damage", () => {
    expect(d({ me: { hand: ["BP19-013"], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP19-013").none().stats("opp:V5")).toEqual([5, 2]);
    expect(d({ me: { field: ["BP19-013"], evolveDeck: ["BP19-014"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP19-013").stats("opp:V5")).toEqual([5, 2]);
  });

  it("015 Merchant of the Wood — Rush; Fanfare: draw 2", () => {
    expect(d({ me: { hand: ["BP19-015"], deck: ["V1", "V3"], playPoints: 4 } }).play("BP19-015").hand()).toEqual(["V1", "V3"]);
  });

  it("016 Rogue Puppeteer — Fanfare, discard a Puppetry card: draw, 2 Puppets into the EX area", () => {
    const t = d({ me: { hand: ["BP19-016", "BP19-004"], deck: ["V1"], playPoints: 2 } }).play("BP19-016").yes();
    expect([t.hand(), t.ex()]).toEqual([["V1"], [PUPPET, PUPPET]]);
  });

  it("017 Support Troop Elf — Rush; Fanfare: another card of yours back to the hand", () => {
    expect(d({ me: { hand: ["BP19-017"], field: ["V1"], playPoints: 2 } }).play("BP19-017").hand()).toEqual(["V1"]);
  });

  it("018 Galepierce — return a card of yours: 6 damage and 2 to its leader", () => {
    const t = d({ me: { hand: ["BP19-018"], field: ["V1"], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP19-018").yes();
    expect([t.field("opp"), t.leader("opp"), t.hand()]).toEqual([[], 18, ["V1"]]);
  });
});
