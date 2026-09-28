import type { CardMove, Decision, GameEvent } from "@sve/core";
import { describe, expect, it } from "vitest";
import type { LogEntry } from "../src/engine/protocol";
import { actionsFor, answerFor, attackTargets, dragKind } from "../src/game/actions";
import { planFlights } from "../src/game/animation/plan";
import { computeLayout, MAT_HEIGHT, MAT_WIDTH, MAT_ZONES, zoneRect } from "../src/game/board/layout";

// The table's pure parts: the layout of the mats, the options of a card, and the flights of the animations.

describe("table layout", () => {
  it("fits both mats, the hands and the side panels in the table area, at the playmat's aspect", () => {
    for (const [width, height] of [
      [945, 900],
      [1240, 1080],
      [807, 768],
      [600, 1000],
    ] as const) {
      const l = computeLayout(width, height);
      expect(l.matWidth / l.matHeight).toBeCloseTo(MAT_WIDTH / MAT_HEIGHT, 5);
      expect(l.opponentHandHeight + 2 * l.matHeight + l.handHeight).toBeLessThanOrEqual(height);
      expect(l.matWidth + 2 * Math.min(l.sideWidth, 120)).toBeLessThanOrEqual(width);
      // Your hand's cards fit in their strip.
      expect(l.handCardWidth * (88 / 63)).toBeLessThan(l.handHeight);
    }
  });

  it("puts the opponent's zones at the same spots turned 180 degrees", () => {
    const own = MAT_ZONES.leader;
    const theirs = zoneRect("leader", true);
    expect(theirs.left).toBeCloseTo(100 - own.left - own.width, 5);
    expect(theirs.top).toBeCloseTo(100 - own.top - own.height, 5);
    // Every zone stays on the mat.
    for (const zone of Object.keys(MAT_ZONES) as (keyof typeof MAT_ZONES)[]) {
      for (const r of [zoneRect(zone, false), zoneRect(zone, true)]) {
        expect(r.left).toBeGreaterThanOrEqual(0);
        expect(r.top).toBeGreaterThanOrEqual(0);
        expect(r.left + r.width).toBeLessThanOrEqual(100.01);
        expect(r.top + r.height).toBeLessThanOrEqual(100.01);
      }
    }
  });
});

describe("a card's options", () => {
  const main: Decision = {
    type: "mainPhase",
    player: 0,
    actions: [
      { type: "play", card: "h1" },
      { type: "evolve", card: "f1", ability: 0, evolveCard: "e1", useEvolutionPoint: true, superEvolve: false },
      { type: "activate", card: "f1", ability: 1 },
      { type: "attack", attacker: "f1", target: "L2" },
      { type: "attack", attacker: "f1", target: "g2" },
      { type: "attack", attacker: "f2", target: "L2" },
      { type: "endMainPhase" },
    ],
  };

  it("lists the actions of one card, and its attack targets", () => {
    expect(actionsFor(main, "h1")).toEqual([{ type: "play", card: "h1" }]);
    expect(actionsFor(main, "f1").map((a) => a.type)).toEqual(["evolve", "activate", "attack", "attack"]);
    expect(actionsFor(main, "x")).toEqual([]);
    expect(attackTargets(main, "f1")).toEqual(["L2", "g2"]);
    expect(attackTargets(main, "h1")).toEqual([]);
  });

  it("drags a card to play it or to attack", () => {
    expect(dragKind(actionsFor(main, "h1"))).toBe("play");
    expect(dragKind(actionsFor(main, "f1"))).toBe("attack");
    expect(dragKind([])).toBeNull();
  });

  it("answers a main phase or a quick decision with the action", () => {
    expect(answerFor(main, { type: "play", card: "h1" })).toEqual({ type: "mainPhase", action: { type: "play", card: "h1" } });
    const quick: Decision = { type: "quick", player: 1, timing: "attack", actions: [{ type: "play", card: "q" }, { type: "pass" }] };
    expect(actionsFor(quick, "q")).toEqual([{ type: "play", card: "q" }]);
    expect(answerFor(quick, { type: "play", card: "q" })).toEqual({ type: "quick", action: { type: "play", card: "q" } });
    expect(actionsFor({ type: "mulligan", player: 0, hand: ["h1"] }, "h1")).toEqual([]);
  });
});

describe("animation flights", () => {
  const zone = (player: 0 | 1, name: string) => ({ player, zone: name, faceUp: true }) as CardMove["from"] & object;
  const move = (card: string | null, newCard: string | null, from: CardMove["from"], to: CardMove["to"]): CardMove => ({
    card,
    newCard,
    def: "D",
    printing: "P",
    owner: 0,
    from,
    to,
    reason: "effect",
    before: null,
  });
  const entry = (event: GameEvent, seq: number): LogEntry => ({ seq, turn: 1, event, cards: {} });

  it("follows a card through one update: hand, resolution, field is one flight from the hand", () => {
    const flights = planFlights([
      entry({ type: "cardsMoved", moves: [move("h1", "r1", zone(0, "hand"), { player: 0, zone: "resolution", faceUp: true })] }, 1),
      entry({ type: "cardsMoved", moves: [move("r1", "f1", { player: 0, zone: "resolution", faceUp: true }, zone(0, "field"))] }, 2),
    ]);
    expect(flights).toEqual([{ origin: { card: "h1", zone: "0:hand" }, to: "0:field", card: "f1" }]);
  });

  it("flies a drawn card from the deck, a new token from nowhere, and a card into a deck to its pile", () => {
    const flights = planFlights([
      entry(
        {
          type: "cardsMoved",
          moves: [
            move(null, "h2", zone(1, "deck"), zone(1, "hand")),
            move(null, "t1", null, zone(0, "ex")),
            move("f3", null, zone(0, "field"), zone(0, "deck")),
          ],
        },
        1,
      ),
    ]);
    expect(flights).toEqual([
      { origin: { card: null, zone: "1:deck" }, to: "1:hand", card: "h2" },
      { origin: { card: null, zone: null }, to: "0:ex", card: "t1" },
      { origin: { card: "f3", zone: "0:field" }, to: "0:deck", card: null },
    ]);
  });
});
