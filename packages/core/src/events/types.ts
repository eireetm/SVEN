import type { DefId, PrintingId } from "../model/card";
import type { CardId, PlayerId } from "../model/ids";
import type { GameResult, ZoneName } from "../model/state";

/**
 * Events emitted by the engine. They are the public, append-only description of what
 * happened; GUIs and bots subscribe to them (after `redactEvent`) instead of diffing state.
 * The engine also uses them internally to detect automatic-ability triggers (CR 10.7).
 * Plain JSON only.
 */

export type MoveReason =
  | "setup" // CR 6.2 deck / leader placement
  | "draw" // CR 5.10
  | "mulligan" // CR 6.2.1.8
  | "play" // CR 10.6.2.1 to the resolution zone
  | "resolve" // CR 10.6.2.8 resolution zone to field / cemetery
  | "destroy" // CR 5.6 (including rules handling 11.3)
  | "banish" // CR 5.7
  | "discard" // CR 5.12
  | "evolve" // CR 5.16 evolve deck -> evolve zone
  | "rules" // other rules handling (CR 11.4–11.6)
  | "effect"; // any other card effect

export interface ZoneRef {
  player: PlayerId;
  zone: ZoneName;
  /** CR 4.2.3 — faceup state of the card in that zone. */
  faceUp: boolean;
}

/** One card changing zones. CR 4.1.4: the card gets a new id in the new zone. */
export interface CardMove {
  /**
   * Id before the move; null when a token is created (CR 9.1.2), and in redacted events
   * when the card left a deck.
   */
  card: CardId | null;
  /** Id after the move; null only in redacted events when the card went into a deck. */
  newCard: CardId | null;
  def: DefId;
  printing: PrintingId;
  owner: PlayerId;
  from: ZoneRef | null;
  to: ZoneRef;
  reason: MoveReason;
  /**
   * Look-back information (CR 10.7.4.1): the definition that provided the card's abilities,
   * its controller, and the counters it had in the zone it left (e.g. BP03-090 "if this card
   * had a Fable counter" — counters are removed by the move itself, CR 15.1).
   */
  before: { abilityDef: DefId; controller: PlayerId; counters: Record<string, number> } | null;
}

export type GameEvent =
  | { type: "gameStarted"; firstPlayer: PlayerId }
  | { type: "turnOrderChosen"; player: PlayerId; goFirst: boolean }
  | { type: "mulligan"; player: PlayerId; redraw: boolean }
  | { type: "turnStarted"; turn: number; player: PlayerId }
  | { type: "phaseStarted"; phase: "start" | "main" | "end"; player: PlayerId }
  /** Cards moved simultaneously (one batch). */
  | { type: "cardsMoved"; moves: CardMove[] }
  /** CR 9.1.3 / 9.1.4.4 tokens removed from the game. */
  | { type: "tokensEliminated"; cards: CardId[] }
  | { type: "deckShuffled"; player: PlayerId }
  | { type: "playPointsChanged"; player: PlayerId; playPoints: number; maxPlayPoints: number }
  | {
      type: "evolutionPointsChanged";
      player: PlayerId;
      evolutionPoints: number;
      superEvolutionPoints: number;
    }
  /** CR 5.4 engage / refresh. */
  | { type: "placementChanged"; cards: CardId[]; engaged: boolean }
  /** CR 15.1 counters placed on / removed from a card. `count` is the new total. */
  | { type: "countersChanged"; card: CardId; counter: string; count: number }
  /** CR 5.21 cards revealed to all players. */
  | { type: "cardsRevealed"; player: PlayerId; cards: { id: CardId; def: DefId }[] }
  /** CR 5.28 a player will take another turn. */
  | { type: "extraTurnGranted"; player: PlayerId }
  /**
   * CR 5.14. `kind` follows CR 5.14.3 (attack / combat / ability damage); `combat` tells
   * whether it is combat damage (5.14.3.2: damage exchanged by an attacking follower and the
   * follower it attacks).
   */
  | {
      type: "damageDealt";
      source: CardId | null;
      target: CardId;
      amount: number;
      kind: "attack" | "combat" | "ability";
      combat: boolean;
    }
  /** A leader's defense changed by `delta` (damage, CR 5.14; or "give +/-X", 5.27). */
  | { type: "leaderDefenseChanged"; player: PlayerId; defense: number; delta: number }
  /** CR 5.16 / 12.2.4. */
  | { type: "evolved"; card: CardId; evolveCard: CardId; superEvolved: boolean }
  /** CR 10.6.2.7 a card has been played (it is now in the resolution zone). */
  | { type: "cardPlayed"; player: PlayerId; card: CardId; def: DefId; from: ZoneName }
  /**
   * Cards in public zones chosen by a "select" (CR 10.6.2.3), not by a cost or a discard.
   * BP03-071 triggers when it is among them. Hidden-zone selections are not emitted.
   */
  | { type: "cardsSelected"; player: PlayerId; cards: CardId[]; source: CardId | null }
  /** CR 10.6.2.7 an activated or automatic ability has been played. */
  | { type: "abilityPlayed"; player: PlayerId; source: CardId; sourceDef: DefId; ability: number }
  /** CR 10.7.2 an automatic ability became pending. */
  | { type: "abilityTriggered"; pendingId: string; player: PlayerId; source: CardId; sourceDef: DefId; ability: number }
  /** CR 8.4.5 the follower has attacked. */
  | { type: "attackDeclared"; player: PlayerId; attacker: CardId; target: CardId }
  /** CR 8.4.9.2 */
  | { type: "fought"; attacker: CardId; defender: CardId }
  /** CR 8.4.11 */
  | { type: "attackEnded"; attacker: CardId }
  | { type: "gameEnded"; result: GameResult };
