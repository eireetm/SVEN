import type { Decision } from "./decision";
import type { PlayerId } from "./ids";

/**
 * Numeric rule parameters. Every value cites the clause that defines it, so a rules update
 * that changes a number is a one-line change here.
 */
export interface RuleParameters {
  /** CR 2.8.3.1 / 6.2.1.12 — starting leader defense. */
  leaderDefense: number;
  /** CR 6.2.1.7 — opening hand size (also the redraw size, CR 6.2.1.8). */
  openingHand: number;
  /** CR 3.2.4.1 — upper limit of maximum play points. */
  maxPlayPointsCap: number;
  /** CR 4.4.4.1 — field limit at the start of the game. */
  fieldLimit: number;
  /** CR 4.8.3.1 — EX area limit at the start of the game. */
  exAreaLimit: number;
  /** CR 4.7.3.1 — hand limit at the start of the game. */
  handLimit: number;
  /** CR 6.2.1.10 — evolution points received by [first player, second player]. */
  evolutionPoints: readonly [number, number];
  /** CR 6.2.1.11 — super-evolution points received by each player. */
  superEvolutionPoints: number;
  /** CR 12.2.4 — turns passed required to super-evolve, [went first, went second]. */
  superEvolveTurnsPassed: readonly [number, number];
  /** CR 14.3.1.2 — Magical Item tokens put into the EX area of a THE IDOLM@STER CINDERELLA GIRLS deck at the start. */
  magicalItemsAtStart: number;
  /** CR 6.1.1.2–6.1.1.4 — deck construction numbers. */
  deck: {
    mainMin: number;
    mainMax: number;
    evolveMax: number;
    copiesPerName: number;
  };
}

export const DEFAULT_RULES: RuleParameters = {
  leaderDefense: 20,
  openingHand: 4,
  maxPlayPointsCap: 10,
  fieldLimit: 5,
  exAreaLimit: 5,
  handLimit: 7,
  evolutionPoints: [0, 3],
  superEvolutionPoints: 1,
  superEvolveTurnsPassed: [7, 6],
  magicalItemsAtStart: 5,
  deck: { mainMin: 40, mainMax: 50, evolveMax: 10, copiesPerName: 3 },
};

/** Per-game options. Stored in the game state so a saved game fully describes itself. */
export interface GameConfig {
  /**
   * CR 6.1 deck construction rules (sizes, copies, class). When false the decks are only
   * checked for structural rules the engine depends on (e.g. evolved cards in the evolve deck).
   */
  deckRestrictions: boolean;
  /** Allow cards whose card text has no script yet (they would behave as vanilla). */
  allowUnimplementedCards: boolean;
  /**
   * Fixed first player. null = CR 6.2.1.6: pick a player at random, who then decides.
   * Mainly for tests and reproducible bot matches.
   */
  firstPlayer: PlayerId | null;
  /**
   * Decision types that are answered automatically when they have exactly one legal answer
   * (e.g. a quick window where passing is the only option). Rules-equivalent, so it only
   * affects pacing: bots want all of them, a GUI may prefer to show every main phase.
   */
  autoResolve: readonly AutoResolvable[];
  rules: RuleParameters;
}

export type AutoResolvable = Extract<
  Decision["type"],
  "mainPhase" | "quick" | "selectPending" | "selectCards" | "choose" | "orderCards"
>;

export const ALL_AUTO_RESOLVABLE: readonly AutoResolvable[] = [
  "mainPhase",
  "quick",
  "selectPending",
  "selectCards",
  "choose",
  "orderCards",
];

export const DEFAULT_CONFIG: GameConfig = {
  deckRestrictions: true,
  allowUnimplementedCards: false,
  firstPlayer: null,
  autoResolve: ALL_AUTO_RESOLVABLE,
  rules: DEFAULT_RULES,
};
