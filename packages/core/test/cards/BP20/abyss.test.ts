import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP20 Abysscraft (074–092, T06). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); QUICK-SAC (0) destroys one of your
// followers; YOKAI0 (1c 0/3) is a Yokai follower. Abysscraft Omen followers: BP20-074 (3c, evolves into BP20-075), BP20-085
// (2c). BP17-085 Rouge Vampire (1c: Fanfare, 1 damage to your leader) turns on Sanguine. Tokens: BP15-T04 Rulenye, Echoing
// Scream (2/1 Rush, Assail), BP20-T06 Crest: Sham-Nacha.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };
const RULENYE = "BP15-T04";

describe("BP20 Abysscraft", () => {
  it("074 / 075 Rulenye & Valnareik — evolved: 2 Rulenye, Echoing Scream, or Storm to this and +1/+0 to each Abysscraft Omen follower of yours", () => {
    const t = d({ me: { field: ["BP20-074"], evolveDeck: ["BP20-075"], playPoints: 1 } }).evolve("BP20-074").choose("summon");
    expect(t.field()).toEqual(["BP20-074", RULENYE, RULENYE]);
    const s = d({ me: { field: ["BP20-074", "BP20-085", "V1"], evolveDeck: ["BP20-075"], playPoints: 1 } }).evolve("BP20-074").choose("storm");
    expect([s.keywords("BP20-074"), s.stats("BP20-074"), s.stats("BP20-085"), s.stats("V1")]).toEqual([["storm"], [4, 3], [3, 3], [2, 2]]);
  });

  it("076 / 077 Sham-Nacha, Heir to Entwining — evolved: a Crest: Sham-Nacha; super-evolved: an Abysscraft Omen follower from the cemetery, summoned and evolved (its choice then any number)", () => {
    expect(d({ me: { field: ["BP20-076"], evolveDeck: ["BP20-077"], playPoints: 1 } }).evolve("BP20-076").ex()).toEqual(["BP20-T06"]);
    const s = d({ me: { field: ["BP20-076"], evolveDeck: ["BP20-077", "BP20-075"], cemetery: ["BP20-074"], playPoints: 1, ...SUPER } });
    s.evolve("BP20-076", { sep: true }).flush().yes().choose("summon", "storm").flush();
    expect([s.ex(), s.field(), s.keywords("BP20-074")]).toEqual([["BP20-T06"], ["BP20-076", "BP20-074", RULENYE, RULENYE], ["storm"]]);
  });

  it("078 Diabolus Hedone — Fanfare: up to 2 enemy followers, destroyed with Sanguine", () => {
    const t = d({ me: { hand: ["BP17-085", "BP20-078"], playPoints: 4 }, opp: { field: ["V5", "V3", "V1"] } }).play("BP17-085").play("BP20-078").pick("opp:V5", "opp:V3");
    expect(t.field("opp")).toEqual(["V1"]);
    expect(d({ me: { hand: ["BP20-078"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP20-078").pick("opp:V5").field("opp")).toEqual(["V5"]);
  });

  it("079 / 080 Congregant of Entwining — evolved: 5 damage, a 3-cost or less Abysscraft Omen follower from the cemetery, or +1/+1 to each", () => {
    const e = (choice: string, extra: Partial<DriveSpec["me"]> = {}) =>
      d({ me: { field: ["BP20-079", "BP20-085"], evolveDeck: ["BP20-080"], cemetery: ["BP20-074", "BP20-076"], playPoints: 1, ...extra }, opp: { field: ["V5"] } })
        .evolve("BP20-079")
        .choose(choice);
    expect(e("damage").field("opp")).toEqual([]);
    expect(e("summon").pick("BP20-074").field()).toEqual(["BP20-079", "BP20-085", "BP20-074"]);
    expect(e("buff").stats("BP20-085")).toEqual([3, 4]);
  });

  it("081 Hervör — Fanfare: 4 to each enemy follower, or leader +4 and draw 2", () => {
    expect(d({ me: { hand: ["BP20-081"], playPoints: 6 }, opp: { field: ["V5", "V3"] } }).play("BP20-081").choose("damage").field("opp")).toEqual(["V5"]);
    const t = d({ me: { hand: ["BP20-081"], deck: ["V1", "V3"], playPoints: 6 }, opp: { field: ["V5"] } }).play("BP20-081").choose("leader");
    expect([t.leader(), t.hand()]).toEqual([24, ["V1", "V3"]]);
  });

  it("082 Screaming and Loathing — 3 damage, 2 to each enemy leader, draw then discard, or recover 1", () => {
    expect(d({ me: { hand: ["BP20-082"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP20-082").choose("damage").stats("opp:V5")).toEqual([5, 2]);
    expect(d({ me: { hand: ["BP20-082"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP20-082").choose("leader").leader("opp")).toBe(18);
    expect(d({ me: { hand: ["BP20-082"], maxPlayPoints: 5, playPoints: 2 } }).play("BP20-082").choose("pp").pp()).toBe(1);
  });

  it("083 / 084 Spirited Gravekeeper — Evolve (5); Fanfare: bury the top 2; evolved: a 5-cost or less and a 3-cost or less non-Abysscraft follower from the cemetery, both needed", () => {
    expect(d({ me: { hand: ["BP20-083"], deck: ["V1", "V3", "V5"], playPoints: 2 } }).play("BP20-083").cemetery()).toEqual(["V1", "V3"]);
    expect(d({ me: { field: ["BP20-083"], evolveDeck: ["BP20-084"], playPoints: 4 } }).canEvolve("BP20-083")).toBe(false);
    const t = d({ me: { field: ["BP20-083"], evolveDeck: ["BP20-084"], cemetery: ["V5", "V3", "BP20-085"], playPoints: 5 } }).evolve("BP20-083").flush();
    expect(t.field()).toEqual(["BP20-083", "V5", "V3"]);
    const one = d({ me: { field: ["BP20-083"], evolveDeck: ["BP20-084"], cemetery: ["V3"], playPoints: 5 } }).evolve("BP20-083");
    expect(one.field()).toEqual(["BP20-083"]);
  });

  it("085 Supplicant of Entwining — Fanfare: 1 damage, 2 to each enemy leader, or leader +2", () => {
    expect(d({ me: { hand: ["BP20-085"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP20-085").choose("damage").stats("opp:V5")).toEqual([5, 4]);
    expect(d({ me: { hand: ["BP20-085"], playPoints: 2 } }).play("BP20-085").choose("defense").leader()).toBe(22);
  });

  it("086 Castle of Entwining — Fanfare: an Abysscraft Omen card from the top 3; act (1), engage and bury this: Rush or Assail to a follower of yours", () => {
    expect(d({ me: { hand: ["BP20-086"], deck: ["V1", "BP20-085"], playPoints: 1 } }).play("BP20-086").pick("BP20-085").hand()).toEqual(["BP20-085"]);
    const t = d({ me: { field: ["BP20-086", "V1"], playPoints: 1 } }).activate("BP20-086").choose("assail");
    expect([t.keywords("V1"), t.field()]).toEqual([["assail"], ["V1"]]);
  });

  it("087 / 088 Ephemeral Demon Princess — Fanfare: bury the top 3; evolved: up to 2 Yokai cards costing 4 or less in total from the cemetery into the EX area, 0 this turn", () => {
    expect(d({ me: { hand: ["BP20-087"], deck: ["V1", "V3", "V5", "V1"], playPoints: 4 } }).play("BP20-087").cemetery()).toEqual(["V1", "V3", "V5"]);
    const t = d({ me: { field: ["BP20-087"], evolveDeck: ["BP20-088"], cemetery: ["BP20-087", "YOKAI0", "YOKAI0"], playPoints: 1 } }).evolve("BP20-087").pick("BP20-087");
    expect([t.ex(), t.canPlay("BP20-087@ex"), t.pp()]).toEqual([["BP20-087"], true, 0]);
  });

  it("089 Devotee of Entwining — Fanfare: 3 damage, 1 to each enemy leader and follower, or draw", () => {
    const t = d({ me: { hand: ["BP20-089"], playPoints: 3 }, opp: { field: ["V5", "V1"] } }).play("BP20-089").choose("all");
    expect([t.stats("opp:V5"), t.stats("opp:V1"), t.leader("opp")]).toEqual([[5, 4], [2, 1], 19]);
  });

  it("090 Wicked Collector — Fanfare: the top card into the EX area, +1/+1 if it's a follower", () => {
    const t = d({ me: { hand: ["BP20-090"], deck: ["V1"], playPoints: 3 } }).play("BP20-090").play("V1@ex");
    expect(t.stats("V1")).toEqual([3, 3]);
  });

  it("091 Nemean Lion — Strike: an Abysscraft follower from your cemetery into your hand", () => {
    expect(d({ me: { field: ["BP20-091"], cemetery: ["V1", "BP20-085"] } }).attack("BP20-091", "opp:leader").hand()).toEqual(["BP20-085"]);
  });

  it("092 March of the Brutes — 5 damage to up to 2 enemy followers, 3 to each enemy leader", () => {
    const t = d({ me: { hand: ["BP20-092"], playPoints: 6 }, opp: { field: ["V5", "V3"] } }).play("BP20-092").pick("opp:V5", "opp:V3");
    expect([t.field("opp"), t.leader("opp")]).toEqual([[], 17]);
  });

  it("T06 Crest: Sham-Nacha, Heir to Entwining — its controller chooses 1 to all options (in the EX area)", () => {
    const t = d({ me: { ex: ["BP20-T06"], hand: ["BP20-082"], deck: ["V1"], maxPlayPoints: 5, playPoints: 2 }, opp: { field: ["V5"] } }).play("BP20-082");
    t.choose("damage", "leader", "draw", "pp").flush();
    expect([t.stats("opp:V5"), t.leader("opp"), t.pp()]).toEqual([[5, 2], 18, 1]);
  });
});
