import type { PrintingId } from "../model/card";
import type { PlayerId } from "../model/ids";
import { createInitialState } from "../engine/deck";
import type { Engine, GameConfigInput } from "../engine/engine";
import { resolveConfig } from "../engine/engine";
import type { GameSession, SessionOptions } from "../engine/session";
import { placeInitialCard } from "../engine/state/zones";

/**
 * Build a game positioned at the active player's main phase decision (the "mainPhase"
 * anchor), with an arbitrary board. For rule tests: no deck validation, no setup steps.
 */

export interface FieldCardSpec {
  card: PrintingId;
  engaged?: boolean;
  /** Put onto the field this turn (so it has not been there since the turn started, CR 8.4.2.1). */
  enteredThisTurn?: boolean;
  damage?: number;
  /**
   * Evolved card linked to it (CR 5.16.1): a printing, or the back-face definition of a
   * double-faced card (e.g. "BP09-005_back", CR 2.14) to show that face.
   */
  evolvedInto?: PrintingId;
  evolvedThisTurn?: boolean;
  /** CR 15.1 counters; Stack cards default to { stack: 1 } as when put onto the field (13.3.2.2). */
  counters?: Record<string, number>;
}

export interface ScenarioSide {
  leader?: PrintingId;
  /** Top card first. */
  deck?: PrintingId[];
  hand?: PrintingId[];
  field?: (PrintingId | FieldCardSpec)[];
  ex?: PrintingId[];
  cemetery?: PrintingId[];
  /** Cards in the banished zone (e.g. BP13-008 "at least 9 cards in your banished zone"). */
  banished?: PrintingId[];
  evolveDeck?: PrintingId[];
  /** Faceup cards in the evolve deck area (CR 4.6.3), e.g. evolved followers that were used. */
  faceUpEvolveDeck?: PrintingId[];
  leaderDefense?: number;
  playPoints?: number;
  maxPlayPoints?: number;
  evolutionPoints?: number;
  superEvolutionPoints?: number;
  turnsPassed?: number;
  /** Cards already returned from this player's field to a hand this turn (BP03-005). */
  returnedToHand?: number;
  /** Cards this player has already played this turn (CR 13.2.1, e.g. BP07-001 "at least 5"). */
  playedThisTurn?: number;
}

export interface ScenarioSpec {
  seed?: string | number;
  /** Global turn number (default 5). Odd turns belong to the first player. */
  turn?: number;
  firstPlayer?: PlayerId;
  players: [ScenarioSide, ScenarioSide];
  config?: GameConfigInput;
}

/**
 * By default only empty quick windows are skipped automatically, so rule tests see (and
 * must answer) every other decision. Override with `config.autoResolve`.
 */
export function scenario(engine: Engine, spec: ScenarioSpec, options: SessionOptions = {}): GameSession {
  const config = resolveConfig({ autoResolve: ["quick"], ...spec.config });
  const turn = spec.turn ?? 5;
  const first = spec.firstPlayer ?? 0;
  const second: PlayerId = first === 0 ? 1 : 0;
  const active = turn % 2 === 1 ? first : second;
  const state = createInitialState(
    engine.db,
    [
      { leader: spec.players[0].leader, main: [], evolve: [] },
      { leader: spec.players[1].leader, main: [], evolve: [] },
    ],
    spec.seed ?? "scenario",
    config,
  );
  state.turn = turn;
  state.firstPlayer = first;
  state.activePlayer = active;
  state.phase = "main";
  state.anchor = { kind: "mainPhase" };

  ([0, 1] as PlayerId[]).forEach((p) => {
    const side = spec.players[p];
    const ps = state.players[p];
    const place = (zone: "deck" | "hand" | "ex" | "cemetery" | "banished" | "evolveDeck", cards: PrintingId[] | undefined) => {
      for (const printing of cards ?? []) placeInitialCard(state, engine.db, printing, p, zone);
    };
    place("deck", side.deck);
    place("hand", side.hand);
    place("ex", side.ex);
    place("cemetery", side.cemetery);
    place("banished", side.banished);
    place("evolveDeck", side.evolveDeck);
    for (const printing of side.faceUpEvolveDeck ?? []) placeInitialCard(state, engine.db, printing, p, "evolveDeck", { faceUp: true });
    for (const entry of side.field ?? []) {
      const f: FieldCardSpec = typeof entry === "string" ? { card: entry } : entry;
      const id = placeInitialCard(state, engine.db, f.card, p, "field", { engaged: f.engaged ?? false });
      const c = state.cards[id]!;
      c.enteredFieldTurn = f.enteredThisTurn ? turn : turn - 1;
      c.damage = f.damage ?? 0;
      const stack: Record<string, number> = engine.scripts[c.def]?.keywords?.includes("stack") ? { stack: 1 } : {};
      c.counters = { ...stack, ...f.counters };
      if (f.evolvedInto !== undefined) {
        const front = engine.db.has(f.evolvedInto) ? engine.db.get(f.evolvedInto).frontFace : undefined;
        c.evolvedWith = front
          ? placeInitialCard(state, engine.db, front, p, "evolveZone", { backFace: true })
          : placeInitialCard(state, engine.db, f.evolvedInto, p, "evolveZone");
        c.evolvedTurn = f.evolvedThisTurn ? turn : turn - 1;
      }
    }
    const turnsPassed = side.turnsPassed ?? (p === first ? Math.ceil(turn / 2) : Math.floor(turn / 2));
    ps.turnsPassed = turnsPassed;
    // Default maximum: turns passed, but never below the given play points (so a scenario does
    // not start with play points that rules handling 11.9 would immediately lower).
    ps.maxPlayPoints =
      side.maxPlayPoints ?? Math.min(config.rules.maxPlayPointsCap, Math.max(turnsPassed, side.playPoints ?? 0));
    ps.playPoints = side.playPoints ?? ps.maxPlayPoints;
    ps.leaderDefense = side.leaderDefense ?? config.rules.leaderDefense;
    ps.evolutionPoints = side.evolutionPoints ?? config.rules.evolutionPoints[p === first ? 0 : 1];
    ps.superEvolutionPoints = side.superEvolutionPoints ?? config.rules.superEvolutionPoints;
    if (side.returnedToHand) ps.thisTurn = { ...ps.thisTurn, turn, returnedToHand: side.returnedToHand };
    if (side.playedThisTurn) ps.cardsPlayed = { turn, count: side.playedThisTurn };
  });

  return engine.restore({ format: 1, checkpoint: state, inputs: [] }, options);
}
