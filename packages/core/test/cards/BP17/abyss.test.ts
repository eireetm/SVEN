import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP17 Abysscraft (073–090, T07, T08). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); KILL (1) is a spell; QUICK-SAC (0)
// destroys one of your followers. Machina followers: BP17-076 (3), BP17-077 (2), BP17-079 (2), BP17-083 (2), BP07-080
// Robozombie (4). BP17-085 Rouge Vampire (1): Fanfare, 1 damage to your leader. Tokens: BP07-T01 Assembly Droid, BP01-T15
// Forest Bat, BP17-T07 A Horrible Night, BP17-T08 Luna's Doll.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const DROID = "BP07-T01";
const BAT = "BP01-T15";
const NIGHT = "BP17-T07";
const DOLL = "BP17-T08";
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };
const n = (count: number, id = "KILL") => Array<string>(count).fill(id);

describe("BP17 Abysscraft", () => {
  it("073 Luna, Soul Keeper — Fanfare: a Luna's Doll; act, engage, with 10 cards in the cemetery: a 2-cost Abysscraft follower from it, not Luna", () => {
    expect(d({ me: { hand: ["BP17-073"], playPoints: 1 } }).play("BP17-073").ex()).toEqual([DOLL]);
    expect(d({ me: { field: ["BP17-073"], cemetery: [...n(9), "BP17-085"] } }).activate("BP17-073").hand()).toEqual(["BP17-085"]);
    expect(d({ me: { field: ["BP17-073"], cemetery: [...n(9), "BP17-073"] } }).canActivate("BP17-073")).toBe(false);
    expect(d({ me: { field: ["BP17-073"], cemetery: [...n(8), "BP17-085"] } }).canActivate("BP17-073")).toBe(false);
  });

  it("074 / 075 Urias, Final Vampire — Fanfare: an A Horrible Night; evolved: up to 3 options, each 1 damage to your leader", () => {
    expect(d({ me: { hand: ["BP17-074"], playPoints: 3 } }).play("BP17-074").ex()).toEqual([NIGHT]);
    const t = d({ me: { field: ["BP17-074"], evolveDeck: ["BP17-075"], deck: ["V1"], playPoints: 1 }, opp: { field: ["V5", "V3"] } });
    t.evolve("BP17-074").choose("damage", "each", "draw").pick("opp:V5");
    expect([t.stats("opp:V5"), t.stats("opp:V3"), t.leader(), t.hand()]).toEqual([[5, 1], [3, 3], 17, ["V1"]]);
  });

  it("076 Mono, Immortal Garnet — Fanfare: an Assembly Droid; Strike: damage per other Machina follower; act (0) with 5 Machina followers: +1/+1 and Storm", () => {
    expect(d({ me: { hand: ["BP17-076"], playPoints: 3 } }).play("BP17-076").field()).toEqual(["BP17-076", DROID]);
    const t = d({ me: { field: ["BP17-076", "BP17-077", "BP17-083"] }, opp: { field: ["V5"] } }).attack("BP17-076", "opp:leader");
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[5, 3], 18]);
    const act = d({ me: { field: ["BP17-076", "BP17-077", "BP17-077", "BP17-083", DROID] } }).activate("BP17-076");
    expect([act.stats("BP17-076"), act.keywords("BP17-076"), act.canActivate("BP17-076")]).toEqual([[3, 3], ["storm"], false]);
    expect(d({ me: { field: ["BP17-076", "BP17-077", "BP17-077", "BP17-083", "V1"] } }).canActivate("BP17-076")).toBe(false);
  });

  it("077 / 078 Aenea, Creative Amethyst — evolved: a Roly-Poly Mk II from the deck; super-evolved: a Machina card from the cemetery into the EX area, 3 less this turn", () => {
    const t = d({ me: { field: ["BP17-077"], evolveDeck: ["BP17-078"], deck: ["BP17-083", "V1", "V3"], playPoints: 1 } });
    t.evolve("BP17-077").pick("BP17-083").none().flush();
    expect([t.field(), t.cemetery().length]).toEqual([["BP17-077", "BP17-083"], 2]);
    const s = d({ me: { field: ["BP17-077"], evolveDeck: ["BP17-078"], cemetery: ["BP17-083", "V1"], deck: ["V1"], playPoints: 1, ...SUPER } });
    s.evolve("BP17-077", { sep: true }).flush();
    expect([s.ex(), s.pp(), s.canPlay("BP17-083@ex")]).toEqual([["BP17-083"], 0, true]);
  });

  it("079 Nicola, Enduring Steward — Rush and Bane with another Machina follower; Fanfare: Assail when not from the hand; Last Words, discard 2 Machina cards: into the EX area, 1 less", () => {
    expect(d({ me: { field: ["BP17-079", "BP17-077"] } }).keywords("BP17-079")).toEqual(["rush", "bane"]);
    expect(d({ me: { field: ["BP17-079", "V1"] } }).keywords("BP17-079")).toEqual([]);
    expect(d({ me: { ex: ["BP17-079"], playPoints: 2 } }).play("BP17-079@ex").keywords("BP17-079")).toEqual(["assail"]);
    expect(d({ me: { hand: ["BP17-079"], playPoints: 2 } }).play("BP17-079").keywords("BP17-079")).toEqual([]);
    const lw = d({ me: { field: ["BP17-079"], hand: ["QUICK-SAC", "BP17-077", "BP17-083"], playPoints: 1 } }).play("QUICK-SAC").yes();
    expect([lw.ex(), lw.hand(), lw.canPlay("BP17-079@ex")]).toEqual([["BP17-079"], [], true]);
  });

  it("080 Steeled Hopes — a Machina follower from the deck, or (6): Machina followers costing 4, 3 and 2 or less onto the field", () => {
    expect(d({ me: { hand: ["BP17-080"], deck: ["V1", "BP17-083"], playPoints: 1 } }).play("BP17-080").choose("search").pick("BP17-083").hand()).toEqual(["BP17-083"]);
    const t = d({ me: { hand: ["BP17-080"], deck: ["BP07-080", "BP17-077", "BP17-077", "V1"], playPoints: 7 } }).play("BP17-080").choose("summon").yes();
    t.pick("BP07-080").pick("BP17-077").none();
    expect([t.field(), t.pp()]).toEqual([["BP07-080", "BP17-077"], 0]);
  });

  it("081 / 082 Amy, Psychopomp Guide — Fanfare, bury another follower: draw 2; evolved: leader +2", () => {
    const t = d({ me: { hand: ["BP17-081"], field: ["V1"], deck: ["V3", "V5"], playPoints: 1 } }).play("BP17-081").yes();
    expect([t.hand(), t.cemetery()]).toEqual([["V3", "V5"], ["V1"]]);
    expect(d({ me: { field: ["BP17-081"], evolveDeck: ["BP17-082"], playPoints: 2 } }).evolve("BP17-081").leader()).toBe(22);
  });

  it("083 Roly-Poly Mk II — Ward; Fanfare: a Machina card from the top 2, bury the rest", () => {
    const t = d({ me: { hand: ["BP17-083"], deck: ["BP17-077", "V1"], playPoints: 2 } }).play("BP17-083").none().pick("BP17-077");
    expect([t.hand(), t.cemetery(), t.keywords("BP17-083")]).toEqual([["BP17-077"], ["V1"], ["ward"]]);
  });

  it("084 Allure of Shadows — 4 damage; Necrocharge (10): a Luna, Soul Keeper from the deck", () => {
    expect(d({ me: { hand: ["BP17-084"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP17-084").stats("opp:V5")).toEqual([5, 1]);
    const t = d({ me: { hand: ["BP17-084"], cemetery: n(10), deck: ["V1", "BP17-073"], playPoints: 2 }, opp: { field: ["V5"] } });
    t.play("BP17-084").pick("BP17-073").flush();
    expect([t.field(), t.ex(), t.stats("opp:V5")]).toEqual([["BP17-073"], [DOLL], [5, 1]]);
    expect(d({ me: { hand: ["BP17-084"], cemetery: n(10), deck: ["BP17-073"], playPoints: 2 } }).canPlay("BP17-084")).toBe(false);
  });

  it("085 / 086 Rouge Vampire — Fanfare: 1 damage to your leader; evolved: Drain with Sanguine", () => {
    expect(d({ me: { hand: ["BP17-085"], playPoints: 1 } }).play("BP17-085").leader()).toBe(19);
    const t = d({ me: { field: ["BP17-085"], evolveDeck: ["BP17-086"], hand: ["BP17-087"], deck: ["V1"], playPoints: 6 } });
    expect(t.play("BP17-087").evolve("BP17-085").keywords("BP17-085")).toEqual(["drain"]);
    expect(d({ me: { field: ["BP17-085"], evolveDeck: ["BP17-086"], playPoints: 4 } }).evolve("BP17-085").keywords("BP17-085")).toEqual([]);
  });

  it("087 Vampiric Bloodbinder — Fanfare: 1 damage to your leader, draw; Last Words: a Forest Bat into the EX area", () => {
    const t = d({ me: { hand: ["BP17-087"], deck: ["V1"], playPoints: 2 } }).play("BP17-087");
    expect([t.leader(), t.hand()]).toEqual([19, ["V1"]]);
    expect(d({ me: { field: ["BP17-087"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").ex()).toEqual([BAT]);
  });

  it("088 Trampling Terror — Fanfare: destroy an enemy follower; Last Words: 3 damage to the enemy leader", () => {
    expect(d({ me: { hand: ["BP17-088"], playPoints: 6 }, opp: { field: ["V5"] } }).play("BP17-088").field("opp")).toEqual([]);
    expect(d({ me: { field: ["BP17-088"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").leader("opp")).toBe(17);
  });

  it("089 Soul Commander — Fanfare: a 2-cost follower from the cemetery; whenever a non-Abysscraft follower is put onto your field: 3 damage", () => {
    const t = d({ me: { hand: ["BP17-089"], cemetery: ["V1"], playPoints: 5 }, opp: { field: ["V5"] } }).play("BP17-089").flush();
    expect([t.field(), t.stats("opp:V5")]).toEqual([["BP17-089", "V1"], [5, 2]]);
    const abyss = d({ me: { field: ["BP17-089"], hand: ["BP17-085"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP17-085");
    expect(abyss.stats("opp:V5")).toEqual([5, 5]);
  });

  it("090 Midnight Gossip — your follower +1/+1, then damage equal to its attack to an enemy follower", () => {
    const t = d({ me: { hand: ["BP17-090"], field: ["V3"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP17-090");
    expect([t.stats("V3"), t.stats("opp:V5")]).toEqual([[4, 5], [5, 1]]);
    expect(d({ me: { hand: ["BP17-090"], field: ["V3"], playPoints: 3 } }).canPlay("BP17-090")).toBe(false);
  });

  it("T07 A Horrible Night — not after another one this turn; this turn, whenever your leader loses defense: 1 to the enemy leader, leader +1", () => {
    const t = d({ me: { ex: [NIGHT, NIGHT], hand: ["BP17-085"], playPoints: 2 } }).play(`${NIGHT}@ex`).play("BP17-085");
    expect([t.leader("opp"), t.leader(), t.canPlay(`${NIGHT}@ex`)]).toEqual([19, 20, false]);
    const u = d({ me: { ex: [NIGHT], field: ["BP17-074"], evolveDeck: ["BP17-075"], deck: ["V1"], playPoints: 2 } }).play(`${NIGHT}@ex`);
    u.evolve("BP17-074").choose("each", "draw").flush();
    expect([u.leader("opp"), u.leader()]).toEqual([18, 20]);
  });

  it("T08 Luna's Doll — Fanfare: bury the top 2; act, engage and bury it, with 10 cards in the cemetery: draw", () => {
    expect(d({ me: { ex: [DOLL], deck: ["V1", "V3", "V5"], playPoints: 1 } }).play(`${DOLL}@ex`).cemetery()).toEqual(["V1", "V3"]);
    const t = d({ me: { field: [DOLL], cemetery: n(10), deck: ["V1"] } }).activate(DOLL);
    expect([t.hand(), t.field()]).toEqual([["V1"], []]);
    expect(d({ me: { field: [DOLL], cemetery: n(9) } }).canActivate(DOLL)).toBe(false);
  });
});
