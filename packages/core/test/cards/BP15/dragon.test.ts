import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP15 Dragoncraft (057–075, PR13). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral); QUICK-SAC (0) destroys
// one of your followers. Overflow: max play points 7 or more. BP06-061 is Whitefrost Whisper. Tokens: BP15-PR13
// Fangs of Ardent Destruction, BP01-T11 Dragon.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const FANGS = "BP15-PR13";
const DRAGON = "BP01-T11";

describe("BP15 Dragoncraft", () => {
  it("057 Galmieux, Ardent Disdain — Fanfare: a Fangs of Ardent Destruction; ability damage on your turn: one of the top 2 into the EX area (an Omen card 3 less this turn), bury the rest", () => {
    expect(d({ me: { hand: ["BP15-057"], playPoints: 5 } }).play("BP15-057").ex()).toEqual([FANGS]);
    const t = d({ me: { field: ["BP15-057"], hand: ["BP15-064"], deck: ["V1", "BP15-066", "V3"], playPoints: 1 } }).play("BP15-064").pick("BP15-066");
    expect([t.ex(), t.hand(), t.cemetery(), t.stats("BP15-057"), t.canPlay("BP15-066@ex")]).toEqual([["BP15-066"], ["V1"], ["BP15-064", "V3"], [5, 4], true]);
  });

  it("058 / 059 Filene, Blizzardous Heart — Bane; Fanfare: with Overflow, the opponent's cards cost 1 more during their next turn; evolved: a Whitefrost card from the deck", () => {
    const restrictions = (t: ReturnType<typeof d>) => t.game.state.restrictions.map((r) => [r.player, r.kind]);
    const t = d({ me: { hand: ["BP15-058"], maxPlayPoints: 7, playPoints: 2 } }).play("BP15-058");
    expect([restrictions(t), t.keywords("BP15-058")]).toEqual([[[1, "playCostPlus1"]], ["bane"]]);
    expect(restrictions(d({ me: { hand: ["BP15-058"], maxPlayPoints: 6, playPoints: 2 } }).play("BP15-058"))).toEqual([]);
    const evo = d({ me: { field: ["BP15-058"], evolveDeck: ["BP15-059"], deck: ["V1", "BP06-061"], playPoints: 1 } }).evolve("BP15-058").pick("BP06-061");
    expect([evo.hand(), evo.keywords("BP15-058")]).toEqual([["BP06-061"], ["bane"]]);
  });

  it("060 / 061 Celestial Dragoon — discarding a card, engage it: draw (once for 2 discards); evolved: a Dragoncraft card (7 or more) from the top 5", () => {
    const t = d({ me: { field: ["BP15-060"], hand: ["BP15-074", "BP15-074"], deck: ["V1", "V3", "V5"], playPoints: 1 } }).activate("BP15-074@hand").pending().yes();
    expect([t.hand(), t.engaged("BP15-060"), t.cemetery()]).toEqual([["V1", "V3", "V5"], true, ["BP15-074", "BP15-074"]]);
    const evo = d({ me: { field: ["BP15-060"], evolveDeck: ["BP15-061"], deck: ["V1", "BP15-074", "V3", "V5", "V2"], playPoints: 1 } }).evolve("BP15-060").pick("BP15-074").order();
    expect(evo.hand()).toEqual(["BP15-074"]);
  });

  it("062 / 063 Mermaid of Punishment — another Marine follower onto your field: 1 to the enemy leader; evolved: up to 2 Marine cards from the top 5 into the EX area, 2 less this turn", () => {
    const t = d({ me: { field: ["BP15-062"], hand: ["BP15-069"], playPoints: 2 } }).play("BP15-069").flush();
    expect([t.leader("opp"), t.stats("BP15-062")]).toEqual([19, [4, 4]]);
    const evo = d({ me: { field: ["BP15-062"], evolveDeck: ["BP15-063"], deck: ["BP15-069", "V1", "BP15-075", "V3", "V5"], playPoints: 1 } });
    evo.evolve("BP15-062").pick("BP15-069", "BP15-075").order();
    expect([evo.ex(), evo.canPlay("BP15-069@ex")]).toEqual([["BP15-069", "BP15-075"], true]);
  });

  it("064 Ardent Torch — 1 damage to your follower and the enemy leader, draw; not playable without a follower of yours", () => {
    const t = d({ me: { field: ["V3"], hand: ["BP15-064"], deck: ["V1"], playPoints: 1 } }).play("BP15-064");
    expect([t.stats("V3"), t.leader("opp"), t.hand()]).toEqual([[3, 3], 19, ["V1"]]);
    expect(d({ me: { hand: ["BP15-064"], playPoints: 1 } }).canPlay("BP15-064")).toBe(false);
  });

  it("065 Whitefrost Blizzard — 2 less with a Filene follower on your field; max play points of damage divided among any number of enemy followers", () => {
    const t = d({ me: { field: ["BP15-058"], hand: ["BP15-065"], maxPlayPoints: 5, playPoints: 2 }, opp: { field: ["V5", "V3"] } });
    t.play("BP15-065").pick("opp:V5", "opp:V3").choose("4");
    expect([t.stats("opp:V5"), t.stats("opp:V3")]).toEqual([[5, 1], [3, 3]]);
    expect(d({ me: { hand: ["BP15-065"], maxPlayPoints: 5, playPoints: 2 }, opp: { field: ["V5"] } }).canPlay("BP15-065")).toBe(false);
  });

  it("066 / 067 Adherent of Ardor — Fanfare: 1 damage to up to 2 of your followers with Overflow; ability damage on your turn: 3 to an enemy follower; evolved: 1 damage to up to 2 of yours", () => {
    const t = d({ me: { hand: ["BP15-066"], maxPlayPoints: 7, playPoints: 3 }, opp: { field: ["V5"] } }).play("BP15-066").pick("BP15-066");
    expect([t.stats("BP15-066"), t.stats("opp:V5")]).toEqual([[3, 2], [5, 2]]);
    expect(d({ me: { hand: ["BP15-066"], maxPlayPoints: 6, playPoints: 3 }, opp: { field: ["V5"] } }).play("BP15-066").pick("BP15-066").stats("BP15-066")).toEqual([3, 3]);
    const evo = d({ me: { field: ["BP15-066"], evolveDeck: ["BP15-067"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP15-066").pick("BP15-066");
    expect([evo.stats("BP15-066"), evo.stats("opp:V5")]).toEqual([[4, 3], [5, 2]]);
  });

  it("068 Windswept Dragonewt — Rush; Fanfare: +1/+1 with Overflow; Strike: leader + its defense", () => {
    const t = d({ me: { hand: ["BP15-068"], maxPlayPoints: 7, playPoints: 2 } }).play("BP15-068");
    expect([t.stats("BP15-068"), t.keywords("BP15-068")]).toEqual([[4, 2], ["rush"]]);
    const s = d({ me: { field: [{ card: "BP15-068", damage: 0 }] } }).attack("BP15-068", "opp:leader");
    expect([s.leader(), s.leader("opp")]).toEqual([21, 17]);
  });

  it("069 Tropical Mermaid — Fanfare: +1/+1 to another Marine follower; played from the EX area, +2/+2, Rush and Assail", () => {
    expect(d({ me: { field: ["BP15-075"], hand: ["BP15-069"], playPoints: 2 } }).play("BP15-069").stats("BP15-075")).toEqual([3, 4]);
    const ex = d({ me: { field: ["BP15-075"], ex: ["BP15-069"], playPoints: 2 } }).play("BP15-069@ex");
    expect([ex.stats("BP15-075"), ex.keywords("BP15-075")]).toEqual([[4, 5], ["ward", "rush", "assail"]]);
  });

  it("070 / 071 Tiniest Dragon — evolved: 5 damage to each follower", () => {
    const t = d({ me: { field: ["BP15-070", "V5"], evolveDeck: ["BP15-071"], playPoints: 3 }, opp: { field: ["V5", "V3"] } }).evolve("BP15-070");
    expect([t.field(), t.field("opp")]).toEqual([[], []]);
  });

  it("072 Hermit of Disdain — Fanfare: 1 damage to your follower with Overflow; ability damage on your turn: an Omen card on top to the hand", () => {
    const t = d({ me: { hand: ["BP15-072"], deck: ["BP15-066", "V1"], maxPlayPoints: 7, playPoints: 1 } }).play("BP15-072").pick("BP15-066");
    expect([t.hand(), t.stats("BP15-072")]).toEqual([["BP15-066"], [0, 1]]);
    const other = d({ me: { hand: ["BP15-072"], deck: ["V1"], maxPlayPoints: 7, playPoints: 1 } }).play("BP15-072");
    expect([other.hand(), other.zone("me", "deck")]).toEqual([[], ["V1"]]);
  });

  it("073 Beginner Dragoon — Fanfare: a Dragon into the EX area, 2 less this turn with Overflow", () => {
    expect(d({ me: { hand: ["BP15-073"], maxPlayPoints: 7, playPoints: 4 } }).play("BP15-073").canPlay(`${DRAGON}@ex`)).toBe(true);
    const t = d({ me: { hand: ["BP15-073"], maxPlayPoints: 6, playPoints: 4 } }).play("BP15-073");
    expect([t.ex(), t.canPlay(`${DRAGON}@ex`)]).toEqual([[DRAGON], false]);
  });

  it("074 Orbed Cancer — Fanfare: draw 3; from the hand, (1) and discard it and a Dragoncraft card (7 or more): draw 2", () => {
    expect(d({ me: { hand: ["BP15-074"], deck: ["V1", "V2", "V3"], playPoints: 7 } }).play("BP15-074").hand()).toEqual(["V1", "V2", "V3"]);
    expect(d({ me: { hand: ["BP15-074", "V5"], deck: ["V1", "V2"], playPoints: 1 } }).canActivate("BP15-074")).toBe(false);
  });

  it("075 Whimsical Mermaid — Ward; Last Words: another Marine follower from the cemetery into the EX area", () => {
    const t = d({ me: { field: ["BP15-075"], hand: ["QUICK-SAC"], cemetery: ["BP15-069", "BP15-075"] } }).play("QUICK-SAC");
    expect([t.ex(), t.keywords("BP15-075@cemetery")]).toEqual([["BP15-069"], ["ward"]]);
  });

  it("PR13 Fangs of Ardent Destruction — 1 damage to each follower; Storm for your Galmieux, Ardent Disdain with Overflow", () => {
    const t = d({ me: { ex: [FANGS], field: ["BP15-057"], maxPlayPoints: 7, playPoints: 1 }, opp: { field: ["V1"] } }).play(`${FANGS}@ex`);
    expect([t.stats("BP15-057"), t.keywords("BP15-057"), t.stats("opp:V1")]).toEqual([[5, 4], ["storm"], [2, 1]]);
    expect(d({ me: { ex: [FANGS], field: ["BP15-057"], maxPlayPoints: 6, playPoints: 1 } }).play(`${FANGS}@ex`).keywords("BP15-057")).toEqual([]);
  });
});
