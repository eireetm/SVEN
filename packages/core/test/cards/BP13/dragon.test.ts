import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP13 Dragoncraft (054–070). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral); AMULET a 1-cost
// amulet. Overflow is max play points 7 or more. Draconic Duelist followers: BP13-054 Drache (4),
// BP13-061 Flame Pillar Dragonewt (4), BP13-059 Roy (3), BP13-067 Earthen Dragonewt (2, also a Dragonewt),
// BP13-056 Forte (10). Marine: BP13-065 Margarite Mermaid, BP13-069 Coral Shark, BP11-063 Mermaid Guide.
// Armed: BP03-064 Hammer Dragonewt (follower), BP02-068 Draconic Armor (spell). Token: BP01-T11 Dragon.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const OVERFLOW = { playPoints: 7, maxPlayPoints: 7 };
const DRAGON = "BP01-T11";
const maxPp = (t: ReturnType<typeof d>) => t.game.state.players[0].maxPlayPoints;

describe("BP13 Dragoncraft", () => {
  it("054 Drache — Rush; Fanfare: the next Draconic Duelist card this turn costs 3 less", () => {
    const t = d({ me: { hand: ["BP13-054", "V3", "BP13-061"], playPoints: 5 } }).play("BP13-054");
    expect([t.keywords("BP13-054"), t.canPlay("V3"), t.canPlay("BP13-061")]).toEqual([["rush"], false, true]);
    t.play("BP13-061");
    expect([t.field(), t.pp()]).toEqual([["BP13-054", "BP13-061"], 0]);
  });

  it("055 Drache (Evolved) — Assail; On Evolve: summon a Draconic Duelist follower that costs up to its attack from the cemetery", () => {
    const t = d({ me: { field: ["BP13-054"], evolveDeck: ["BP13-055"], cemetery: ["BP13-061", "BP13-056", "V1"], playPoints: 4 } }).evolve("BP13-054");
    expect([t.field(), t.cemetery(), t.keywords("BP13-054")]).toEqual([["BP13-054", "BP13-061"], ["BP13-056", "V1"], ["assail"]]);
  });

  it("056 Forte — (0) a Dragon once per turn; Dragons on your field have Storm and Drain; end phase: up to 2 enemy followers can't attack next turn", () => {
    const t = d({ me: { field: ["BP13-056"] }, opp: { field: ["V5", "V3"], deck: ["V1"] } }).activate("BP13-056");
    expect([t.field(), t.keywords(DRAGON), t.canActivate("BP13-056"), t.attackTargets(DRAGON)]).toEqual([
      ["BP13-056", DRAGON],
      ["storm", "drain"],
      false,
      ["opp:leader"],
    ]);
    t.end().pick("opp:V5");
    // The opponent's turn: V5 can't attack, V3 can.
    expect([t.attackTargets("opp:V5"), t.attackTargets("opp:V3")]).toEqual([[], ["opp:leader"]]);
  });

  it("057 Godfire Phoenix — can't attack; evolves (1) only with Overflow", () => {
    const t = d({ me: { field: ["BP13-057"], evolveDeck: ["BP13-058"], playPoints: 6, maxPlayPoints: 6 } });
    expect([t.attackTargets("BP13-057"), t.canEvolve("BP13-057")]).toEqual([[], false]);
    expect(d({ me: { field: ["BP13-057"], evolveDeck: ["BP13-058"], ...OVERFLOW } }).canEvolve("BP13-057")).toBe(true);
  });

  it("058 Godfire Phoenix (Evolved) — end phase: with 10 max play points, banish an enemy follower and leader +3; not played without a target", () => {
    const spec = (pp: number, opp: string[]): DriveSpec => ({
      me: { field: ["BP13-057"], evolveDeck: ["BP13-058"], playPoints: pp, maxPlayPoints: pp },
      opp: { field: opp, deck: ["V1"] },
    });
    const t = d(spec(10, ["V5"])).evolve("BP13-057").end();
    expect([t.field("opp"), t.zone("opp", "banished"), t.leader()]).toEqual([[], ["V5"], 23]);
    const nine = d(spec(9, ["V5"])).evolve("BP13-057").end();
    expect([nine.field("opp"), nine.leader()]).toEqual([["V5"], 20]);
    expect(d(spec(10, [])).evolve("BP13-057").end().leader()).toBe(20);
  });

  it("059 Roy — Rush while an amulet is on your field; Fanfare: with 3 Draconic Duelist cards on your field, max play points +1", () => {
    const t = d({ me: { hand: ["BP13-059"], field: ["AMULET", "BP13-067", "BP13-061"], playPoints: 3, maxPlayPoints: 5 } }).play("BP13-059");
    expect([t.keywords("BP13-059"), maxPp(t)]).toEqual([["rush"], 6]);
    const two = d({ me: { hand: ["BP13-059"], field: ["BP13-067"], playPoints: 3, maxPlayPoints: 5 } }).play("BP13-059");
    expect([two.keywords("BP13-059"), maxPp(two)]).toEqual([[], 5]);
  });

  it("060 Howling Conflagration — 3 damage; for 3 more, a Drache from the deck with Assail; not playable without a target", () => {
    const t = d({ me: { hand: ["BP13-060"], deck: ["BP13-054", "V1"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP13-060");
    expect([t.stats("opp:V5"), t.field()]).toEqual([[5, 2], []]);
    const plus = d({ me: { hand: ["BP13-060"], deck: ["BP13-054", "V1"], playPoints: 5 }, opp: { field: ["V5"] } });
    plus.play("BP13-060").choose("plus3").pick("BP13-054");
    expect([plus.stats("opp:V5"), plus.field(), plus.keywords("BP13-054"), plus.pp()]).toEqual([[5, 2], ["BP13-054"], ["rush", "assail"], 0]);
    expect(d({ me: { hand: ["BP13-060"], deck: ["BP13-054"], playPoints: 5 } }).canPlay("BP13-060")).toBe(false);
  });

  it("061 / 062 Flame Pillar Dragonewt — Fanfare: 4 damage with Overflow; evolved: a Draconic Duelist follower that costs 3 or less from the deck", () => {
    expect(d({ me: { hand: ["BP13-061"], ...OVERFLOW }, opp: { field: ["V5"] } }).play("BP13-061").stats("opp:V5")).toEqual([5, 1]);
    expect(d({ me: { hand: ["BP13-061"], playPoints: 6, maxPlayPoints: 6 }, opp: { field: ["V5"] } }).play("BP13-061").stats("opp:V5")).toEqual([5, 5]);
    const evo = d({ me: { field: ["BP13-061"], evolveDeck: ["BP13-062"], deck: ["V1", "BP13-054", "BP13-059", "BP13-067"], playPoints: 1 } });
    expect(() => evo.evolve("BP13-061").pick("BP13-054")).toThrow(/not a candidate/);
    evo.pick("BP13-059");
    expect(evo.field()).toEqual(["BP13-061", "BP13-059"]);
  });

  it("063 Empyreal Dragon — Ward; Fanfare: any number of Dragoncraft cards that cost 7 or more from the top 5 to the hand", () => {
    const t = d({ me: { hand: ["BP13-063"], deck: ["BP13-056", "V1", "BP13-063", "BP13-061", "V5", "V2"], playPoints: 7 } });
    t.play("BP13-063").none().pick("BP13-056", "BP13-063").order();
    expect([t.hand(), t.zone("me", "deck"), t.keywords("BP13-063@field")]).toEqual([
      ["BP13-056", "BP13-063"],
      ["V2", "V1", "BP13-061", "V5"],
      ["ward"],
    ]);
  });

  it("064 Scalebound Plight — engage a Dragoncraft follower that costs 7 or more: 2 to the enemy leader, leader +2, draw 2", () => {
    const t = d({ me: { hand: ["BP13-064"], field: ["BP13-063"], deck: ["V1", "V2"], playPoints: 1 } }).play("BP13-064");
    expect([t.engaged("BP13-063"), t.leader("opp"), t.leader(), t.hand()]).toEqual([true, 18, 22, ["V1", "V2"]]);
    expect(d({ me: { hand: ["BP13-064"], field: ["BP13-061"], playPoints: 1 } }).canPlay("BP13-064")).toBe(false);
    expect(d({ me: { hand: ["BP13-064"], field: [{ card: "BP13-063", engaged: true }], playPoints: 1 } }).canPlay("BP13-064")).toBe(false);
  });

  it("065 / 066 Margarite Mermaid — evolved: a Marine card from the top 4 into the EX area", () => {
    const t = d({ me: { field: ["BP13-065"], evolveDeck: ["BP13-066"], deck: ["V1", "BP13-069", "V2", "V3", "V5"], playPoints: 1 } });
    t.evolve("BP13-065").pick("BP13-069").order();
    expect([t.ex(), t.zone("me", "deck")]).toEqual([["BP13-069"], ["V5", "V1", "V2", "V3"]]);
  });

  it("067 Earthen Dragonewt — Fanfare: a Draconic Duelist card on top may go to the hand (else it stays); leader +2 with Overflow", () => {
    const t = d({ me: { hand: ["BP13-067"], deck: ["BP13-061", "V1"], ...OVERFLOW } }).play("BP13-067").pick("BP13-061");
    expect([t.hand(), t.leader()]).toEqual([["BP13-061"], 22]);
    const kept = d({ me: { hand: ["BP13-067"], deck: ["BP13-061", "V1"], playPoints: 2 } }).play("BP13-067").none();
    expect([kept.hand(), kept.zone("me", "deck"), kept.leader()]).toEqual([[], ["BP13-061", "V1"], 20]);
    expect(d({ me: { hand: ["BP13-067"], deck: ["V1"], playPoints: 2 } }).play("BP13-067").zone("me", "deck")).toEqual(["V1"]);
  });

  it("068 Dualblade Dragonfolk — Fanfare: discard an Armed card to search an Armed spell", () => {
    const t = d({ me: { hand: ["BP13-068", "BP03-064"], deck: ["V1", "BP02-068", "BP03-064"], playPoints: 1 } }).play("BP13-068").yes().pick("BP02-068");
    expect([t.hand(), t.cemetery()]).toEqual([["BP02-068"], ["BP03-064"]]);
  });

  it("069 Coral Shark — Rush; Fanfare: +X attack for the other Marine followers on your field", () => {
    const t = d({ me: { hand: ["BP13-069"], field: ["BP13-065", "BP11-063", "V1"], playPoints: 2 } }).play("BP13-069");
    expect([t.stats("BP13-069"), t.keywords("BP13-069")]).toEqual([[5, 1], ["rush"]]);
  });

  it("070 Beating of the Dragonwings — bury a Dragonewt follower: 4 damage and draw; not playable without either (rulings)", () => {
    const t = d({ me: { hand: ["BP13-070"], field: ["BP13-067"], deck: ["V1"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP13-070");
    expect([t.stats("opp:V5"), t.cemetery(), t.hand()]).toEqual([[5, 1], ["BP13-067", "BP13-070"], ["V1"]]);
    expect(d({ me: { hand: ["BP13-070"], field: ["V1"], playPoints: 1 }, opp: { field: ["V5"] } }).canPlay("BP13-070")).toBe(false);
    expect(d({ me: { hand: ["BP13-070"], field: ["BP13-067"], playPoints: 1 } }).canPlay("BP13-070")).toBe(false);
  });
});
