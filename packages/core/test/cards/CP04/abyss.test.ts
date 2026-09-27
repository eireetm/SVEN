import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// CP04 Abysscraft (073–090, T10–T11), Princess Connect! Re: Dive. Both decks are based on the universe (CR 14.5.1.2). V1 is 1c
// 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). CP04-105 Suzume (2c; UB Fanfare: leader +2) executes a Union Burst ability. Diabolos
// followers: CP04-081 Yori (2c 2/2), CP04-077 Shinobu (3c); Geo Niflhel: CP04-076 Violet; Lucent Academy: CP04-017 Suzuna (3c;
// Fanfare: discard a card), CP04-085 Misaki (1c; Fanfare: 2 damage to your leader). KILL destroys an enemy follower; QUICK-SAC
// destroys a follower of yours.
const E = cardEngine();
const PC = { universe: "princessConnect" as const };
const d = (spec: DriveSpec) => drive(E, { ...spec, me: { ...PC, ...spec.me }, opp: { ...PC, ...spec.opp } });
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };
const n = (count: number, id: string) => Array<string>(count).fill(id);
/** Two Union Burst abilities already executed this turn. */
const twoBefore = (t: ReturnType<typeof d>) => {
  t.game.state.players[0].thisTurn = { ...t.game.state.players[0].thisTurn, turn: t.game.state.turn, unionBursts: 2 };
  return t;
};

describe("CP04 Abysscraft", () => {
  it("073 / T11 Illya — UB Activate, banish 5 from the cemetery: 3 damage, leader +3; a Dark Axe Nachtfang adds 3 to the enemy leader", () => {
    const t = d({ me: { field: ["CP04-073"], cemetery: n(5, "V1") }, opp: { field: ["V5"] } }).activate("CP04-073");
    expect([t.stats("opp:V5"), t.leader(), t.zone("me", "banished").length]).toEqual([[5, 2], 23, 5]);
    const x = d({ me: { field: [{ card: "CP04-073", equipped: ["CP04-T11"] }], cemetery: n(5, "V1") }, opp: { field: ["V5"] } }).activate("CP04-073");
    expect([x.stats("opp:V5"), x.leader("opp")]).toEqual([[5, 2], 17]);
    expect(d({ me: { hand: ["CP04-073"], playPoints: 4 } }).play("CP04-073").yes().zone("me", "equipmentZone")).toEqual(["CP04-T11"]);
  });

  it("074 Illya (Evolved) — On Evolve: bury a PriConne card from the deck; super-evolved: 5 damage", () => {
    expect(d({ me: { field: ["CP04-073"], evolveDeck: ["CP04-074"], deck: ["V1", "CP04-001"], playPoints: 1 } }).evolve("CP04-073").pick("CP04-001").cemetery()).toEqual(["CP04-001"]);
    const s = d({ me: { field: ["CP04-073"], evolveDeck: ["CP04-074"], playPoints: 1, ...SUPER }, opp: { field: ["V5"] } }).evolve("CP04-073", { sep: true }).flush();
    expect(s.field("opp")).toEqual([]);
  });

  it("075 Ranpha — UB Fanfare: 5 damage, 2 play points back unless from the hand; another's UB: an option not chosen this turn", () => {
    expect(d({ me: { hand: ["CP04-075"], playPoints: 4 }, opp: { field: ["V5"] } }).play("CP04-075").pp()).toBe(0);
    expect(d({ me: { ex: ["CP04-075"], playPoints: 4 }, opp: { field: ["V5"] } }).play("CP04-075").pp()).toBe(2);
    const t = d({ me: { field: ["CP04-075"], hand: ["CP04-105", "CP04-105"], playPoints: 4 } }).play("CP04-105").choose("1");
    expect([t.leader("opp"), t.leader()]).toEqual([18, 22]);
    t.play("CP04-105");
    expect([t.leader("opp"), t.leader()]).toEqual([18, 26]);
  });

  it("076 Violet — UB Fanfare: a PriConne follower costing 3 or less from the cemetery; from the cemetery, discard 2: into the EX area", () => {
    expect(d({ me: { hand: ["CP04-076"], cemetery: ["CP04-001"], playPoints: 4 } }).play("CP04-076").flush().field()).toEqual(["CP04-076", "CP04-001"]);
    const t = d({ me: { cemetery: ["CP04-076"], hand: ["V1", "V3"] } }).activate("CP04-076");
    expect([t.ex(), t.cemetery().sort()]).toEqual([["CP04-076"], ["V1", "V3"]]);
  });

  it("077 / 078 / T10 Shinobu — UB Fanfare: damage equal to your Diabolos followers; another's UB: bury the top card; evolved: a Skullfather", () => {
    expect(d({ me: { hand: ["CP04-077"], field: ["CP04-081"], playPoints: 3 }, opp: { field: ["V5"] } }).play("CP04-077").stats("opp:V5")).toEqual([5, 3]);
    expect(d({ me: { field: ["CP04-077"], hand: ["CP04-105"], deck: ["V1", "V3"], playPoints: 2 } }).play("CP04-105").cemetery()).toEqual(["V1"]);
    expect(d({ me: { field: ["CP04-077"], evolveDeck: ["CP04-078"], playPoints: 1 } }).evolve("CP04-077").field()).toEqual(["CP04-077", "CP04-T10"]);
    const s = d({ me: { field: ["CP04-T10", "CP04-081"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").pick("CP04-T10").pick("CP04-081");
    expect([s.stats("CP04-081"), d({ me: { field: ["CP04-T10"] } }).keywords("CP04-T10")]).toEqual([[3, 2], ["rush"]]);
  });

  it("079 Grace — UB Fanfare: draw, discard, bury the top 2; Ward with another Geo Niflhel follower", () => {
    const t = d({ me: { hand: ["CP04-079", "V1"], deck: ["V3", "V5", "V1", "V1"], playPoints: 1 } }).play("CP04-079").pick("V1");
    expect([t.hand(), t.cemetery()]).toEqual([["V3"], ["V1", "V5", "V1"]]);
    expect([d({ me: { field: ["CP04-079", "CP04-076"] } }).keywords("CP04-079"), d({ me: { field: ["CP04-079"] } }).keywords("CP04-079")]).toEqual([["ward"], []]);
  });

  it("080 Rei — Rush; UB Strike: +1 attack, +2 after 2 other Union Bursts this turn", () => {
    expect(d({ me: { field: ["CP04-080"] } }).attack("CP04-080", "opp:leader").leader("opp")).toBe(18);
    expect(twoBefore(d({ me: { field: ["CP04-080"] } })).attack("CP04-080", "opp:leader").leader("opp")).toBe(17);
  });

  it("081 / 082 Yori — Fanfare: 2 damage unless it came from the hand; evolved UB: 2 damage", () => {
    expect(d({ me: { hand: ["CP04-081"], playPoints: 2 }, opp: { field: ["V5"] } }).play("CP04-081").stats("opp:V5")).toEqual([5, 5]);
    expect(d({ me: { ex: ["CP04-081"], playPoints: 2 }, opp: { field: ["V5"] } }).play("CP04-081").stats("opp:V5")).toEqual([5, 3]);
    expect(d({ me: { field: ["CP04-081"], evolveDeck: ["CP04-082"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("CP04-081").stats("opp:V5")).toEqual([5, 3]);
  });

  it("083 Akari — UB Activate (0): another Diabolos follower +1 attack, once per turn; Fanfare: a Diabolos follower from the cemetery, 2 less", () => {
    const t = d({ me: { field: ["CP04-083", "CP04-081"] } }).activate("CP04-083");
    expect([t.stats("CP04-081"), t.canActivate("CP04-083")]).toEqual([[3, 2], false]);
    const f = d({ me: { hand: ["CP04-083"], cemetery: ["CP04-077"], playPoints: 4 } }).play("CP04-083");
    expect([f.ex(), f.canPlay("CP04-077")]).toEqual([["CP04-077"], true]);
  });

  it("084 Miyako — UB Activate (4): banish an enemy follower, leader +2; Fanfare: a Diabolos follower from the top 5, then discard", () => {
    const t = d({ me: { field: ["CP04-084"], playPoints: 4 }, opp: { field: ["V5"] } }).activate("CP04-084");
    expect([t.zone("opp", "banished"), t.leader()]).toEqual([["V5"], 22]);
    const f = d({ me: { hand: ["CP04-084", "V3"], deck: ["V1", "CP04-081", "V1", "V1", "V1"], playPoints: 1 } }).play("CP04-084").pick("CP04-081").order().pick("V3");
    expect([f.hand(), f.cemetery()]).toEqual([["CP04-081"], ["V3"]]);
  });

  it("085 / 086 Misaki — Fanfare: 2 damage to your leader; UB Strike (evolved too): 3 damage", () => {
    expect(d({ me: { hand: ["CP04-085"], playPoints: 1 } }).play("CP04-085").leader()).toBe(18);
    expect(d({ me: { field: ["CP04-085"] }, opp: { field: ["V5"] } }).attack("CP04-085", "opp:leader").stats("opp:V5")).toEqual([5, 2]);
    expect(d({ me: { field: [{ card: "CP04-085", evolvedInto: "CP04-086" }] }, opp: { field: ["V5"] } }).attack("CP04-085", "opp:leader").stats("opp:V5")).toEqual([5, 2]);
  });

  it("087 Kuuka — opponents must select it for abilities; UB Activate: Ward", () => {
    const k = d({ me: { hand: ["KILL"], playPoints: 1 }, opp: { field: ["V5", "CP04-087"] } }).play("KILL");
    expect(() => k.pick("opp:V5")).toThrow();
    expect(k.pick("opp:CP04-087").field("opp")).toEqual(["V5"]);
    expect(d({ me: { field: ["CP04-087"] } }).activate("CP04-087").keywords("CP04-087")).toEqual(["ward"]);
  });

  it("088 Io — UB Activate (1): each opponent buries a follower; Fanfare: two Lucent Academy followers from the deck, their Fanfares don't trigger", () => {
    const t = d({ me: { field: ["CP04-088"], playPoints: 1 }, opp: { field: ["V5"] } }).activate("CP04-088");
    expect([t.field("opp"), t.cemetery("opp")]).toEqual([[], ["V5"]]);
    const f = d({ me: { hand: ["CP04-088", "V1"], deck: ["CP04-017", "CP04-085"], playPoints: 5 } }).play("CP04-088").pick("CP04-017").pick("CP04-085");
    expect([f.field(), f.leader(), f.hand()]).toEqual([["CP04-088", "CP04-017", "CP04-085"], 20, ["V1"]]);
  });

  it("089 Eriko — UB Fanfare: 1 damage, 3 after 2 other Union Bursts this turn", () => {
    expect(d({ me: { hand: ["CP04-089"], playPoints: 1 }, opp: { field: ["V5"] } }).play("CP04-089").stats("opp:V5")).toEqual([5, 4]);
    expect(twoBefore(d({ me: { hand: ["CP04-089"], playPoints: 1 }, opp: { field: ["V5"] } })).play("CP04-089").stats("opp:V5")).toEqual([5, 2]);
  });

  it("090 Demonic Salvation: Infinity — Quick; 2 damage, may bury the top card if it's a PriConne card", () => {
    const t = d({ me: { hand: ["CP04-090"], deck: ["CP04-001"], playPoints: 1 }, opp: { field: ["V5"] } }).play("CP04-090").pick("CP04-001");
    expect([t.stats("opp:V5"), t.cemetery()]).toEqual([[5, 3], ["CP04-001", "CP04-090"]]);
  });
});
