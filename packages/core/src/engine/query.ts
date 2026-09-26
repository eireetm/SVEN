import type { CardDatabase } from "../data/database";
import type { CardType, DefId } from "../model/card";
import type { CardId, PlayerId } from "../model/ids";
import { opponentOf } from "../model/ids";
import type { Keyword } from "../model/keyword";
import type { CardInstance, GameState, PlayerZone, ReturnedCard, ZoneName } from "../model/state";
import type { Env } from "./state/access";
import { leaderOf } from "./state/access";
import { activeScript, characteristics, currentStats, isFollowerOnField, namesOf, typeAndTraits, type Characteristics } from "./state/characteristics";
import { exAreaLimit } from "./state/limits";
import { playVariants } from "./flow/play-card";
import { countsThisTurn } from "./state/turn-counts";

/**
 * Read-only access to a game for card scripts, bots and views. Scripts must go through this
 * (or EffectContext) instead of touching GameState internals, so internal representation
 * can change without rewriting card scripts.
 */
export interface GameReader {
  readonly state: Readonly<GameState>;
  readonly db: CardDatabase;
  readonly activePlayer: PlayerId;
  card(id: CardId): Readonly<CardInstance> | undefined;
  /** Current information of a card object (CR 10.9). */
  info(id: CardId): Characteristics;
  hasKeyword(id: CardId, keyword: Keyword): boolean;
  controller(id: CardId): PlayerId;
  /** Card ids in one of a player's zones (a copy). */
  cards(player: PlayerId, zone: PlayerZone): CardId[];
  /** Followers on a player's field (CR 4.4). */
  followers(player: PlayerId): CardId[];
  leader(player: PlayerId): CardId;
  opponent(player: PlayerId): PlayerId;
  /** CR 15.1 */
  counters(id: CardId, counter: string): number;
  /** Does this definition have an evolve ability (printed "{[evolve]}")? */
  hasEvolveAbility(def: DefId): boolean;
  /** CR 13.2.1 — cards the player has played this turn. */
  playedThisTurn(player: PlayerId): number;
  /** CR 13.2.1.2 — Combo (X) ("including this card" — call it after this card was played). */
  combo(player: PlayerId, x: number): boolean;
  /** Spells in the player's cemetery (e.g. BP01-057 "banish 10 spells in your cemetery"). */
  spellsInCemetery(player: PlayerId): number;
  /**
   * CR 13.3.1.1 — the player's Spellchain count: spells in their cemetery, plus Runecraft
   * followers while a card like BP02-035 says to include them.
   */
  spellchainCount(player: PlayerId): number;
  /** CR 13.3.1.2 — Spellchain (X). */
  spellchain(player: PlayerId, x: number): boolean;
  /** CR 13.5.1.2 — Necrocharge (X): at least X cards in the cemetery. */
  necrocharge(player: PlayerId, x: number): boolean;
  /** CR 13.4.1.2 — Overflow: maximum play points at least 7. */
  overflow(player: PlayerId): boolean;
  /** CR 13.5.2.2 — Sanguine: it is this player's turn and their leader lost defense this turn. */
  sanguine(player: PlayerId): boolean;
  /** Amulets with Stack on the player's field (CR 13.3.2). */
  stackCards(player: PlayerId): CardId[];
  /** Could `player` play `card` right now as part of an effect (optionally for a set cost)? */
  canPlay(card: CardId, player: PlayerId, opts?: { cost?: number }): boolean;
  /** "If you discarded a card this turn" (CR 5.12). */
  discardedThisTurn(player: PlayerId): number;
  /** "If any of your followers have been destroyed this turn" (CR 5.6, 11.3). */
  followersDestroyedThisTurn(player: PlayerId): number;
  /** "If a follower was put from your field into the cemetery this turn" (BP07-005; tokens too). */
  followersToCemeteryThisTurn(player: PlayerId): number;
  /**
   * A card's current type and traits only. Unlike `info`, safe to use in
   * `FieldPassives.keywordsFor` (e.g. BP07-080).
   */
  typeAndTraits(id: CardId): { type: CardType; traits: readonly string[] };
  /**
   * A card's current attack and defense only. Like `typeAndTraits`, safe to use in
   * `FieldPassives.keywordsFor` (e.g. BP09-003 "While this follower's attack is at least 4").
   */
  statsOf(id: CardId): { attack: number | null; defense: number | null };
  /**
   * Every name the card has (with "its name is also X" on the field). Like `typeAndTraits`, safe to
   * use in `FieldPassives.keywordsFor` (BP08-003_back).
   */
  namesOf(id: CardId): readonly string[];
  /** CR 4.8.3 — the current limit of the player's EX area (e.g. BP08-072's cost needs room). */
  exAreaLimit(player: PlayerId): number;
  /** "If your followers attacked at least N times this turn" (CR 8.4.5). */
  followerAttacksThisTurn(player: PlayerId): number;
  /** Was the card put onto the field it is on during this turn? (CR 8.4.2.1) */
  enteredFieldThisTurn(id: CardId): boolean;
  /** CR 4.6.3 — faceup cards in the player's evolve deck area. */
  faceUpEvolveDeck(player: PlayerId): CardId[];
  /** CR 4.6.3 - facedown cards in the player's evolve deck area. */
  faceDownEvolveDeck(player: PlayerId): CardId[];
  /** Zone a field card was put onto the field from (CR 5.5.3). Null when it was not newly put there. */
  enteredFrom(id: CardId): ZoneName | null;
  /** Cards returned from this player's field to a hand this turn (BP03-005). */
  returnedToHandThisTurn(player: PlayerId): number;
  /** The cards returned from this player's field to a hand this turn, as they were on the field (BP10-009). */
  cardsReturnedToHandThisTurn(player: PlayerId): readonly ReturnedCard[];
  /** Definitions of the cards this player played this turn, in order (BP04-022). */
  cardsPlayedThisTurn(player: PlayerId): readonly DefId[];
  /** Times this player's leader lost defense this turn (BP05-069/081; each damage and "-X defense"). */
  leaderDefenseLostThisTurn(player: PlayerId): number;
  /**
   * The zone a card is being played from: its zone, or the zone it was played from once it is in
   * the resolution zone (CR 5.5.3), e.g. for "costs 3 less to play from the EX area" (BP05-106),
   * which applies while the cost is determined (CR 10.6.2.5).
   */
  playZone(id: CardId): ZoneName | null;
  /**
   * CR 12.15.2 — can `player`'s cards and abilities select this card? Aura protects a card only
   * on the field and only from its opponent (BP01-111 / BP01-156 rulings).
   */
  canSelect(id: CardId, player: PlayerId): boolean;
  /** The card's script has an Earth Rite cost (CR 13.3.3), so a search for "a card with Earth Rite" finds it. */
  hasEarthRite(id: CardId): boolean;
}

export function makeReader(env: Env): GameReader {
  const state = () => env.state;
  const ps = (p: PlayerId) => env.state.players[p];
  const reader: GameReader = {
    get state() {
      return env.state;
    },
    db: env.db,
    get activePlayer() {
      return env.state.activePlayer;
    },
    card: (id) => state().cards[id],
    info: (id) => characteristics(env, id),
    hasKeyword: (id, k) => characteristics(env, id).keywords.includes(k),
    controller: (id) => state().cards[id]!.controller,
    cards: (p, zone) => [...ps(p).zones[zone]],
    followers: (p) => ps(p).zones.field.filter((id) => isFollowerOnField(env, id)),
    leader: (p) => leaderOf(state(), p),
    opponent: opponentOf,
    counters: (id, counter) => state().cards[id]?.counters[counter] ?? 0,
    hasEvolveAbility: (def) => env.db.get(def).text.en.includes("{[evolve]}"),
    playedThisTurn: (p) => (ps(p).cardsPlayed.turn === state().turn ? ps(p).cardsPlayed.count : 0),
    combo: (p, x) => reader.playedThisTurn(p) >= x,
    spellsInCemetery: (p) => ps(p).zones.cemetery.filter((id) => env.db.get(state().cards[id]!.def).type === "spell").length,
    spellchainCount: (p) => {
      const withFollowers = ps(p).zones.field.some((id) => activeScript(env, id)?.field?.spellchainCountsRunecraftFollowers);
      return ps(p).zones.cemetery.filter((id) => {
        const d = env.db.get(state().cards[id]!.def);
        return d.type === "spell" || (withFollowers && d.type === "follower" && d.class === "Runecraft");
      }).length;
    },
    spellchain: (p, x) => reader.spellchainCount(p) >= x,
    necrocharge: (p, x) => ps(p).zones.cemetery.length >= x,
    overflow: (p) => ps(p).maxPlayPoints >= 7,
    sanguine: (p) => state().activePlayer === p && ps(p).leaderDefenseLostTurn === state().turn,
    stackCards: (p) =>
      ps(p).zones.field.filter((id) => {
        const i = characteristics(env, id);
        return i.type === "amulet" && i.keywords.includes("stack");
      }),
    canPlay: (card, p, opts = {}) => playVariants(env, p, card, "effect", { setCost: opts.cost }).length > 0,
    discardedThisTurn: (p) => countsThisTurn(state(), p).discarded,
    followersDestroyedThisTurn: (p) => countsThisTurn(state(), p).followersDestroyed,
    followersToCemeteryThisTurn: (p) => countsThisTurn(state(), p).followersToCemetery,
    typeAndTraits: (id) => typeAndTraits(env, id),
    statsOf: (id) => currentStats(env, id),
    namesOf: (id) => namesOf(env, id),
    exAreaLimit: (p) => exAreaLimit(env, p),
    followerAttacksThisTurn: (p) => countsThisTurn(state(), p).followerAttacks,
    enteredFieldThisTurn: (id) => state().cards[id]?.zone === "field" && state().cards[id]!.enteredFieldTurn === state().turn,
    faceUpEvolveDeck: (p) => ps(p).zones.evolveDeck.filter((id) => state().cards[id]!.faceUp),
    faceDownEvolveDeck: (p) => ps(p).zones.evolveDeck.filter((id) => !state().cards[id]!.faceUp),
    enteredFrom: (id) => state().cards[id]?.enteredFrom ?? null,
    returnedToHandThisTurn: (p) => countsThisTurn(state(), p).returnedToHand,
    cardsReturnedToHandThisTurn: (p) => countsThisTurn(state(), p).returnedCards,
    cardsPlayedThisTurn: (p) => countsThisTurn(state(), p).played,
    leaderDefenseLostThisTurn: (p) => countsThisTurn(state(), p).leaderDefenseLost,
    playZone: (id) => {
      const c = state().cards[id];
      if (!c) return null;
      return c.zone === "resolution" ? c.playedFrom : c.zone;
    },
    canSelect: (id, p) => {
      const c = state().cards[id];
      return c !== undefined && !(c.zone === "field" && c.controller !== p && characteristics(env, id).keywords.includes("aura"));
    },
    hasEarthRite: (id) => {
      const def = state().cards[id]?.def;
      if (def === undefined) return false;
      const abilities = env.scripts[def]?.abilities ?? [];
      return abilities.some(
        (a) =>
          ("earthRite" in a && a.earthRite !== undefined) ||
          ("modes" in a && a.modes?.some((m) => m.earthRite)),
      );
    },
  };
  return reader;
}
