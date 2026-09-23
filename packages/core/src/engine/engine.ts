import { CardDatabase } from "../data/database";
import type { CardDefinition, DefId, PrintingId } from "../model/card";
import { DEFAULT_CONFIG, DEFAULT_RULES, type GameConfig, type RuleParameters } from "../model/config";
import { IMPLEMENTED_KEYWORDS } from "../model/keyword";
import type { ScriptRegistry } from "../script/types";
import { createInitialState, implementationStatus, validateDeck, type DeckList, type ImplementationStatus } from "./deck";
import { DeckError, EngineError } from "./errors";
import { GameSession, type GameSnapshot, type SessionOptions } from "./session";

export interface EngineOptions {
  cards: CardDatabase | readonly CardDefinition[];
  scripts?: ScriptRegistry;
}

export type GameConfigInput = Partial<Omit<GameConfig, "rules">> & { rules?: Partial<RuleParameters> };

export interface GameSetup {
  seed: string | number;
  players: readonly [DeckList, DeckList];
  config?: GameConfigInput;
}

export function resolveConfig(input: GameConfigInput = {}): GameConfig {
  return { ...DEFAULT_CONFIG, ...input, rules: { ...DEFAULT_RULES, ...input.rules } };
}

/**
 * A rules engine instance: a card pool plus card scripts. Stateless with respect to games;
 * every game lives in its own GameSession.
 */
export class Engine {
  readonly db: CardDatabase;
  readonly scripts: ScriptRegistry;

  constructor(options: EngineOptions) {
    this.db = options.cards instanceof CardDatabase ? options.cards : new CardDatabase(options.cards);
    this.scripts = options.scripts ?? {};
    for (const [id, script] of Object.entries(this.scripts)) {
      if (!this.db.has(id)) throw new EngineError(`script for unknown card definition ${id}`);
      for (const k of script.keywords ?? []) {
        if (!IMPLEMENTED_KEYWORDS.includes(k)) throw new EngineError(`${id}: keyword "${k}" is not implemented by the engine yet`);
      }
    }
  }

  /** CR 6.1 — problems with a deck list under the given configuration (empty = valid). */
  validateDeck(deck: DeckList, config: GameConfigInput = {}): string[] {
    return validateDeck(this.db, this.scripts, deck, resolveConfig(config));
  }

  implementationStatus(id: DefId | PrintingId): ImplementationStatus {
    const def = this.db.has(id) ? this.db.get(id) : this.db.ofPrinting(id);
    return implementationStatus(this.scripts, def);
  }

  /** Validate decks, build the initial state and run the game to its first decision. */
  newGame(setup: GameSetup, options: SessionOptions = {}): GameSession {
    const config = resolveConfig(setup.config);
    const problems = setup.players.flatMap((deck, p) =>
      validateDeck(this.db, this.scripts, deck, config).map((msg) => `player ${p}: ${msg}`),
    );
    if (problems.length > 0) throw new DeckError(problems);
    const state = createInitialState(this.db, setup.players, setup.seed, config);
    return GameSession.start(this, state, options);
  }

  restore(snapshot: GameSnapshot, options: SessionOptions = {}): GameSession {
    return GameSession.restore(this, snapshot, options);
  }
}

export function createEngine(options: EngineOptions): Engine {
  return new Engine(options);
}
