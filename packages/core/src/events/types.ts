import type { CardType, DefId, PrintingId, TriggerIcon } from "../model/card";
import type { CardId, PlayerId } from "../model/ids";
import type { Keyword } from "../model/keyword";
import type { GameResult, GrantedAbilityId, ZoneName } from "../model/state";

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

/**
 * The card whose ability moved a card, as it was at that moment (BP21-043 "when this is discarded
 * by the ability of an Academic card you control"). Recorded for discards by effects and costs.
 */
export interface MoveCause {
  card: CardId;
  def: DefId;
  controller: PlayerId;
  type: CardType;
  traits: string[];
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
   * its controller, the counters it had (e.g. BP03-090 "if this card had a Fable counter"; the
   * moved card is a new card without them, CR 4.1.4) and every name it had in the zone it
   * left (e.g. BP03-075 "whenever a Ghost you control leaves the field", CR 10.7.4.1.2).
   * `abilitiesLost` is set when it had lost all abilities there (BP05-061: its Last Words don't
   * trigger). A card leaving the field records its keywords there (BP06-090 "a follower with
   * Ward is put from your field into the cemetery", including a given Ward — ruling), and the
   * abilities it had been given there (`grants`, e.g. BP07-038 "Last Words: Banish this follower").
   */
  before: {
    abilityDef: DefId;
    controller: PlayerId;
    counters: Record<string, number>;
    names: string[];
    keywords?: Keyword[];
    grants?: GrantedAbilityId[];
    abilitiesLost?: true;
    /**
     * A card leaving the field: its card type and traits there (e.g. BP11-002 "when a Mount card
     * you control leaves the field"; a maneuvered amulet is a follower, CR 5.32).
     */
    type?: CardType;
    traits?: string[];
    /**
     * It had "This follower doesn't deal damage" in force on the field: abilities triggered by
     * its leaving (e.g. Last Words) use that information (CR 10.7.4.1.2) and deal no damage
     * (BP12-109 ruling: BP10-T01's Last Words deal none).
     */
    noDamage?: true;
  } | null;
  /** The card whose ability moved it (discards, CR 5.12); absent for rules and the player's own actions. */
  cause?: MoveCause;
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
  /** CR 5.26 a player's turn was skipped (it did not begin). */
  | { type: "turnSkipped"; player: PlayerId }
  /** CR 14.2.3 — a card raced `times` times (each is a race for On Race, 14.2.4). */
  | { type: "raced"; card: CardId; player: PlayerId; times: number }
  /** CR 14.4.5 — a player performed a drive check for `follower` (CP03-039 "whenever a follower on your field performs a drive check"). */
  | { type: "driveChecked"; player: PlayerId; follower: CardId | null }
  /** CR 14.4.5.1.4 — a player resolved the Trigger of a card their drive check revealed ("when you drive check a Trigger"). */
  | { type: "driveTriggered"; player: PlayerId; card: CardId; trigger: TriggerIcon }
  /** CR 14.4.7.3 — a follower was given Drive (On Drive, 14.4.8). */
  | { type: "givenDrive"; card: CardId; player: PlayerId }
  /** CR 5.20 a player rolled a six-sided die. */
  | { type: "dieRolled"; player: PlayerId; result: number }
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
  /**
   * CR 12.18.4 — `card` (now in the EX area) underwent fusion by its Fuse ability; `fused` are the
   * cards fused in the process (12.18.4.1), now in the cemetery. E.g. BP19-048 "When this card is
   * fused by your Condemned follower's ability".
   */
  | {
      type: "cardsFused";
      player: PlayerId;
      card: CardId;
      fused: CardId[];
      /** The fused cards' definitions, in the same order: a fused token no longer exists (CR 9.1.4.4). */
      fusedDefs: DefId[];
    }
  /**
   * The card gained attack and/or defense: an effect gave it +X (CR 5.27), or a super-evolution
   * its +1/+1 (12.2.4.1). E.g. BP11-082 "Whenever this follower gains attack or defense".
   */
  | { type: "statsGained"; card: CardId; attack: number; defense: number }
  /**
   * CR 5.11 — `player` looked at these cards (nothing moved). Private to that player: a GUI or
   * network layer must not show it to the opponent.
   */
  | { type: "cardsLookedAt"; player: PlayerId; cards: { id: CardId; def: DefId }[] }
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
