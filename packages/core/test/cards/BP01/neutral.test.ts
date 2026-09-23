import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP01 Neutral (151–180). 171 Goblin / 174 Goliath have their own files.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);

describe("BP01 Neutral", () => {
  it("151 Gabriel — another follower +4/+3 and Assail", () => {
    const t = d({ me: { hand: ["BP01-151"], field: ["V1"], playPoints: 6 }, opp: { field: ["V2"] } }).play("BP01-151").none();
    expect(t.stats("V1")).toEqual([6, 5]);
    expect(t.attackTargets("V1")).toEqual(["V2", "opp:leader"]);
  });

  it("152 / 153 Lucifer — end phase: leader +4; evolved: 4 to the enemy leader", () => {
    const t = d({ me: { field: ["BP01-152", { card: "BP01-152", evolvedInto: "BP01-153" }] }, opp: { deck: ["V1"] } }).end().flush();
    expect([t.leader(), t.leader("opp")]).toEqual([24, 16]);
  });

  it("154 Flame and Glass — Storm; Strike 3 to each enemy follower, 7 with Harnessed Flame and Glass in the cemetery", () => {
    const t = d({ me: { hand: ["BP01-154"], playPoints: 10 }, opp: { field: ["V2", "V5"] } }).play("BP01-154").attack("BP01-154", "opp:leader");
    expect(t.field("opp")).toEqual(["V5"]); // V2 (2/3) died, V5 took 3
    const full = d({ me: { hand: ["BP01-154"], cemetery: ["BP01-166", "BP01-167"], playPoints: 10 }, opp: { field: ["V5"] } });
    full.play("BP01-154").attack("BP01-154", "opp:leader");
    expect(full.field("opp")).toEqual([]);
  });

  it("155 / 156 Urd — enemy follower into its owner's EX area (evolved card removed); evolved: banish from their EX area", () => {
    const t = d({ me: { hand: ["BP01-155"], playPoints: 4 }, opp: { field: [{ card: "BP01-171", evolvedInto: "BP01-172", damage: 1 }] } });
    t.play("BP01-155");
    expect(t.ex("opp")).toEqual(["BP01-171"]);
    expect(t.game.state.cards[t.id("opp:BP01-172")]!.faceUp).toBe(true); // back to the evolve deck, faceup
    const evo = d({ me: { field: ["BP01-155"], evolveDeck: ["BP01-156"], playPoints: 1 }, opp: { ex: ["V5"] } }).evolve("BP01-155");
    expect(evo.zone("opp", "banished")).toEqual(["V5"]);
  });

  it("157 Wind God — fanfare +1 attack; end phase: each of your followers +1 attack", () => {
    const t = d({ me: { hand: ["BP01-157"], field: ["V1"], playPoints: 4 }, opp: { deck: ["V1"] } }).play("BP01-157").pick("V1");
    expect(t.stats("V1")).toEqual([3, 2]);
    t.end();
    expect([t.stats("V1"), t.stats("BP01-157")]).toEqual([
      [4, 2],
      [2, 5],
    ]);
  });

  it("159 / 160 Bellringer Angel — Last Words draw; evolved: 2 damage on evolve", () => {
    const t = d({ me: { field: ["BP01-159"], evolveDeck: ["BP01-160"], playPoints: 2 }, opp: { field: ["V2"] } }).evolve("BP01-159");
    expect(t.stats("opp:V2")).toEqual([2, 1]);
    const lw = d({ me: { field: [{ card: "BP01-159", damage: 2 }], hand: ["V1"], deck: ["V2"], playPoints: 1 } }).play("V1");
    expect(lw.hand()).toEqual(["V2"]);
  });

  it("161 Altered Fate — hands go back into the decks; each draws as many, you one more", () => {
    const t = d({ me: { hand: ["BP01-161", "V1", "V1"], deck: ["V3", "V3", "V3"], playPoints: 2 }, opp: { hand: ["V5"], deck: [] } });
    t.play("BP01-161");
    expect(t.hand()).toHaveLength(3);
    expect(t.hand("opp")).toEqual(["V5"]);
  });

  it("162 Path to Purgatory — draw 3 and 3 to your leader; at your end phase with 6 or less defense: 6 to each enemy follower", () => {
    const t = d({ me: { hand: ["BP01-162"], deck: ["V1", "V1", "V1"], playPoints: 3, leaderDefense: 9 }, opp: { field: ["V5"], deck: ["V1"] } });
    t.play("BP01-162");
    expect([t.hand(), t.leader()]).toEqual([["V1", "V1", "V1"], 6]);
    t.end().yes();
    expect(t.field("opp")).toEqual([]);
    expect(t.cemetery()).toEqual(["BP01-162"]);
  });

  it("164 Goblinmount Demon — 2 damage to each other follower of yours", () => {
    const t = d({ me: { hand: ["BP01-164"], field: ["V1", "V3"], playPoints: 5 } }).play("BP01-164").none();
    expect(t.field()).toEqual(["V3", "BP01-164"]);
    expect(t.stats("V3")).toEqual([3, 2]);
  });

  it("166 / 167 Harnessed Flame and Glass — Glass cycles a card; Flame buries both to bring Flame and Glass", () => {
    const t = d({ me: { hand: ["BP01-167", "V5"], field: ["BP01-166"], deck: ["V1", "BP01-154"], playPoints: 4 } });
    t.play("BP01-167").pick("V5");
    expect(t.zone("me", "deck")).toEqual(["BP01-154", "V5"]);
    t.activate("BP01-166").pick("BP01-154");
    expect(t.field()).toEqual(["BP01-154"]);
    expect(t.cemetery()).toEqual(["BP01-166", "BP01-167"]);
  });

  it("168 Demonic Strike / 169 Execution / 179 Angelic Snipe / 180 Angelic Barrage", () => {
    const t = d({ me: { hand: ["BP01-168", "BP01-169", "BP01-179", "BP01-180"], playPoints: 9 }, opp: { field: ["BP01-133", "V3", "V1"] } });
    t.play("BP01-168").pick("opp:leader").play("BP01-169").pick("opp:BP01-133").play("BP01-179").pick("opp:V3").play("BP01-180");
    expect([t.leader("opp"), t.field("opp"), t.stats("opp:V3"), t.stats("opp:V1")]).toEqual([17, ["V3", "V1"], [3, 1], [2, 1]]);
  });

  it("170 Trail of Light — discarding it (even for the hand limit) draws a card; playing it draws too", () => {
    const t = d({ me: { hand: [...Array<string>(7).fill("V5"), "BP01-170"], deck: ["V1"], playPoints: 0 }, opp: { deck: ["V1"] } });
    t.end().pick("BP01-170").pick("V1");
    expect(t.hand()).toEqual(Array(7).fill("V5"));
    const play = d({ me: { hand: ["BP01-170"], deck: ["V1"], playPoints: 2 } }).play("BP01-170");
    expect(play.hand()).toEqual(["V1"]);
  });

  it("177 / 178 Healing Angel — leader +1; evolved: leader +2", () => {
    const t = d({ me: { hand: ["BP01-177"], evolveDeck: ["BP01-178"], playPoints: 4 } }).play("BP01-177").evolve("BP01-177");
    expect(t.leader()).toBe(23);
  });
});
