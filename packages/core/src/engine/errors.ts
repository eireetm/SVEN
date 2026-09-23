import type { GameResult } from "../model/state";

/** A bug or an impossible state inside the engine (never caused by a legal input). */
export class EngineError extends Error {
  override name = "EngineError";
}

/** An input that is not a legal answer to the current decision. The game is unchanged. */
export class IllegalInputError extends Error {
  override name = "IllegalInputError";
}

/** Deck lists that cannot be used to start a game. */
export class DeckError extends Error {
  override name = "DeckError";
  constructor(readonly problems: readonly string[]) {
    super(`invalid deck:\n  - ${problems.join("\n  - ")}`);
  }
}

/**
 * Thrown through the running procedures when the game ends (CR 1.2), to unwind the flow.
 * Caught only by the top-level game procedure.
 */
export class GameOver {
  constructor(readonly result: GameResult) {}
}
