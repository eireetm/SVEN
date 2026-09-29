import type { CardMove, Decision, GameEvent } from "@sve/core";
import { describe, expect, it } from "vitest";
import type { LogEntry } from "../src/engine/protocol";
import { actionsFor, answerFor, attackTargets, dragKind, inDialog } from "../src/game/actions";
import { planFlights } from "../src/game/animation/plan";
import { computeLayout, ENGAGED_WIDTH, MAT_BOX_HEIGHT, PIECES, SLOT_COUNT, SLOT_PITCH, WIDE_WIDTH, pileRect, slotRect, type PileZone, type Rect } from "../src/game/board/layout";
import { NO_SLOTS, placeWaiting, reconcileSlots } from "../src/game/board/slots";

// The table's pure parts: the layout of the mats, the options of a card, and the flights of the animations.

describe("table layout", () => {
  it("fits both mats, the hands and the side panels in the table area, at the wide mat's aspect", () => {
    for (const [width, height] of [
      [945, 900],
      [1240, 1080],
      [807, 768],
      [600, 1000],
    ] as const) {
      const l = computeLayout(width, height);
      expect(l.matWidth / l.matHeight).toBeCloseTo(WIDE_WIDTH / MAT_BOX_HEIGHT, 5);
      expect(l.opponentHandHeight + 2 * l.matHeight + l.handHeight).toBeLessThanOrEqual(height);
      expect(l.matWidth + 2 * Math.min(l.sideWidth, 120)).toBeLessThanOrEqual(width);
      // Your hand's cards fit in their strip.
      expect(l.handCardWidth * (88 / 63)).toBeLessThan(l.handHeight);
    }
  });

  it("puts the opponent's zones at the same spots turned 180 degrees, all on the mat", () => {
    const own = pileRect("leader", false);
    const theirs = pileRect("leader", true);
    expect(theirs.left).toBeCloseTo(100 - own.left - own.width, 5);
    expect(theirs.top).toBeCloseTo(100 - own.top - own.height, 5);
    const piles: PileZone[] = ["leader", "deck", "cemetery", "evolveDeck", "banished"];
    const rects: Rect[] = piles.flatMap((p) => [pileRect(p, false), pileRect(p, true)]);
    for (const zone of ["field", "ex"] as const) for (let i = 0; i < SLOT_COUNT; i++) rects.push(slotRect(zone, i, false), slotRect(zone, i, true));
    for (const r of rects) {
      expect(r.left).toBeGreaterThanOrEqual(0);
      expect(r.top).toBeGreaterThanOrEqual(0);
      expect(r.left + r.width).toBeLessThanOrEqual(100.01);
      expect(r.top + r.height).toBeLessThanOrEqual(100.01);
    }
  });

  it("spreads the slots so that engaged cards overlap neither each other nor the piles, drawn parts keeping their size", () => {
    expect(SLOT_PITCH - ENGAGED_WIDTH).toBeGreaterThanOrEqual(10);
    // In picture pixels: an engaged card in the first slot stays right of the left piles, in the last left of the right ones.
    const px = (r: Rect) => ({ left: (r.left / 100) * WIDE_WIDTH, right: ((r.left + r.width) / 100) * WIDE_WIDTH });
    const first = px(slotRect("field", 0, false));
    const last = px(slotRect("field", SLOT_COUNT - 1, false));
    const middle = (s: { left: number; right: number }) => (s.left + s.right) / 2;
    expect(middle(first) - ENGAGED_WIDTH / 2).toBeGreaterThan(px(pileRect("evolveDeck", false)).right);
    expect(middle(last) + ENGAGED_WIDTH / 2).toBeLessThan(px(pileRect("deck", false)).left);
    // Slots and piles are shown at the size they are drawn; only the divider's plain ends stretch.
    for (const piece of PIECES) {
      const width = (piece.dst.width / 100) * WIDE_WIDTH;
      if (piece.kind === "line" && Math.abs(width - piece.src.w) > 1) expect(width).toBeGreaterThan(piece.src.w);
      else expect(width).toBeCloseTo(piece.src.w, 5);
    }
  });
});

describe("the mat's slots", () => {
  const side = (id: 0 | 1, field: string[], ex: string[] = []) => ({ id, field: field.map((c) => ({ id: c })), ex: ex.map((c) => ({ id: c })) });
  const view = (own: string[], theirs: string[] = [], ex: string[] = []) => ({ players: [side(0, own, ex), side(1, theirs)] }) as never;

  it("gives a new card the first free slot and keeps every card in its slot while it stays", () => {
    let slots = reconcileSlots(NO_SLOTS, view(["a", "b"]), () => false);
    expect(slots.rows["0:field"]).toEqual(["a", "b", null, null, null]);
    slots = reconcileSlots(slots, view(["b", "c"], ["x"], ["e"]), () => false);
    expect(slots.rows["0:field"]).toEqual(["c", "b", null, null, null]);
    expect(slots.rows["1:field"]).toEqual(["x", null, null, null, null]);
    expect(slots.rows["0:ex"]).toEqual(["e", null, null, null, null]);
    // Nothing changed: the same object (the table then does not redraw).
    expect(reconcileSlots(slots, view(["b", "c"], ["x"], ["e"]), () => false)).toBe(slots);
    expect(slots.waiting).toEqual([]);
  });

  it("lets a person pick the slot of each new card when placing by hand", () => {
    let slots = reconcileSlots(NO_SLOTS, view(["a"]), (p) => p === 0);
    expect(slots.waiting).toEqual(["a"]);
    slots = reconcileSlots(slots, view(["a", "b"], ["x"]), (p) => p === 0);
    expect(slots.waiting).toEqual(["a", "b"]);
    slots = placeWaiting(slots, 3);
    expect(slots.rows["0:field"]).toEqual([null, "b", null, "a", null]);
    // A taken slot can't be picked; the card's own slot can.
    expect(placeWaiting(slots, 3)).toBe(slots);
    slots = placeWaiting(slots, 1);
    expect(slots.waiting).toEqual([]);
    expect(slots.rows["1:field"]).toEqual(["x", null, null, null, null]);
  });
});

describe("where a decision is answered", () => {
  const select = (candidates: string[]): Decision => ({ type: "selectCards", player: 0, reason: "target", candidates, candidateDefs: candidates.map(() => "X"), min: 1, max: 1 }) as unknown as Decision;
  const onTable = (card: string) => card.startsWith("t");

  it("answers choices, confirmations, orders and ability order in the window, the rest on the table", () => {
    for (const type of ["selectPending", "choose", "confirm", "orderCards"]) expect(inDialog({ type } as unknown as Decision, onTable), type).toBe(true);
    for (const type of ["mainPhase", "quick", "mulligan", "chooseTurnOrder"]) expect(inDialog({ type } as unknown as Decision, onTable), type).toBe(false);
    expect(inDialog(undefined, onTable)).toBe(false);
  });

  it("selects cards on the table when they are all on it, else in the window (a search, a pile)", () => {
    expect(inDialog(select(["t1", "t2"]), onTable)).toBe(false);
    expect(inDialog(select(["t1", "deck7"]), onTable)).toBe(true);
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
