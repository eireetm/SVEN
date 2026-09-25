import { DEFAULT_LEADER, type CardDatabase } from "../data/database";
import type { CardDefinition, PrintingId } from "../model/card";
import type { GameConfig } from "../model/config";
import type { PlayerId } from "../model/ids";
import type { GameState, PlayerState } from "../model/state";
import { seedRng } from "../rng/rng";
import type { ScriptRegistry } from "../script/types";
import { placeInitialCard } from "./state/zones";
import { emptyTurnCounts } from "./state/turn-counts";

/** A player's cards for one game (CR 6.1.1). Entries are printing card numbers. */
export interface DeckList {
  /** CR 6.1.1.1. Optional only when deck restrictions are off (a placeholder leader is used). */
  leader?: PrintingId;
  /** CR 6.1.1.2 */
  main: readonly PrintingId[];
  /** CR 6.1.1.3 */
  evolve: readonly PrintingId[];
}

export type ImplementationStatus = "vanilla" | "scripted" | "missing";

/** Does the engine know how this card behaves? Cards without card text need no script. */
export function implementationStatus(scripts: ScriptRegistry, def: CardDefinition): ImplementationStatus {
  if (scripts[def.id]) return "scripted";
  return def.text.en === "" ? "vanilla" : "missing";
}

/**
 * Check a deck list. Two groups of checks:
 *  - structural rules the engine relies on, always enforced: card types per deck
 *    (6.1.1.1–6.1.1.3), tokens never in decks (9.1.4), unimplemented cards;
 *  - construction rules (6.1.1.2 sizes, 6.1.1.3 size, 6.1.1.4 copies, 6.1.1.5 class),
 *    enforced only when `config.deckRestrictions` is on.
 * Returns human-readable problems (empty = valid).
 */
export function validateDeck(
  db: CardDatabase,
  scripts: ScriptRegistry,
  deck: DeckList,
  config: Pick<GameConfig, "deckRestrictions" | "allowUnimplementedCards" | "rules">,
): string[] {
  const problems: string[] = [];
  const resolve = (printing: PrintingId, where: string): CardDefinition | null => {
    if (!db.hasPrinting(printing)) {
      problems.push(`${where}: unknown card number ${printing}`);
      return null;
    }
    return db.ofPrinting(printing);
  };

  const leader = deck.leader !== undefined ? resolve(deck.leader, "leader") : null;
  if (leader && leader.type !== "leader") problems.push(`leader: ${deck.leader} is not a leader card (6.1.1.1)`);

  const main = deck.main.map((p) => resolve(p, "main deck")).filter((d): d is CardDefinition => d !== null);
  const evolve = deck.evolve.map((p) => resolve(p, "evolve deck")).filter((d): d is CardDefinition => d !== null);

  for (const d of main) {
    if (d.type === "leader" || d.evolved || d.token) {
      problems.push(`main deck: ${d.id} ${d.name} cannot be in the main deck (6.1.1.2, 9.1.4)`);
    }
  }
  for (const d of evolve) {
    if (!d.evolved || d.token) problems.push(`evolve deck: ${d.id} ${d.name} is not an evolved card (6.1.1.3)`);
  }
  if (!config.allowUnimplementedCards) {
    const missing = new Set(
      [...main, ...evolve, ...(leader ? [leader] : [])]
        .filter((d) => implementationStatus(scripts, d) === "missing")
        .map((d) => `${d.id} ${d.name}`),
    );
    for (const m of missing) problems.push(`card effect not implemented yet: ${m}`);
  }

  if (config.deckRestrictions) {
    const r = config.rules.deck;
    if (!leader) problems.push("a leader card is required (6.1.1.1)");
    if (deck.main.length < r.mainMin || deck.main.length > r.mainMax) {
      problems.push(`main deck has ${deck.main.length} cards, needs ${r.mainMin}–${r.mainMax} (6.1.1.2)`);
    }
    if (deck.evolve.length > r.evolveMax) {
      problems.push(`evolve deck has ${deck.evolve.length} cards, at most ${r.evolveMax} (6.1.1.3)`);
    }
    for (const [label, cards] of [["main deck", main], ["evolve deck", evolve]] as const) {
      const counts = new Map<string, { n: number; limit: number }>();
      for (const d of cards) {
        // CR 6.1.2 — a card's own deck-construction passive replaces the limit (BP09-049 "up to 50").
        const limit = scripts[d.id]?.deckLimit ?? r.copiesPerName;
        counts.set(d.name, { n: (counts.get(d.name)?.n ?? 0) + 1, limit });
      }
      for (const [name, { n, limit }] of counts) {
        if (n > limit) problems.push(`${label}: ${n} copies of "${name}", at most ${limit} (6.1.1.4)`);
      }
    }
    if (leader) {
      for (const d of [...main, ...evolve]) {
        if (d.class !== "Neutral" && d.class !== leader.class) {
          problems.push(`${d.id} ${d.name} (${d.class}) does not match the leader class ${leader.class} (6.1.1.5.1)`);
        }
      }
    }
  }
  return problems;
}

function emptyPlayer(id: PlayerId, leaderDefense: number): PlayerState {
  return {
    id,
    leaderDefense, // CR 2.8.3.1 (set again in 6.2.1.12)
    playPoints: 0,
    maxPlayPoints: 0,
    evolutionPoints: 0,
    superEvolutionPoints: 0,
    turnsPassed: 0,
    zones: { leader: [], deck: [], hand: [], field: [], ex: [], cemetery: [], banished: [], evolveDeck: [], evolveZone: [] },
    evolveAbilityTurn: null,
    drewFromEmptyDeck: false,
    cardsPlayed: { turn: 0, count: 0 },
    leaderDefenseLostTurn: null,
    skipNextTurn: false,
    thisTurn: emptyTurnCounts(0),
  };
}

/**
 * The state before CR 6.2.1.4: leaders in leader areas (6.2.1.2), main decks in deck areas
 * (not yet shuffled) and evolve decks in evolve deck areas (6.2.1.5).
 */
export function createInitialState(
  db: CardDatabase,
  decks: readonly [DeckList, DeckList],
  seed: string | number,
  config: GameConfig,
): GameState {
  const state: GameState = {
    schema: 1,
    config,
    rng: seedRng(seed),
    seq: 0,
    turn: 0,
    activePlayer: 0,
    firstPlayer: null,
    phase: "setup",
    players: [emptyPlayer(0, config.rules.leaderDefense), emptyPlayer(1, config.rules.leaderDefense)],
    cards: {},
    resolution: [],
    effects: [],
    pending: [],
    delayed: [],
    nextPlay: [],
    restrictions: [],
    extraTurns: [],
    revealed: [],
    attack: null,
    fights: [],
    result: null,
    anchor: null,
  };
  ([0, 1] as PlayerId[]).forEach((p) => {
    const deck = decks[p];
    placeInitialCard(state, db, deck.leader ?? DEFAULT_LEADER.id, p, "leader");
    for (const printing of deck.main) placeInitialCard(state, db, printing, p, "deck");
    for (const printing of deck.evolve) placeInitialCard(state, db, printing, p, "evolveDeck");
  });
  return state;
}
