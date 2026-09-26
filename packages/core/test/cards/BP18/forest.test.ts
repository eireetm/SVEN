import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP18 Forestcraft (001–019, T01). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); KILL (1) is a spell. Togh Keyoh
// followers: BP18-005 Caretaker (Evolve 0), BP18-009 Pugilist (Evolve 1), BP18-014 Supplicant; their evolved cards
// BP18-006, 010, 015. BP18-011 is a Beast. Tokens: BP02-T01 Crystalia Eve, BP18-T01 Seeds of Salvation.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const EVE = "BP02-T01";
const SEEDS = "BP18-T01";
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };
const ep = (t: ReturnType<typeof d>) => t.game.state.players[0].evolutionPoints;

describe("BP18 Forestcraft", () => {
  it("001 Rolo Roné, Verdant Purifier — any number of Evolve per turn; Fanfare: a Togh Keyoh card from the cemetery into the EX area, 2 less", () => {
    const spec = (lead: string): DriveSpec => ({ me: { field: [lead, "EVOLVER", "BP18-011"], evolveDeck: ["EVOLVER-E", "BP18-012"], playPoints: 3 } });
    expect(d(spec("BP18-001")).evolve("EVOLVER").canEvolve("BP18-011")).toBe(true);
    expect(d(spec("V1")).evolve("EVOLVER").canEvolve("BP18-011")).toBe(false);
    const t = d({ me: { hand: ["BP18-001"], cemetery: ["BP18-009"], playPoints: 4 } }).play("BP18-001");
    expect([t.ex(), t.canPlay("BP18-009@ex")]).toEqual([["BP18-009"], true]);
  });

  it("002 Rolo Roné (Evolved) — super-evolved: a Seeds of Salvation; whenever a follower on your field evolves: 4 damage", () => {
    const t = d({ me: { field: ["BP18-001"], evolveDeck: ["BP18-002"], playPoints: 1, ...SUPER }, opp: { field: ["V5"] } });
    t.evolve("BP18-001", { sep: true }).flush();
    expect([t.ex(), t.stats("opp:V5")]).toEqual([[SEEDS], [5, 1]]);
    const other = d({ me: { field: [{ card: "BP18-001", evolvedInto: "BP18-002" }, "BP18-011"], evolveDeck: ["BP18-012"], deck: ["V1"], playPoints: 1 }, opp: { field: ["V5"] } });
    other.evolve("BP18-011").flush();
    expect(other.stats("opp:V5")).toEqual([5, 1]);
  });

  it("003 Kyou, Verdant Path Shepherd — whenever a follower on your field evolves: 1 to the enemy leader; 1st of the turn draw, 2nd Storm, 3rd +2/+2", () => {
    const t = d({ me: { field: ["BP18-003", "BP18-001", "BP18-005", "BP18-005", "BP18-005"], evolveDeck: ["BP18-006", "BP18-006", "BP18-006"], deck: ["V1"] } });
    t.evolve("BP18-005").flush();
    expect([t.hand(), t.leader("opp")]).toEqual([["V1"], 19]);
    t.evolve("BP18-005").flush();
    expect(t.keywords("BP18-003")).toEqual(["storm"]);
    t.evolve("BP18-005").flush();
    expect([t.stats("BP18-003"), t.leader("opp")]).toEqual([[4, 4], 17]);
  });

  it("004 Tia, Crystalian Noble — Fanfare: a Crystalia Eve, which draws; act, engage: an Eve costs X less (cards played this turn)", () => {
    expect(d({ me: { hand: ["BP18-004"], deck: ["V1"], playPoints: 2 } }).play("BP18-004").hand()).toEqual(["V1"]);
    // Crystalia Eve costs 4: after 3 other cards and V1, X = 4.
    const t = d({ me: { field: ["BP18-004"], ex: [EVE], hand: ["V1"], playedThisTurn: 3, playPoints: 1 } }).play("V1").activate("BP18-004");
    expect([t.pp(), t.canPlay(`${EVE}@ex`)]).toEqual([0, true]);
  });

  it("005 / 006 Verdant Authority Caretaker — Evolve (0); any number of Evolve per turn; whenever a follower on your field evolves: leader +1", () => {
    expect(d({ me: { field: ["BP18-005"], evolveDeck: ["BP18-006"], playPoints: 0 } }).evolve("BP18-005").leader()).toBe(21);
  });

  it("007 May, Eager Elf — from the cemetery with 3 cards played; Fanfare: 1 damage, to the bottom of the deck unless from the hand; leaving on your turn: 1 damage", () => {
    const t = d({ me: { cemetery: ["BP18-007"], deck: ["V1"], playedThisTurn: 3, playPoints: 1 }, opp: { field: ["V5"] } });
    t.play("BP18-007@cemetery").flush();
    expect([t.stats("opp:V5"), t.zone("me", "deck"), t.field()]).toEqual([[5, 3], ["V1", "BP18-007"], []]);
    expect(d({ me: { cemetery: ["BP18-007"], playedThisTurn: 2, playPoints: 1 } }).canPlay("BP18-007@cemetery")).toBe(false);
    const hand = d({ me: { hand: ["BP18-007"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP18-007");
    expect([hand.stats("opp:V5"), hand.field()]).toEqual([[5, 4], ["BP18-007"]]);
  });

  it("008 Sprouting Retribution — X less for faceup evolved Togh Keyoh followers; 5 damage and 1 to its leader", () => {
    const t = d({ me: { hand: ["BP18-008"], faceUpEvolveDeck: ["BP18-006", "BP18-010"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP18-008");
    expect([t.field("opp"), t.leader("opp")]).toEqual([[], 19]);
    expect(d({ me: { hand: ["BP18-008"], faceUpEvolveDeck: ["BP18-006"], playPoints: 2 }, opp: { field: ["V5"] } }).canPlay("BP18-008")).toBe(false);
  });

  it("009 / 010 Verdant City Pugilist — whenever a follower on your field evolves: a Togh Keyoh follower +1/+1; evolved: 1 damage", () => {
    const t = d({ me: { field: ["BP18-009", "BP18-005"], evolveDeck: ["BP18-006"], playPoints: 0 } }).evolve("BP18-005").flush().pick("BP18-009");
    expect(t.stats("BP18-009")).toEqual([2, 2]);
    const e = d({ me: { field: ["BP18-009"], evolveDeck: ["BP18-010"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP18-009").flush().pick("opp:V5");
    expect([e.stats("opp:V5"), e.stats("BP18-009")]).toEqual([[5, 4], [3, 3]]);
  });

  it("011 / 012 Blossoming Lunerian — evolved: a Beast card from the top 3 into the EX area", () => {
    const t = d({ me: { field: ["BP18-011"], evolveDeck: ["BP18-012"], deck: ["V1", "BP18-018", "V3"], playPoints: 1 } });
    t.evolve("BP18-011").pick("BP18-018").order();
    expect(t.ex()).toEqual(["BP18-018"]);
  });

  it("013 Sowing Paradise — X less for faceup evolved Togh Keyoh followers; up to 2 Togh Keyoh followers from the cemetery", () => {
    const t = d({ me: { hand: ["BP18-013"], cemetery: ["BP18-005", "BP18-009", "V1"], faceUpEvolveDeck: ["BP18-006", "BP18-010"], playPoints: 3 } });
    t.play("BP18-013").pick("BP18-005", "BP18-009");
    expect([t.hand(), t.pp()]).toEqual([["BP18-005", "BP18-009"], 0]);
  });

  it("014 / 015 Verdant Law Supplicant — Evolve (0) only after an evolution this turn; evolved: a Togh Keyoh follower from the cemetery", () => {
    const t = d({ me: { field: ["BP18-001", "BP18-005", "BP18-014"], evolveDeck: ["BP18-006", "BP18-015"], cemetery: ["BP18-009", "BP18-014"], playPoints: 0 } });
    expect(t.canEvolve("BP18-014")).toBe(false);
    t.evolve("BP18-005").flush();
    t.evolve("BP18-014").flush();
    expect(t.hand()).toEqual(["BP18-009"]);
  });

  it("016 Milolo, Li'l Mountain Lass — Fanfare: the next 1-cost spell costs 1 less; once per turn, when you play a spell: a follower +1/+1 and Rush", () => {
    const t = d({ me: { hand: ["BP18-016", "KILL"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP18-016");
    expect([t.pp(), t.canPlay("KILL")]).toEqual([0, true]);
    const s = d({ me: { field: ["BP18-016", "V1"], hand: ["KILL", "KILL"], playPoints: 2 }, opp: { field: ["V5", "V3"] } });
    s.play("KILL").pick("opp:V5").flush().pick("V1");
    expect([s.stats("V1"), s.keywords("V1")]).toEqual([[3, 3], ["rush"]]);
    s.play("KILL");
    expect([s.stats("BP18-016"), s.stats("V1")]).toEqual([[3, 3], [3, 3]]);
  });

  it("017 Rayne, Elf Smith — Fanfare: another follower +1 attack, Rush and no damage this turn", () => {
    const t = d({ me: { hand: ["BP18-017"], field: ["V1"], playPoints: 2 }, opp: { field: [{ card: "V5", engaged: true }] } }).play("BP18-017");
    expect([t.stats("V1"), t.keywords("V1")]).toEqual([[3, 2], ["rush"]]);
    expect(t.attack("V1", "opp:V5").stats("V1")).toEqual([3, 2]);
  });

  it("018 Furious Mountain Deity — Strike: +3/+3", () => {
    expect(d({ me: { field: ["BP18-018"] } }).attack("BP18-018", "opp:leader").leader("opp")).toBe(14);
  });

  it("019 Airbound Barrage — a Forestcraft card of yours back to the hand, 3 damage", () => {
    const t = d({ me: { hand: ["BP18-019"], field: ["BP18-011"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP18-019");
    expect([t.hand(), t.stats("opp:V5")]).toEqual([["BP18-011"], [5, 2]]);
    expect(d({ me: { hand: ["BP18-019"], field: ["V1"], playPoints: 1 }, opp: { field: ["V5"] } }).canPlay("BP18-019")).toBe(false);
  });

  it("T01 Seeds of Salvation — draw; turn any faceup evolved followers facedown; gain an evolution point", () => {
    const t = d({ me: { ex: [SEEDS], faceUpEvolveDeck: ["BP18-006", "BP18-010"], deck: ["V1"], playPoints: 1 } }).play(`${SEEDS}@ex`).pick("BP18-006", "BP18-010");
    expect([t.hand(), t.game.reader().faceUpEvolveDeck(0), ep(t)]).toEqual([["V1"], [], 1]);
  });
});
