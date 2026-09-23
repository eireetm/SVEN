import type { DefId } from "./card";
import type { CardId, PlayerId } from "./ids";

/**
 * Every player input is an answer to a Decision raised by the engine. Bots, the GUI and the
 * network layer all use this single protocol; a replay is (seed + setup + list of inputs).
 *
 * Decisions only ever offer options that can be completed (illegal actions are never
 * selectable — see docs/architecture.md 5.2).
 */

/** CR 8.2–8.4, 7.3.3 — what the active player may do in the main phase. */
export type MainAction =
  /** CR 8.2 play a card from hand or EX area. */
  | { type: "play"; card: CardId }
  /**
   * CR 8.3 / 12.2 play an evolve ability. `evolveCard` is the corresponding card revealed from
   * the evolve deck (12.2.2); `useEvolutionPoint` replaces 1 play point (12.2.3);
   * `superEvolve` additionally pays 1 super-evolution point (12.2.4).
   */
  | {
      type: "evolve";
      card: CardId;
      ability: number;
      evolveCard: CardId;
      useEvolutionPoint: boolean;
      superEvolve: boolean;
    }
  /** CR 8.3 play another activated ability. */
  | { type: "activate"; card: CardId; ability: number }
  /** CR 8.4 attack. `target` is an enemy follower or the enemy leader card. */
  | { type: "attack"; attacker: CardId; target: CardId }
  /** CR 7.3.3 end the main phase. */
  | { type: "endMainPhase" };

/** CR 7.4.5 / 8.4.7 — non-active player's options in a quick window. */
export type QuickAction =
  | { type: "play"; card: CardId }
  | { type: "activate"; card: CardId; ability: number }
  | { type: "pass" };

export type SelectReason =
  /** CR 10.6.2.3 target selection while playing a card or ability. */
  | "target"
  /** Choosing the cards used to pay a cost (e.g. "return another card on your field"). */
  | "cost"
  /** CR 7.4.3 engage any number of followers with Ward. */
  | "wardEngage"
  /** CR 12.8.2 (i) followers with Ward just put onto the field that are engaged instead. */
  | "wardEnterEngaged"
  /** CR 7.4.7 discard down to the hand limit. */
  | "handLimitDiscard"
  /** CR 5.12 discard because an effect says so. */
  | "discard"
  /** CR 5.8 search a deck. */
  | "search"
  /** CR 11.4.1 choose the cards that stay on an over-full field. */
  | "fieldLimitKeep"
  /** CR 11.5.1 choose the cards that stay in an over-full EX area. */
  | "exLimitKeep"
  /** CR 4.4.4.2 / 4.8.3.2 choose which cards are moved when the zone would overflow. */
  | "zoneEntry"
  /** Any other selection made while an effect resolves. */
  | "effect";

export type ChooseReason =
  /** CR 5.18 choose among an ability's options. */
  | "mode"
  /** CR 10.6.2.2 / 10.4.7.3 how to play a card (e.g. an alternative cost). */
  | "playOption"
  /** Which token(s) to create when a zone limit or the card text leaves a choice. */
  | "token"
  /** Top or bottom of the deck. */
  | "deckPosition"
  /** Any other choice made while an effect resolves. */
  | "effect";

export type ConfirmReason =
  /** CR 10.4.7 optional "[cost]: [effect]" of an automatic ability. */
  | "optionalCost"
  /** CR 13.3.3.2 pay Earth Rite as an optional additional cost. */
  | "earthRite"
  /** A yes/no choice made while an effect resolves ("you may ..."). */
  | "effect";

/** A card together with its definition, for cards the deciding player is allowed to see. */
export interface CardRef {
  id: CardId;
  def: DefId;
}

interface DecisionBase {
  /** The player who must answer. */
  player: PlayerId;
}

export type Decision =
  /** CR 6.2.1.6 the randomly picked player decides who goes first. */
  | (DecisionBase & { type: "chooseTurnOrder" })
  /** CR 6.2.1.8 redraw or keep. */
  | (DecisionBase & { type: "mulligan"; hand: CardId[] })
  /** CR 7.3.3 main phase action. */
  | (DecisionBase & { type: "mainPhase"; actions: MainAction[] })
  /** CR 8.4.7 (after an attack) / 7.4.5 (end phase) quick window. */
  | (DecisionBase & { type: "quick"; timing: "attack" | "endPhase"; actions: QuickAction[] })
  /** CR 10.5.2.2 / 10.5.2.3 choose which pending automatic ability to play next. */
  | (DecisionBase & { type: "selectPending"; options: string[] })
  /** Choose between `min` and `max` cards among `candidates`. */
  | (DecisionBase & {
      type: "selectCards";
      reason: SelectReason;
      candidates: CardId[];
      /** Definitions of the candidates (same order), visible to the deciding player. */
      candidateDefs: DefId[];
      min: number;
      max: number;
      /** Card whose ability or rule asks for the selection, when there is one. */
      source: CardId | null;
      /** CR 5.11 cards the player is currently looking at (e.g. the top cards of a deck). */
      peek?: CardRef[];
    })
  /** Choose between `min` and `max` of the listed options. */
  | (DecisionBase & {
      type: "choose";
      reason: ChooseReason;
      options: { id: string; label: string }[];
      min: number;
      max: number;
      source: CardId | null;
    })
  /** Put cards in an order (first = topmost), e.g. "on the bottom of your deck in any order". */
  | (DecisionBase & { type: "orderCards"; reason: "deckBottom" | "deckTop"; cards: CardRef[]; source: CardId | null })
  /** Yes / no. */
  | (DecisionBase & { type: "confirm"; reason: ConfirmReason; source: CardId | null; subject?: CardRef });

export type Answer =
  | { type: "chooseTurnOrder"; goFirst: boolean }
  /**
   * CR 6.2.1.8. `bottomOrder` is the order (top to bottom) in which the hand is put on the
   * bottom of the deck; it must be a permutation of the hand. Omitted = current hand order.
   */
  | { type: "mulligan"; redraw: boolean; bottomOrder?: CardId[] }
  | { type: "mainPhase"; action: MainAction }
  | { type: "quick"; action: QuickAction }
  | { type: "selectPending"; id: string }
  | { type: "selectCards"; cards: CardId[] }
  | { type: "choose"; ids: string[] }
  | { type: "orderCards"; order: CardId[] }
  | { type: "confirm"; yes: boolean };

/** Everything that can advance a game: answers, plus conceding (CR 1.2.3, allowed any time). */
export type Input = Answer | { type: "concede"; player: PlayerId };
