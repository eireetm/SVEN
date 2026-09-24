import { describe, expect, it } from "vitest";
import type { GameSession, MainAction } from "../../src";
import { scenario } from "../../src/testing";
import { act, cardsOf, doMain, leaderId, mainActions, only, stats, testEngine } from "../helpers";

const engine = testEngine();

const attacks = (g: GameSession) =>
  mainActions(g).filter((a): a is Extract<MainAction, { type: "attack" }> => a.type === "attack");
const targetsOf = (g: GameSession, attacker: string) =>
  attacks(g).filter((a) => a.attacker === attacker).map((a) => a.target);

describe("CR 8.4.2 selecting the attacking follower", () => {
  it("8.4.2.1 — a follower put onto the field this turn cannot attack", () => {
    const g = scenario(engine, {
      players: [{ field: ["V1", { card: "V2", enteredThisTurn: true }] }, {}],
    });
    const v1 = only(cardsOf(g, 0, "field", "V1"));
    expect(attacks(g).map((a) => a.attacker)).toEqual([v1]);
  });

  it("8.4.2 — an engaged follower cannot attack", () => {
    const g = scenario(engine, { players: [{ field: [{ card: "V1", engaged: true }] }, {}] });
    expect(attacks(g)).toEqual([]);
  });

  it("8.4.2.1 / 8.4.3.1 — a follower that evolved this turn may attack, but only engaged followers", () => {
    const g = scenario(engine, {
      players: [
        { field: [{ card: "EVOLVER", enteredThisTurn: true, evolvedInto: "EVOLVER-E", evolvedThisTurn: true }] },
        { field: [{ card: "V1", engaged: true }, "V2"] },
      ],
    });
    const evolver = only(g.state.players[0].zones.field);
    expect(targetsOf(g, evolver)).toEqual(cardsOf(g, 1, "field", "V1"));
  });

  it("12.9.2 — Storm: may attack the enemy leader or engaged followers the turn it entered", () => {
    const g = scenario(engine, {
      players: [{ field: [{ card: "STORM", enteredThisTurn: true }] }, { field: [{ card: "V1", engaged: true }, "V2"] }],
    });
    const storm = only(g.state.players[0].zones.field);
    expect(targetsOf(g, storm)).toEqual([only(cardsOf(g, 1, "field", "V1")), leaderId(g, 1)]);
  });

  it("12.9.2 / 12.8.2 (iii) — Storm still has to attack an engaged Ward follower", () => {
    const g = scenario(engine, {
      players: [{ field: [{ card: "STORM", enteredThisTurn: true }] }, { field: [{ card: "WARD", engaged: true }] }],
    });
    const storm = only(g.state.players[0].zones.field);
    expect(targetsOf(g, storm)).toEqual(g.state.players[1].zones.field);
  });

  it("12.9.2 / 10.9.1.2 — a follower given Storm this turn can attack the leader at once", () => {
    const g = scenario(engine, { players: [{ hand: ["V1", "GIVE-STORM"], playPoints: 1 }, {}] });
    doMain(g, { type: "play", card: only(cardsOf(g, 0, "hand", "V1")) });
    const v1 = only(g.state.players[0].zones.field);
    expect(targetsOf(g, v1)).toEqual([]);
    doMain(g, { type: "play", card: only(cardsOf(g, 0, "hand", "GIVE-STORM")) });
    act(g, { type: "selectCards", cards: [v1] });
    expect(targetsOf(g, v1)).toEqual([leaderId(g, 1)]);
  });

  it("12.10.2 — Rush: may attack the turn it entered, engaged followers only", () => {
    const g = scenario(engine, {
      players: [{ field: [{ card: "RUSH", enteredThisTurn: true }] }, { field: [{ card: "V1", engaged: true }] }],
    });
    const rush = only(g.state.players[0].zones.field);
    expect(targetsOf(g, rush)).toEqual(g.state.players[1].zones.field);
  });

  it("8.4.3.2 — a follower with no selectable target cannot be selected", () => {
    const g = scenario(engine, {
      players: [{ field: [{ card: "RUSH", enteredThisTurn: true }] }, { field: ["V1"] }],
    });
    expect(attacks(g)).toEqual([]);
  });
});

describe("CR 8.4.3 selecting the attack target", () => {
  it("8.4.3.1 — engaged enemy followers and the enemy leader; reserved followers are not targets", () => {
    const g = scenario(engine, {
      players: [{ field: ["V1"] }, { field: [{ card: "V2", engaged: true }, "V3"] }],
    });
    const v1 = only(g.state.players[0].zones.field);
    expect(targetsOf(g, v1)).toEqual([only(cardsOf(g, 1, "field", "V2")), leaderId(g, 1)]);
  });

  it("12.8.2 (iii) — an engaged Ward follower must be selected if possible", () => {
    const g = scenario(engine, {
      players: [{ field: ["V1"] }, { field: [{ card: "V2", engaged: true }, { card: "WARD", engaged: true }] }],
    });
    const v1 = only(g.state.players[0].zones.field);
    expect(targetsOf(g, v1)).toEqual(cardsOf(g, 1, "field", "WARD"));
  });

  it("12.8.2 (iii) — a reserved Ward follower does not restrict attacks", () => {
    const g = scenario(engine, { players: [{ field: ["V1"] }, { field: ["WARD"] }] });
    const v1 = only(g.state.players[0].zones.field);
    expect(targetsOf(g, v1)).toEqual([leaderId(g, 1)]);
  });

  it("12.12.2 — a follower with Intimidate cannot be selected as an attack target", () => {
    const g = scenario(engine, {
      players: [{ field: ["V1"] }, { field: [{ card: "INTIM", engaged: true }, { card: "V2", engaged: true }] }],
    });
    const v1 = only(g.state.players[0].zones.field);
    expect(targetsOf(g, v1)).toEqual([only(cardsOf(g, 1, "field", "V2")), leaderId(g, 1)]);
  });
});

describe("CR 8.4.4–8.4.11 the attack", () => {
  it("attacking the leader: engage, deal attack damage (5.14.3.1)", () => {
    const g = scenario(engine, { players: [{ field: ["V5"] }, {}] });
    const v5 = only(g.state.players[0].zones.field);
    const events = doMain(g, { type: "attack", attacker: v5, target: leaderId(g, 1) });
    expect(g.state.cards[v5]!.engaged).toBe(true);
    expect(g.state.players[1].leaderDefense).toBe(15);
    expect(events).toContainEqual({ type: "damageDealt", source: v5, target: leaderId(g, 1), amount: 5, kind: "attack", combat: false });
    expect(events.map((e) => e.type)).toEqual(
      expect.arrayContaining(["placementChanged", "attackDeclared", "damageDealt", "leaderDefenseChanged", "attackEnded"]),
    );
    expect(g.state.attack).toBeNull();
  });

  it("11.2.1 — a leader at 0 defense loses at the next rules handling", () => {
    const g = scenario(engine, { players: [{ field: ["V5"] }, { leaderDefense: 5 }] });
    doMain(g, { type: "attack", attacker: only(g.state.players[0].zones.field), target: leaderId(g, 1) });
    expect(g.result).toEqual({ winner: 0, losses: [{ player: 1, reason: "leaderDefense" }] });
    expect(g.decision).toBeNull();
  });

  it("8.4.9.1 / 11.3.1 — combat damage is simultaneous; followers at 0 defense are destroyed", () => {
    const g = scenario(engine, {
      players: [{ field: ["V3"] }, { field: [{ card: "V1", engaged: true }, { card: "V5", engaged: true }] }],
    });
    const v3 = only(g.state.players[0].zones.field);
    const v1 = only(cardsOf(g, 1, "field", "V1"));
    const events = doMain(g, { type: "attack", attacker: v3, target: v1 });
    // V3 (3/4) took 2 from V1 (2/2); V1 took 3 and was destroyed.
    expect(stats(g, v3)).toEqual({ attack: 3, defense: 2 });
    expect(cardsOf(g, 1, "cemetery", "V1")).toHaveLength(1);
    expect(events).toContainEqual({ type: "fought", attacker: v3, defender: v1 });
    expect(events).toContainEqual({ type: "damageDealt", source: v1, target: v3, amount: 2, kind: "combat", combat: true });
  });

  it("11.3.1 — both followers can destroy each other", () => {
    const g = scenario(engine, {
      players: [{ field: ["V2"] }, { field: [{ card: "V2", engaged: true }] }],
    });
    const [a] = g.state.players[0].zones.field;
    const [b] = g.state.players[1].zones.field;
    doMain(g, { type: "attack", attacker: a!, target: b! });
    // 2/3 vs 2/3: both survive with 1 defense
    expect(stats(g, a!)).toEqual({ attack: 2, defense: 1 });
    const g2 = scenario(engine, { players: [{ field: ["V1"] }, { field: [{ card: "V1", engaged: true }] }] });
    doMain(g2, { type: "attack", attacker: g2.state.players[0].zones.field[0]!, target: g2.state.players[1].zones.field[0]! });
    expect(g2.state.players[0].zones.field).toHaveLength(0);
    expect(g2.state.players[1].zones.field).toHaveLength(0);
  });

  it("12.14 / 11.3.2 — Bane destroys the follower it fought, even without damage (12.14.2.1)", () => {
    const g = scenario(engine, { players: [{ field: ["ZERO"] }, { field: [{ card: "BANE", engaged: true }] }] });
    const zero = only(g.state.players[0].zones.field);
    const bane = only(g.state.players[1].zones.field);
    const events = doMain(g, { type: "attack", attacker: zero, target: bane });
    // 1.3.2.2 — 0 attack deals no damage at all
    expect(events.filter((e) => e.type === "damageDealt" && e.source === zero)).toEqual([]);
    expect(g.state.players[0].zones.field).toHaveLength(0); // destroyed by Bane (1 damage alone would not kill it)
    expect(g.state.players[1].zones.field).toEqual([bane]);
  });

  it("8.4.7 / 8.4.9 — if the attacker leaves the field in the quick window, no damage is dealt", () => {
    const g = scenario(engine, {
      players: [{ field: ["V5"] }, { hand: ["QUICK-KILL"], playPoints: 1 }],
    });
    const v5 = only(g.state.players[0].zones.field);
    doMain(g, { type: "attack", attacker: v5, target: leaderId(g, 1) });
    expect(g.decision).toMatchObject({ type: "quick", player: 1, timing: "attack" });
    act(g, { type: "quick", action: { type: "play", card: only(cardsOf(g, 1, "hand", "QUICK-KILL")) } });
    act(g, { type: "selectCards", cards: [v5] });
    expect(g.state.players[1].leaderDefense).toBe(20);
    expect(g.state.attack).toBeNull();
    expect(g.decision).toMatchObject({ type: "mainPhase", player: 0 });
  });

  it("8.4.9 — if the target leaves the field, the attacker deals and takes no damage", () => {
    const g = scenario(engine, {
      players: [{ field: ["V3"] }, { field: [{ card: "V5", engaged: true }], hand: ["QUICK-SAC"] }],
    });
    const v3 = only(g.state.players[0].zones.field);
    const v5 = only(g.state.players[1].zones.field);
    doMain(g, { type: "attack", attacker: v3, target: v5 });
    act(g, { type: "quick", action: { type: "play", card: only(cardsOf(g, 1, "hand", "QUICK-SAC")) } });
    const events = act(g, { type: "selectCards", cards: [v5] });
    expect(events.filter((e) => e.type === "damageDealt" || e.type === "fought")).toEqual([]);
    expect(stats(g, v3)).toEqual({ attack: 3, defense: 4 });
    expect(g.state.cards[v3]!.engaged).toBe(true);
  });

  it("8.4.8 — with no Quick play the attack proceeds after the defender passes", () => {
    const g = scenario(engine, {
      players: [{ field: ["V3"] }, { field: [{ card: "V5", engaged: true }], hand: ["QUICK-SAC"] }],
    });
    const v3 = only(g.state.players[0].zones.field);
    const v5 = only(g.state.players[1].zones.field);
    doMain(g, { type: "attack", attacker: v3, target: v5 });
    act(g, { type: "quick", action: { type: "pass" } });
    // V3 (3/4) vs V5 (5/5): V3 destroyed, V5 left at 2 defense
    expect(cardsOf(g, 0, "cemetery", "V3")).toHaveLength(1);
    expect(stats(g, v5)).toEqual({ attack: 5, defense: 2 });
  });

  it("12.7 — Strike triggers when the follower attacks and resolves before damage (8.4.6)", () => {
    const g = scenario(engine, { players: [{ field: ["STRIKE"], deck: ["V1"] }, {}] });
    const striker = only(g.state.players[0].zones.field);
    doMain(g, { type: "attack", attacker: striker, target: leaderId(g, 1) });
    expect(g.decision).toMatchObject({ type: "selectPending", player: 0 });
    const events = act(g, { type: "selectPending", id: (g.decision as { options: string[] }).options[0]! });
    const order = events.map((e) => e.type).filter((t) => t === "cardsMoved" || t === "damageDealt");
    expect(order).toEqual(["cardsMoved", "damageDealt"]); // draw, then attack damage
    expect(g.state.players[0].zones.hand).toHaveLength(1);
  });
});
