import type { DefId, PrintingId } from "./card";
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
   * Turn number in which an ability of this object was last used, keyed "<def>#<index>":
   * "once per turn" activated abilities (e.g. BP01-013) and automatic abilities (10.7.2.2).
   */
  abilityUses: Record<string, number>;
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
  /**
   * What happened in turn `turn`, for card conditions such as "if you discarded a card this
   * turn" (BP02-062/063), "if any of your followers have been destroyed this turn" (BP02-033)
   * and "if your followers attacked at least 3 times this turn" (BP02-098).
   */
  thisTurn: TurnCounts;
}

/** Per-turn counts of one player (valid only while `turn` is the current turn). */
export interface TurnCounts {
  turn: number;
  /** Cards this player discarded (CR 5.12). */
  discarded: number;
  /** This player's followers destroyed (CR 5.6, including rules handling 11.3). */
  followersDestroyed: number;
  /** Attacks by this player's followers (CR 8.4.5). */
  followerAttacks: number;
  /** Cards that left this player's field for a hand (e.g. BP03-005 "returned to hand this turn"). */
  returnedToHand: number;
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
  | { kind: "playCostSet"; value: number }
  /** "It cannot deal damage" (e.g. BP01-024) — its damage is replaced by no damage (5.14.2). */
  | { kind: "cannotDealDamage" }
  /**
   * "It doesn't take damage" / "doesn't take combat damage" (BP02-019, BP02-090): the damage
   * is replaced by no damage (5.14.2, 1.3.2.2). "combat" follows CR 5.14.3.2.
   */
  | { kind: "preventDamage"; damage: "all" | "combat" }
  /** Gain a trait (e.g. BP02-T07 "the Armed trait", CR 2.4). */
  | { kind: "trait"; trait: string }
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
  | { kind: "grantedAbility"; grant: GrantedAbilityId };

/** Abilities an effect can give a card. Each one is defined in engine/abilities/grants.ts. */
export type GrantedAbilityId = "destroyAtEnd" | "bottomAtEnd" | "strikeByAttack" | "followerStrike2";

/** Extra information a trigger attaches to its pending ability (e.g. the card that entered). */
export interface TriggerData {
  card?: CardId;
  player?: PlayerId;
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

export type LossReason = "leaderDefense" | "deckOut" | "concede" | "effect";

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
  /** CR 5.28 players who take another turn, most recent instruction last. */
  extraTurns: PlayerId[];
  /** CR 5.21 cards currently revealed to all players (cleared when the effect ends). */
  revealed: CardId[];
  attack: AttackState | null;
  fights: FightRecord[];
  result: GameResult | null;
  anchor: Anchor | null;
}
