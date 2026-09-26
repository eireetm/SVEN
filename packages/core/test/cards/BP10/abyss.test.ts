import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP10 Abysscraft (074–091). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); QUICK-SAC destroys one of your
// followers; FAN-DRAW draws a card (1). Tokens: BP01-T14 Ghost, BP03-T06 Gargantuan Ghost (Ward);
// BP03-074 Masquerade Ghost; BP10-089's Fanfare damages your leader (Sanguine).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const GHOST = "BP01-T14";
const GARGANTUAN = "BP03-T06";

describe("BP10 Abysscraft", () => {
  it("074 Milteo — discard a card: reveal until 2 followers that cost 3 or less, summon them, the rest to the bottom; end phase Necrocharge (20): evolves", () => {
    const t = d({ me: { hand: ["BP10-074", "V5"], deck: ["V5", "V1", "V5", "V3", "V1"], playPoints: 5 } }).play("BP10-074").yes();
    expect([t.field(), t.zone("me", "deck"), t.cemetery()]).toEqual([["BP10-074", "V1", "V3"], ["V1", "V5", "V5"], ["V5"]]);
    // Only one found in the whole deck: it is summoned (ruling).
    const one = d({ me: { hand: ["BP10-074", "V5"], deck: ["V5", "V1", "V5"], playPoints: 5 } }).play("BP10-074").yes();
    expect([one.field(), one.zone("me", "deck")]).toEqual([["BP10-074", "V1"], ["V5", "V5"]]);
    const end = d({ me: { field: ["BP10-074"], evolveDeck: ["BP10-075"], cemetery: Array<string>(20).fill("V1"), deck: ["V1"] }, opp: { deck: ["V1"] } });
    end.end().yes();
    expect(end.game.reader().info(end.id("BP10-074")).evolved).toBe(true);
  });

  it("075 Milteo (Evolved) — On Evolve (2): destroys each enemy follower and changes the enemy leader's defense to 6 (also up from less)", () => {
    const spec: DriveSpec = {
      me: { field: ["BP10-074"], evolveDeck: ["BP10-075"], cemetery: Array<string>(20).fill("V1"), deck: ["V1"], playPoints: 2 },
      opp: { field: ["V5", "V1"], deck: ["V1"], leaderDefense: 3 },
    };
    const t = d(spec).end().yes().yes();
    expect([t.field("opp"), t.leader("opp")]).toEqual([[], 6]);
    const unpaid = d(spec).end().yes().no();
    expect([unpaid.field("opp"), unpaid.leader("opp")]).toEqual([["V5", "V1"], 3]);
  });

  it("076 Luzen — your leader takes 1 less damage; opponents can't draw outside their start phase; each player discards down to 2", () => {
    const t = d({ me: { hand: ["BP10-076", "V1", "V1", "V3"], playPoints: 7 }, opp: { hand: ["V1", "V1", "V1", "V3"] } }).play("BP10-076").pick("V3").pick("opp:V1", "opp:V1");
    expect([t.hand(), t.hand("opp").sort()]).toEqual([["V1", "V1"], ["V1", "V3"]]);
    const shield = d({ me: { field: ["BP10-076"], hand: ["BP10-089"], playPoints: 1 } }).play("BP10-089");
    expect(shield.leader()).toBe(20);
    const noDraw = d({ me: { hand: ["FAN-DRAW"], deck: ["V1"], playPoints: 1 }, opp: { field: ["BP10-076"] } }).play("FAN-DRAW");
    expect(noDraw.hand()).toEqual([]);
  });

  it("077 Sincere Masquerade Ghost — advanced; Storm; 2 Gargantuan Ghosts, each Ghost entering gets +1 attack and Rush; Last Words: a Masquerade Ghost from the EX area, engaged", () => {
    const t = d({ me: { ex: ["BP10-077"], playPoints: 6 } }).play("BP10-077").none().flush();
    const ghosts = t.game.state.players[0].zones.field.filter((id) => t.game.state.cards[id]!.def === GARGANTUAN);
    expect([ghosts.map((id) => t.game.reader().info(id).attack), t.keywords(GARGANTUAN), t.keywords("BP10-077")]).toEqual([[4, 4], ["ward", "rush"], ["storm"]]);
    const lw = d({ me: { field: ["BP10-077"], ex: ["BP03-074"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC");
    expect([lw.field(), lw.engaged("BP03-074"), lw.ex()]).toEqual([["BP03-074"], true, []]);
  });

  it("078 / 079 Deathbringer — Fanfare and evolved On Evolve: destroy, 2 to its leader, leader +2", () => {
    const t = d({ me: { hand: ["BP10-078"], playPoints: 8 }, opp: { field: ["V5"] } }).play("BP10-078");
    expect([t.field("opp"), t.leader("opp"), t.leader()]).toEqual([[], 18, 22]);
    const evo = d({ me: { field: ["BP10-078"], evolveDeck: ["BP10-079"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP10-078");
    expect([evo.field("opp"), evo.leader("opp"), evo.leader()]).toEqual([[], 18, 22]);
  });

  it("080 Demonium — Bane, Drain; with Sanguine +1/+1, Rush and Assail; Strike: damage equal to its attack to the enemy leader (not drained)", () => {
    const t = d({ me: { hand: ["BP10-089", "BP10-080"], playPoints: 4 } }).play("BP10-089").play("BP10-080");
    expect([t.stats("BP10-080"), t.keywords("BP10-080")]).toEqual([[3, 4], ["bane", "drain", "rush", "assail"]]);
    const strike = d({ me: { field: ["BP10-080"] } }).attack("BP10-080", "opp:leader");
    expect([strike.leader("opp"), strike.leader()]).toEqual([16, 22]);
  });

  it("081 Sincere Soul — summons a Masquerade Ghost with Ward from the deck; from the cemetery (4, banish it) with one in the EX area: Sincere Masquerade Ghost from the evolve deck", () => {
    const t = d({ me: { hand: ["BP10-081"], deck: ["V1", "BP03-074"], playPoints: 4 } }).play("BP10-081").pick("BP03-074");
    expect([t.field(), t.keywords("BP03-074")]).toEqual([["BP03-074"], ["ward"]]);
    // Put onto the field from another zone, so its Fanfare triggers too (CR 12.4.3).
    const act = d({ me: { cemetery: ["BP10-081"], ex: ["BP03-074"], evolveDeck: ["BP10-077"], playPoints: 4 } }).activate("BP10-081").pick("BP10-077").none().flush();
    expect([act.field(), act.zone("me", "banished"), act.pp()]).toEqual([["BP10-077", GARGANTUAN, GARGANTUAN], ["BP10-081"], 0]);
    const noGhost = d({ me: { cemetery: ["BP10-081"], evolveDeck: ["BP10-077"], playPoints: 4 } }).activate("BP10-081");
    expect(noGhost.field()).toEqual([]);
  });

  it("082 / 083 Ghost Maid — Fanfare a Ghost; evolved: a Ghost into the EX area and the top card buried", () => {
    expect(d({ me: { hand: ["BP10-082"], playPoints: 2 } }).play("BP10-082").field()).toEqual(["BP10-082", GHOST]);
    const evo = d({ me: { field: ["BP10-082"], evolveDeck: ["BP10-083"], deck: ["V1", "V3"], playPoints: 1 } }).evolve("BP10-082");
    expect([evo.ex(), evo.cemetery()]).toEqual([[GHOST], ["V1"]]);
  });

  it("084 Insatiable Desire — 2 to your leader, draw 2; from the cemetery with Luzen on your field (banish it): 4 damage and a draw", () => {
    const t = d({ me: { hand: ["BP10-084"], deck: ["V1", "V3"], playPoints: 2 } }).play("BP10-084");
    expect([t.leader(), t.hand()]).toEqual([18, ["V1", "V3"]]);
    const act = d({ me: { cemetery: ["BP10-084"], field: ["BP10-076"], deck: ["V1"] }, opp: { field: ["V5"] } }).activate("BP10-084");
    expect([act.stats("opp:V5"), act.hand()]).toEqual([[5, 1], ["V1"]]);
    expect(d({ me: { cemetery: ["BP10-084"] }, opp: { field: ["V5"] } }).canActivate("BP10-084")).toBe(false);
  });

  it("085 Unselfish Grace — grace counters equal to your hand; remove 2: leader +1; (1, engage, bury): a 7-cost Arcana card from the deck", () => {
    const t = d({ me: { hand: ["BP10-085", "V1", "V1", "V1"], playPoints: 1 } }).play("BP10-085");
    expect(t.counters("BP10-085", "grace")).toBe(3);
    const act = d({ me: { field: [{ card: "BP10-085", counters: { grace: 3 } }] } }).activate("BP10-085");
    expect([act.leader(), act.counters("BP10-085", "grace"), act.canActivate("BP10-085")]).toEqual([21, 1, false]);
    const search = d({ me: { field: ["BP10-085"], deck: ["BP10-020", "BP10-034"], playPoints: 1 } }).activate("BP10-085").pick("BP10-034");
    expect([search.hand(), search.cemetery()]).toEqual([["BP10-034"], ["BP10-085"]]);
  });

  it("086 / 087 Moonrise Werewolf — evolved: 3 damage to the selected follower with Sanguine", () => {
    const t = d({ me: { hand: ["BP10-089"], field: ["BP10-086"], evolveDeck: ["BP10-087"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP10-089").evolve("BP10-086");
    expect(t.stats("opp:V5")).toEqual([5, 2]);
    const calm = d({ me: { field: ["BP10-086"], evolveDeck: ["BP10-087"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP10-086");
    expect(calm.stats("opp:V5")).toEqual([5, 5]);
  });

  it("088 Spirit Curator — a Ghost into the EX area, or with a Ghost follower there an Abysscraft card from the top 3", () => {
    expect(d({ me: { hand: ["BP10-088"], playPoints: 2 } }).play("BP10-088").choose("ghost").ex()).toEqual([GHOST]);
    const look = d({ me: { hand: ["BP10-088"], ex: [GHOST], deck: ["V1", "BP10-082", "V3"], playPoints: 2 } }).play("BP10-088").choose("look").pick("BP10-082").order();
    expect(look.hand()).toEqual(["BP10-082"]);
    const none = d({ me: { hand: ["BP10-088"], deck: ["V1", "BP10-082", "V3"], playPoints: 2 } }).play("BP10-088").choose("look");
    expect(none.hand()).toEqual([]);
  });

  it("089 Silverbolt Hunter — Fanfare: 1 to your leader; Last Words: a follower of yours +1/+1", () => {
    const t = d({ me: { hand: ["BP10-089", "QUICK-SAC"], field: ["V1"], playPoints: 1 } }).play("BP10-089").play("QUICK-SAC").pick("BP10-089");
    expect([t.leader(), t.stats("V1")]).toEqual([19, [3, 3]]);
  });

  it("090 Soul Box — Rush; destroys the selected follower with a spell in your cemetery; 5 to the enemy leader with an amulet on your field", () => {
    const t = d({ me: { hand: ["BP10-090"], cemetery: ["KILL"], field: ["BP01-T10"], playPoints: 7 }, opp: { field: ["V5"] } }).play("BP10-090").flush();
    expect([t.field("opp"), t.leader("opp"), t.keywords("BP10-090")]).toEqual([[], 15, ["rush"]]);
    const none = d({ me: { hand: ["BP10-090"], playPoints: 7 }, opp: { field: ["V5"] } }).play("BP10-090").flush();
    expect([none.field("opp"), none.leader("opp")]).toEqual([["V5"], 20]);
  });

  it("091 Colossal Grudge — costs 3 less with a Ghost follower in your EX area; 4 to an enemy follower and 2 to its leader", () => {
    const t = d({ me: { hand: ["BP10-091"], ex: [GHOST], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP10-091");
    expect([t.stats("opp:V5"), t.leader("opp"), t.pp()]).toEqual([[5, 1], 18, 0]);
    expect(d({ me: { hand: ["BP10-091"], playPoints: 3 }, opp: { field: ["V5"] } }).canPlay("BP10-091")).toBe(false);
  });
});
