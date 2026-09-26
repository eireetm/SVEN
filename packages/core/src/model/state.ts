import type { CardType, DefId, PrintingId } from "./card";
import type { GameConfig } from "./config";
import type { CardId, PlayerId } from "./ids";
import type { Keyword } from "./keyword";
import type { GameEvent } from "../events/types";
import type { RngState } from "../rng/rng";

/**
 * The complete game state. Plain JSON data only (no classes, Maps, functions or undefined
 * values) so it can be cloned, hashed, saved and sent over the network, and so that two
 * engines fed the same inputs produce byte-identical states.
 */

/** CR 4 zones owned by each player. */
export const PLAYER_ZONES = [
  "leader", // CR 4.3
  "deck", // CR 4.5 — index 0 is the top card
  "hand", // CR 4.7
  "field", // CR 4.4
  "ex", // CR 4.8
  "cemetery", // CR 4.9
  "banished", // CR 4.10
  "evolveDeck", // CR 4.6
  "evolveZone", // CR 4.12
] as const;
export type PlayerZone = (typeof PLAYER_ZONES)[number];

/** All zones a card can be in. The resolution zone (CR 4.11) is shared by both players. */
export type ZoneName = PlayerZone | "resolution";

export interface CardInstance {
  id: CardId;
  /** Physical printing (art). Game logic uses `def`. */
  printing: PrintingId;
  def: DefId;
  /** CR 3.1.1 */
  owner: PlayerId;
  /** CR 3.1.2 — the player whose zone the card is in. */
  controller: PlayerId;
  zone: ZoneName;
  /** CR 4.2.2 engaged (true) / reserved (false). */
  engaged: boolean;
  /** CR 4.2.3 faceup / facedown. */
  faceUp: boolean;
  /**
   * CR 2.14.3 — a double-faced card placed with its back face visible (the evolve zone, e.g. an
   * evolve ability that reveals the back face, 4.6.4). Always false for other cards and in the
   * other zones, where a double-faced card has its front face's information (2.14.2.1).
   */
  backFace: boolean;
  /** Timestamp of entering the current zone (CR 10.9.1.6.1 ordering). */
  zoneSeq: number;
  /** Damage marked on the card; its defense is reduced by this amount (CR 2.8.2, 5.14.1). */
  damage: number;
  /** Turn number when the card was put onto the field it is on (CR 8.4.2.1). */
  enteredFieldTurn: number | null;
  /** Turn number of the most recent evolution (CR 8.4.2.1 "it evolved that turn"). */
  evolvedTurn: number | null;
  /** Evolve-zone card linked to this field card (CR 5.16.1). */
  evolvedWith: CardId | null;
  /** CR 12.2.4.2 */
  superEvolved: boolean;
  /** CR 15.1 counters by name, e.g. { stack: 1 } (13.3.2), { spell: 2 }. Removed on zone change. */
  counters: Record<string, number>;
  /**
   * How often an ability of this object was used in turn `turn`, keyed "<def>#<index>": "once per
   * turn" activated abilities (e.g. BP01-013) and automatic abilities that become pending a
   * limited number of times per turn (CR 10.7.2.2, e.g. BP07-036 "4 times per turn").
   */
  abilityUses: Record<string, { turn: number; count: number }>;
  /**
   * While this object is in the resolution zone: the zone it was played from (CR 5.5.3).
   * Null when it was not played there.
   */
  playedFrom: ZoneName | null;
  /**
   * While this object is on the field: the zone it was put onto the field from. A card played
   * from hand or the EX area records that zone, not the resolution zone (CR 5.5.3). Null when
   * the card was not newly put onto the field (CR 5.22 steal keeps its previous state).
   */
  enteredFrom: ZoneName | null;
  /**
   * Put onto the field it is on by an ability, not by being played (CR 5.5; e.g. BP21-023 "Activate only if this
   * was put onto the field by an ability"). Summoned tokens too.
   */
  enteredByAbility?: boolean;
}

export interface PlayerState {
  id: PlayerId;
  /** CR 2.8.3 — leaders have defense (not printed on the card). */
  leaderDefense: number;
  /** CR 3.2 */
  playPoints: number;
  maxPlayPoints: number;
  evolutionPoints: number;
  superEvolutionPoints: number;
  /** CR 3.3 */
  turnsPassed: number;
  zones: Record<PlayerZone, CardId[]>;
  /** Turn in which this player last played an evolve (or equivalent) ability (CR 8.3.2.1). */
  evolveAbilityTurn: number | null;
  /** Set when the player had to draw from an empty deck (CR 5.10.1.1, checked by 11.2.2). */
  drewFromEmptyDeck: boolean;
  /** Cards played in turn `turn` (CR 13.2.1 Combo counts cards played this turn). */
  cardsPlayed: { turn: number; count: number };
  /** Last turn in which this player's leader lost defense (CR 13.5.2 Sanguine). */
  leaderDefenseLostTurn: number | null;
  /** CR 5.26.2 — this player's next turn will be skipped (BP05-086). Several instructions skip it once (5.26.2.1). */
  skipNextTurn: boolean;
  /**
   * What happened in turn `turn`, for card conditions such as "if you discarded a card this
   * turn" (BP02-062/063), "if any of your followers have been destroyed this turn" (BP02-033)
   * and "if your followers attacked at least 3 times this turn" (BP02-098).
   */
  thisTurn: TurnCounts;
}

/** Per-turn counts of one player (valid only while `turn` is the current turn). */
/** A card that went from a field to a hand, as it was on the field (TurnCounts.returnedCards). */
export interface ReturnedCard {
  names: string[];
  type: CardType;
  traits: string[];
}

export interface TurnCounts {
  turn: number;
  /**
   * This player's followers that took damage (more than 0) this turn, with the card that dealt it (its
   * id then; CR 5.14), e.g. BP20-025 "an enemy follower that took damage this turn from this", BP20-069.
   */
  followersDamagedBy: { source: CardId | null; target: CardId }[];
  /** Cards this player discarded (CR 5.12). */
  discarded: number;
  /** This player's followers destroyed (CR 5.6, including rules handling 11.3). */
  followersDestroyed: number;
  /**
   * Followers put from this player's field into the cemetery, however (destroyed, buried, as a
   * cost), tokens too; not a follower changed into an amulet (BP07-005 rulings).
   */
  followersToCemetery: number;
  /** Attacks by this player's followers (CR 8.4.5). */
  followerAttacks: number;
  /** Cards that left this player's field for a hand (e.g. BP03-005 "returned to hand this turn"). */
  returnedToHand: number;
  /**
   * What those cards were on the field (look-back, CR 10.7.4.1), e.g. BP10-009 "if a Beast
   * follower not named Salvia Panther was returned to hand from your field this turn".
   */
  returnedCards: ReturnedCard[];
  /** Definitions of the cards this player played (CR 10.6.2.7), in order (e.g. BP04-022 "the 1st Commander card"). */
  played: DefId[];
  /**
   * Times this player's leader lost defense: each damage and each "-X defense" (BP05-069/081
   * "the number of times your leader has lost defense this turn", rulings; CR 5.27.1).
   */
  leaderDefenseLost: number;
  /**
   * Stack counters this player removed from cards on their field with Stack by Earth Rite (CR
   * 13.3.3.2), e.g. BP14-037 "if you've used Earth Rite to remove at least 2 Stack counters this
   * turn" (two Earth Rites of 1, or one of 2, both count — rulings).
   */
  stackRemovedByEarthRite: number;
  /**
   * This player's cards that gained attack or defense this turn (an effect giving +X, or the +1/+1
   * of a super-evolution, CR 12.2.4.1), e.g. BP11-035 "if this follower has gained attack or
   * defense this turn" (ruling: also after it took damage).
   */
  statsGained: CardId[];
  /** Those of them that gained defense (BP21-096 "Activate only if this gained defense this turn"). */
  defenseGained: CardId[];
  /**
   * Evolutions of followers on this player's field this turn (CR 5.16; super-evolving is evolving,
   * 12.2.4; by an effect too), e.g. BP16-018 "If a follower on your field evolved this turn" (it
   * counts after the follower has left the field).
   */
  evolved: number;
  /**
   * Cards that left this player's field this turn, as they were there (look-back, CR 10.7.4.1),
   * e.g. BP16-011 "unless a follower you control has left the field this turn", BP17-061 "the number
   * of cards named Naterran Great Tree that left your field this turn". A change of control is not
   * leaving the field.
   */
  leftField: ReturnedCard[];
  /** Times this player's leader gained defense (CR 5.27, e.g. BP18-111 "if your leader has gained defense this turn"). */
  leaderDefenseGained: number;
  /**
   * "For the rest of this turn, you may play cards from your banished zone" (BP18-T03): a card effect
   * allowing what CR 8.2.1 does not (CR 1.3.1).
   */
  playFromBanished: boolean;
  /**
   * The results of the six-sided dice this player rolled this turn, in order (CR 5.20), e.g. BP21-076 "if you rolled a
   * 6-sided die this turn", BP21-081 "if you rolled a 6 when rolling a die this turn".
   */
  diceRolled: number[];
}

/** A persistent effect (CR 10.2.1.2) applied to one card object. */
export interface PersistentEffect {
  id: string;
  /** Creation timestamp; application order (CR 10.9.1.6). */
  seq: number;
  target: CardId;
  source: CardId | null;
  controller: PlayerId;
  /** When the effect ends; null = no end (it still ends when the card changes zones, 10.9.2). */
  until: EffectDuration;
  /** Turn in which the effect was created. */
  createdTurn: number;
  change: EffectChange;
}

/**
 * - "endOfTurn": "for the rest of this turn", removed in CR 7.4.8;
 * - "endOfOpponentsNextTurn": "for the rest of this turn and during each opponent's next turn"
 *   (BP02-090): applies in the creation turn and in the next turn of the controller's opponent,
 *   removed at the end of that turn.
 */
export type EffectDuration = "endOfTurn" | "endOfOpponentsNextTurn" | null;

export type EffectChange =
  /** CR 5.27 give +/-X attack and defense (numeric change, CR 10.9.1.4). */
  | { kind: "stats"; attack: number; defense: number }
  /** Gain a keyword ability (CR 10.9.1.2). */
  | { kind: "keyword"; keyword: Keyword }
  /**
   * Change of the play-point cost when this card is played (CR 10.4.4.1: the card's cost
   * information itself does not change). Negative = cheaper.
   */
  | { kind: "playCost"; amount: number }
  /**
   * "It costs N to play" (CR 10.4.4.1, 10.10.2.4: set-to-value changes apply first), e.g.
   * BP02-091 "Those cards cost 0 play points to play".
   */
  | {
      kind: "playCostSet";
      value: number;
      /**
       * Cards given the same group share one use: when one of them is played, the others lose it
       * (BP14-046 "the next card you play that was put into your EX area this way costs 0").
       */
      group?: string;
    }
  /** "It cannot deal damage" (e.g. BP01-024) — its damage is replaced by no damage (5.14.2). */
  | { kind: "cannotDealDamage" }
  /**
   * "It doesn't take damage" / "doesn't take combat damage" (BP02-019, BP02-090): the damage
   * is replaced by no damage (5.14.2, 1.3.2.2). "combat" follows CR 5.14.3.2.
   */
  | { kind: "preventDamage"; damage: "all" | "combat" | "ability" }
  /** Gain a trait (e.g. BP02-T07 "the Armed trait", CR 2.4). */
  | { kind: "trait"; trait: string }
  /**
   * CR 5.25 "Change it into [card type]" (BP05-001): it loses its other card types. Information
   * the new type doesn't have is not referenced (5.25.2.1: a non-follower has no attack or
   * defense); its abilities stay (5.25.3).
   */
  | { kind: "changeType"; type: CardType }
  /**
   * "It loses all abilities" (BP05-061): the abilities it has when this effect is created,
   * printed or given. Abilities given later still work (BP05-061 ruling; cf. CR 5.31.2.1).
   */
  | { kind: "loseAbilities" }
  /** "Change this card's Evolve cost to N" (BP05-048/052): the play points of its evolve abilities. */
  | { kind: "evolveCostSet"; value: number }
  /**
   * "This card's Evolve costs 1 less this turn" (BP07-086): a change to the play points of its
   * evolve abilities; several add up, and the cost never goes below 0 (its rulings).
   */
  | { kind: "evolveCost"; amount: number }
  /**
   * "The next time [it] would take damage this turn, it doesn't take damage" (BP05-017): prevents
   * one instance of damage (CR 5.14.2), then the effect ends. Damage of 0 or less is not dealt,
   * so it does not use it up (ruling).
   */
  | { kind: "preventNextDamage" }
  /**
   * "The next time [it] would take damage this turn, it takes that much -N instead" (BP20-103): used up by the
   * next damage it changes; several apply together, and one that finds the damage already at 0 stays (ruling).
   */
  | { kind: "reduceNextDamage"; amount: number }
  /** "If [it] would take more than N damage, it takes N instead" (BP05-101): each instance (ruling). */
  | { kind: "damageCap"; max: number }
  /**
   * "If [it] would take damage, it takes that much minus N instead" (BP14-T07, on a leader): a
   * replacement of each instance (CR 5.14.2); several add up (ruling).
   */
  | { kind: "damageReduction"; amount: number }
  /**
   * "If this would deal damage, it deals that much plus N instead" (BP17-T06; two of them are +2 —
   * ruling). A replacement effect on the damage this card deals (CR 5.14.2).
   */
  | { kind: "damageDealtPlus"; amount: number }
  /**
   * "It doesn't refresh during its controller's next start phase" (BP06-056): skipped in the
   * next start phase of its controller after this turn (CR 7.2.3), then the effect ends. It
   * applies even if the card is already engaged (ruling).
   */
  | { kind: "skipNextRefresh" }
  /** "Its Fanfare abilities can't be performed" (BP04-038/039): its pending Fanfares are not played. */
  | { kind: "noFanfare" }
  /**
   * CR 5.32 "Maneuver" (BP11-T01/T02): for the rest of the turn the amulet is a follower with the
   * attack and defense printed on it (5.32.1). Numbers changed before it doesn't carry over: a
   * second maneuver starts again from the printed values (rulings); abilities it was given stay.
   */
  | { kind: "maneuver" }
  /**
   * CR 5.31 "Boxed" (BP11-018): it loses the abilities it had (5.31.2; abilities given later work,
   * 5.31.2.1) and doesn't refresh during its controller's start phase (5.31.3; effects can still
   * refresh it, 5.31.3.1).
   */
  | { kind: "boxed" }
  /** "It can't attack enemies" (CR 8.4.3.2.1), e.g. BP03-013 for the controller's next turn. */
  | { kind: "cannotAttack" }
  /**
   * "This card's activated abilities can't be activated" for the duration (BP03-039/040).
   * `exceptEvolve` keeps evolve abilities playable (the unevolved Mystic King).
   */
  | { kind: "cantActivate"; exceptEvolve: boolean }
  /**
   * An ability given to this card by an effect (CR 10.9.1.2). The id is resolved by
   * `engine/abilities/grants.ts`. Ends when the card changes zones (CR 10.9.2) unless `until` says sooner.
   * (Abilities a card on the field gives while it is there use `FieldPassives.grantsFor`.)
   */
  | { kind: "grantedAbility"; grant: GrantedAbilityId }
  /**
   * The card gained a quoted text that its own script implements and checks with
   * `GameReader.hasGainedText` (BP18-081 On Super-Evolve: give this "Each Forest Bat on your field has
   * Storm and Bane."). Like other gained abilities it ends when the card changes zones (CR 10.9.2),
   * and its script's passives are inactive while it has lost its abilities.
   */
  | { kind: "gainedText"; text: string };

/** Abilities an effect can give a card. Each one is defined in engine/abilities/grants.ts. */
export type GrantedAbilityId =
  | "destroyAtEnd"
  | "bottomAtEnd"
  | "strikeByAttack"
  | "followerStrike2"
  | "activateBury2"
  | "strikeRefreshOnce"
  | "lastWordsBanishSelf"
  | "returnToHandAtEnd"
  | "strikePlus2"
  | "activateEngageDamage3"
  | "lastWordsLeaderDraw"
  | "strikeDamageLeaders2"
  | "strikeLeaderLossDamage"
  | "machinaPlayPing"
  | "buryAtEnd";

/** Extra information a trigger attaches to its pending ability (e.g. the card that entered). */
export interface TriggerData {
  card?: CardId;
  player?: PlayerId;
  /** A number the trigger records, e.g. which evolution of the turn it was (BP18-003). */
  count?: number;
}

/** CR 10.7.2 — an automatic ability waiting to be played in Confirmation Timing. */
export interface PendingAbility {
  id: string;
  seq: number;
  controller: PlayerId;
  /** The card object that had the ability when it triggered (it may have moved since). */
  source: CardId;
  /** Definition that provided the ability (the evolved card's definition when evolved). */
  sourceDef: DefId;
  /** Index into that definition's abilities (see engine/abilities/registry.ts). */
  ability: number;
  /** The event that satisfied the trigger condition. */
  event: GameEvent;
  data: TriggerData | null;
}

/** CR 10.7.5 — a delayed trigger created by an effect; triggers once (10.7.5.1). */
export interface DelayedTrigger {
  id: string;
  seq: number;
  controller: PlayerId;
  /** The card whose effect created it (it may be gone). */
  source: CardId | null;
  sourceDef: DefId;
  /** Index of the automatic ability (marked `delayed`) in the source definition's script. */
  ability: number;
  createdTurn: number;
  /**
   * "... this turn" (e.g. BP03-089 "the next time ... this turn"): the trigger is removed at
   * the end of the turn if it has not triggered (CR 7.4.8). Null = until it triggers.
   */
  until: "endOfTurn" | null;
  /**
   * What it watches, given to its trigger as `TriggerSubject.delayedData`, e.g. BP15-001 "When it's
   * put from the field into the cemetery this turn" (the selected follower).
   */
  data?: TriggerData;
  /**
   * CR 10.7.5.1 "unless a time frame is specified": "For the rest of this turn, whenever ..."
   * (BP17-T07) triggers every time until it ends, instead of once.
   */
  repeat?: true;
}

/**
 * "The next [matching] card you play this turn costs N less" (BP03-038). Which cards match
 * is defined by the creating card's script (`CardScript.nextPlay[key]`), so the state stays
 * plain JSON. It changes the play cost of every matching card of the player; playing one
 * uses it up, even a card played by an effect (BP03-038 ruling). It ends with the turn
 * (CR 7.4.8).
 */
export interface NextPlayModifier {
  id: string;
  seq: number;
  player: PlayerId;
  sourceDef: DefId;
  key: string;
  /** Change to the play cost (negative = cheaper), applied after set-to-value changes (BP03-038 ruling). */
  costDelta: number;
  createdTurn: number;
}

/**
 * A restriction on what a player may do in their next turn (BP05-006 Morton the Manipulator):
 *  - "noStartPhaseDraw": they can't draw a card during their next start phase (CR 7.2.4);
 *  - "noStartPhaseMaxPlayPoints": they can't increase their maximum play points by 1 during
 *    their next start phase (CR 7.2.1);
 *  - "cantPlayFollowers": they can't play followers during their next main phase, not even by
 *    an effect that plays one (BP05-006 ruling). Putting followers onto the field is not playing;
 *  - "playCostPlus1": any card they play during their next turn costs 1 more, also one played by
 *    an effect; several add up (BP15-058 rulings).
 * It applies in the player's first turn after the turn it was created in and ends with that turn.
 * A prohibition takes precedence over an instruction (CR 1.3.3).
 */
export interface PlayerRestriction {
  id: string;
  seq: number;
  player: PlayerId;
  kind: "noStartPhaseDraw" | "noStartPhaseMaxPlayPoints" | "cantPlayFollowers" | "playCostPlus1";
  createdTurn: number;
}

/** The attack in progress (CR 8.4). */
export interface AttackState {
  attacker: CardId;
  target: CardId;
  targetIsLeader: boolean;
}

/** CR 8.4.9.2 — a fight since the last rules handling, with Bane captured at fight time. */
export interface FightRecord {
  a: CardId;
  b: CardId;
  aHasBane: boolean;
  bHasBane: boolean;
}

export type Phase = "setup" | "start" | "main" | "end" | "over";

/**
 * Why a player lost. "perpetualCycle": a cycle neither player could stop ended the game in a draw
 * (CR 15.2.1.3); both players are listed, so the winner is null (1.2.2).
 */
export type LossReason = "leaderDefense" | "deckOut" | "concede" | "effect" | "perpetualCycle";

export interface GameResult {
  /** null = draw (CR 1.2.2). */
  winner: PlayerId | null;
  losses: { player: PlayerId; reason: LossReason }[];
}

/**
 * Resumable flow positions. The engine checkpoints the state whenever the flow reaches an
 * anchor; restoring a game replays inputs from the last checkpoint (see docs/architecture.md).
 */
export type Anchor = { kind: "setup" } | { kind: "mainPhase" };

export interface GameState {
  schema: 1;
  config: GameConfig;
  rng: RngState;
  /** Monotonic counter for card ids and timestamps. */
  seq: number;
  /** Global turn counter, 1 for the first turn of the game. */
  turn: number;
  activePlayer: PlayerId;
  firstPlayer: PlayerId | null;
  phase: Phase;
  players: [PlayerState, PlayerState];
  cards: Record<CardId, CardInstance>;
  /** CR 4.11 shared resolution zone, bottom first. */
  resolution: CardId[];
  effects: PersistentEffect[];
  pending: PendingAbility[];
  /** CR 10.7.5 delayed triggers waiting for their event. */
  delayed: DelayedTrigger[];
  /** "The next [matching] card you play this turn costs N less" effects in force. */
  nextPlay: NextPlayModifier[];
  /** Restrictions on players' next turns (BP05-006). */
  restrictions: PlayerRestriction[];
  /** CR 5.28 players who take another turn, most recent instruction last. */
  extraTurns: PlayerId[];
  /** CR 5.21 cards currently revealed to all players (cleared when the effect ends). */
  revealed: CardId[];
  attack: AttackState | null;
  fights: FightRecord[];
  result: GameResult | null;
  anchor: Anchor | null;
}
