import type { CardDatabase } from "../data/database";
import type { CardType, DefId, Universe } from "../model/card";
import type { CardId, PlayerId } from "../model/ids";
import { opponentOf } from "../model/ids";
import type { Keyword } from "../model/keyword";
import type { CardInstance, GameState, PlayerZone, ReturnedCard, ZoneName } from "../model/state";
import type { Env } from "./state/access";
import { leaderOf, usesThisTurn } from "./state/access";
import { activeScript, characteristics, currentStats, infoDefId, isBoxed, isFollowerOnField, namesOf, passiveSources, typeAndTraits, type Characteristics } from "./state/characteristics";
import { exAreaLimit, fieldLimit } from "./state/limits";
import { playVariants } from "./flow/play-card";
import { choosesAnyNumberOfOptions } from "./abilities/modes";
import { countsThisTurn } from "./state/turn-counts";
import { effectInForce } from "./state/effects";
import { carrotsToServe, canServe } from "./actions/race";
import { canRide, drivePointsToRide } from "./actions/drive";
import { isRacing, linkedCards } from "./state/links";
import { MAGICAL_ITEM } from "../data/universes";

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
  /**
   * Does this definition have an evolve ability (CR 12.2)? Read from its script: a text that only
   * mentions "{[evolve]}" (BP13-115 "a follower with {[evolve]}") doesn't have one.
   */
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
   * CR 5.24.1 — the card's original attack and defense: printed on the card whose information it
   * has (an evolved follower's evolve card, 5.16.1.2; the visible face, 2.14.3.1), e.g. BP19-107
   * "change its defense to its original value".
   */
  originalStats(id: CardId): { attack: number | null; defense: number | null };
  /**
   * Every name the card has (with "its name is also X" on the field). Like `typeAndTraits`, safe to
   * use in `FieldPassives.keywordsFor` (BP08-003_back).
   */
  namesOf(id: CardId): readonly string[];
  /** CR 4.8.3 — the current limit of the player's EX area (e.g. BP08-072's cost needs room). */
  exAreaLimit(player: PlayerId): number;
  /** CR 4.4.4 — the most cards the player's field can hold (effects may change it). */
  fieldLimit(player: PlayerId): number;
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
  /** Was the field card put onto the field by an ability, not by being played (BP21-023; summoned tokens too)? */
  enteredByAbility(id: CardId): boolean;
  /** The results of the dice the player rolled this turn, in order (CR 5.20; BP21-076, 081). */
  diceRolledThisTurn(player: PlayerId): readonly number[];
  /** Did this card gain defense this turn (an effect's +X or a super-evolution's +1, CR 12.2.4.1; BP21-096)? */
  gainedDefenseThisTurn(id: CardId): boolean;
  /** CR 6.1.1.5 — the universe the player's deck is based on (null: a class). */
  deckUniverse(player: PlayerId): Universe | null;
  /** CR 14.2.3.1 — "a racing follower": it raced and is still linked to a race-zone card. */
  isRacing(id: CardId): boolean;
  /** CR 14.2.3.1 — how many times this object has raced. */
  racedTimes(id: CardId): number;
  /** Facedown Carrot cards in the player's evolve deck, which serving uses (CR 14.2.1.1, 4.6.3). */
  carrotsToServe(player: PlayerId): CardId[];
  /** Can this card be served `times` times as a cost (CR 14.2.1.2.1)? */
  canServe(id: CardId, times: number): boolean;
  /** The race-zone / drive-zone / equipment cards linked to this card (CR 14.2.1.1, 14.4.9.2, 14.5.2.2). */
  linkedCards(id: CardId, zone: "raceZone" | "driveZone" | "equipmentZone"): CardId[];
  /** CR 14.3.1 — the cards named Magical Item in the player's EX area (what Lesson (X) banishes, 14.3.2.1). */
  magicalItemsInEx(player: PlayerId): CardId[];
  /** Cards named Magical Item banished from the player's EX area this turn (CP02-007). */
  magicalItemsBanishedThisTurn(player: PlayerId): number;
  /** CR 14.4.7.3.1 — has this follower been given Drive? */
  givenDrive(id: CardId): boolean;
  /** The play option a card on the field was played with and what its process recorded (CP03-084), or null. */
  playedWith(id: CardId): { option: string | null; memory: Readonly<Record<string, string | number | boolean | null>> } | null;
  /** Facedown Drive Point cards in the player's evolve deck, which a Ride uses (CR 14.4.9.2). */
  drivePointsToRide(player: PlayerId): CardId[];
  /** CR 14.4.9.2 — can this card pay the fixed part of a Ride cost? */
  canRide(id: CardId): boolean;
  /** Attacks this turn by the player's followers that had this trait when they attacked (CP03-005 "the 3rd time ..."). */
  attacksThisTurnWith(player: PlayerId, trait: string): number;
  /** Cards returned from this player's field to a hand this turn (BP03-005). */
  returnedToHandThisTurn(player: PlayerId): number;
  /** The cards returned from this player's field to a hand this turn, as they were on the field (BP10-009). */
  cardsReturnedToHandThisTurn(player: PlayerId): readonly ReturnedCard[];
  /** Definitions of the cards this player played this turn, in order (BP04-022). */
  cardsPlayedThisTurn(player: PlayerId): readonly DefId[];
  /** Times this player's leader lost defense this turn (BP05-069/081; each damage and "-X defense"). */
  leaderDefenseLostThisTurn(player: PlayerId): number;
  /** Stack counters the player removed by Earth Rite this turn (CR 13.3.3.2; BP14-037). */
  stackRemovedByEarthRiteThisTurn(player: PlayerId): number;
  /**
   * Did a follower on this player's field evolve this turn (CR 5.16; super-evolving too, 12.2.4)?
   * E.g. BP16-018 "If a follower on your field evolved this turn" (super-evolution counts — ruling).
   */
  followerEvolvedThisTurn(player: PlayerId): boolean;
  /** Cards that left this player's field this turn, as they were there (BP16-011, BP17-061). */
  cardsLeftFieldThisTurn(player: PlayerId): readonly ReturnedCard[];
  /**
   * Evolutions of followers on this player's field this turn (CR 5.16, super-evolving too, 12.2.4),
   * e.g. BP18-003 "If it's the 1st time a follower on your field has evolved this turn".
   */
  evolutionsThisTurn(player: PlayerId): number;
  /** Times this player's leader gained defense this turn (CR 5.27; BP18-111). */
  leaderDefenseGainedThisTurn(player: PlayerId): number;
  /** CR 3.3 — the player's turns passed, this turn included (BP19-116 "your 8th turn or later"). */
  turnsPassed(player: PlayerId): number;
  /** "For the rest of this turn, you may play cards from your banished zone" (BP18-T03). */
  canPlayFromBanished(player: PlayerId): boolean;
  /**
   * Did the follower `target` (the id it had on the field) take damage from the card `source` (the id it
   * has now) this turn (CR 5.14)? E.g. BP20-025 "an enemy follower that took damage this turn from this".
   */
  tookDamageThisTurnFrom(target: CardId, source: CardId): boolean;
  /** Did this follower (as it is now on the field) take damage this turn (CR 5.14; BP20-069)? */
  tookDamageThisTurn(target: CardId): boolean;
  /**
   * CR 5.18 — does this player choose 1 to all performable options whenever they would choose 1 or
   * more (BP20-T06)? For scripts that let a player choose options themselves.
   */
  choosesAnyNumberOfOptions(player: PlayerId): boolean;
  /**
   * Has this card gained the quoted text `text` its own script implements (EffectChange "gainedText",
   * BP18-081)? Safe in passives: it does not compute card information.
   */
  hasGainedText(id: CardId, text: string): boolean;
  /**
   * Can an ability banish this card (CR 1.3.3: not a card on the field that "can't be banished by
   * abilities", BP06-022)? A cost that banishes it can't be paid with it (BP18-040 ruling).
   */
  banishableByAbilities(id: CardId): boolean;
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
  /** CR 5.31 — is the card Boxed (BP11-024 "a Boxed enemy follower")? */
  isBoxed(id: CardId): boolean;
  /** Has the card gained attack or defense this turn (BP11-035; an effect's +X or a super-evolution)? */
  gainedStatsThisTurn(id: CardId): boolean;
  /** How often `key` was recorded for this card this turn (`fx.recordUse`, e.g. BP11-092's options). */
  usesThisTurn(id: CardId, key: string): number;
}

/**
 * One reader per context object: every method reads `env.state` when it is called, so a reader can
 * be reused for as long as its context lives. Building one creates dozens of closures, and the
 * engine asks for a reader on almost every rules check (it was ~40% of a random game's time).
 */
const readers = new WeakMap<Env, GameReader>();

export function makeReader(env: Env): GameReader {
  const cached = readers.get(env);
  if (cached) return cached;
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
    hasEvolveAbility: (def) => (env.scripts[def]?.abilities ?? []).some((a) => a.kind === "activated" && a.evolve === true),
    playedThisTurn: (p) => (ps(p).cardsPlayed.turn === state().turn ? ps(p).cardsPlayed.count : 0),
    combo: (p, x) => reader.playedThisTurn(p) >= x,
    spellsInCemetery: (p) => ps(p).zones.cemetery.filter((id) => env.db.get(state().cards[id]!.def).type === "spell").length,
    spellchainCount: (p) => {
      const withFollowers = passiveSources(env, p).some((id) => activeScript(env, id)?.field?.spellchainCountsRunecraftFollowers);
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
    originalStats: (id) => {
      const d = env.db.get(infoDefId(env, id));
      return { attack: d.attack, defense: d.defense };
    },
    namesOf: (id) => namesOf(env, id),
    exAreaLimit: (p) => exAreaLimit(env, p),
    fieldLimit: (p) => fieldLimit(env, p),
    followerAttacksThisTurn: (p) => countsThisTurn(state(), p).followerAttacks,
    enteredFieldThisTurn: (id) => state().cards[id]?.zone === "field" && state().cards[id]!.enteredFieldTurn === state().turn,
    faceUpEvolveDeck: (p) => ps(p).zones.evolveDeck.filter((id) => state().cards[id]!.faceUp),
    faceDownEvolveDeck: (p) => ps(p).zones.evolveDeck.filter((id) => !state().cards[id]!.faceUp),
    enteredFrom: (id) => state().cards[id]?.enteredFrom ?? null,
    enteredByAbility: (id) => state().cards[id]?.enteredByAbility === true,
    diceRolledThisTurn: (p) => countsThisTurn(state(), p).diceRolled,
    deckUniverse: (p) => ps(p).universe,
    isRacing: (id) => isRacing(env, id),
    racedTimes: (id) => state().cards[id]?.raced ?? 0,
    carrotsToServe: (p) => carrotsToServe(env, p),
    canServe: (id, times) => canServe(env, id, times),
    linkedCards: (id, zone) => linkedCards(env, id, zone),
    magicalItemsInEx: (p) => ps(p).zones.ex.filter((id) => env.db.get(state().cards[id]!.def).name === MAGICAL_ITEM),
    magicalItemsBanishedThisTurn: (p) => countsThisTurn(state(), p).magicalItemsBanished,
    givenDrive: (id) => state().cards[id]?.givenDrive === true,
    playedWith: (id) => state().cards[id]?.playedWith ?? null,
    drivePointsToRide: (p) => drivePointsToRide(env, p),
    canRide: (id) => canRide(env, id),
    attacksThisTurnWith: (p, trait) => countsThisTurn(state(), p).attackerTraits.filter((traits) => traits.includes(trait)).length,
    gainedDefenseThisTurn: (id) => {
      const c = state().cards[id];
      return c !== undefined && countsThisTurn(state(), c.controller).defenseGained.includes(id);
    },
    returnedToHandThisTurn: (p) => countsThisTurn(state(), p).returnedToHand,
    cardsReturnedToHandThisTurn: (p) => countsThisTurn(state(), p).returnedCards,
    cardsPlayedThisTurn: (p) => countsThisTurn(state(), p).played,
    leaderDefenseLostThisTurn: (p) => countsThisTurn(state(), p).leaderDefenseLost,
    stackRemovedByEarthRiteThisTurn: (p) => countsThisTurn(state(), p).stackRemovedByEarthRite,
    followerEvolvedThisTurn: (p) => countsThisTurn(state(), p).evolved > 0,
    cardsLeftFieldThisTurn: (p) => countsThisTurn(state(), p).leftField,
    evolutionsThisTurn: (p) => countsThisTurn(state(), p).evolved,
    leaderDefenseGainedThisTurn: (p) => countsThisTurn(state(), p).leaderDefenseGained,
    turnsPassed: (p) => ps(p).turnsPassed,
    canPlayFromBanished: (p) => countsThisTurn(state(), p).playFromBanished,
    tookDamageThisTurnFrom: (target, source) =>
      ([0, 1] as const).some((p) => countsThisTurn(state(), p).followersDamagedBy.some((x) => x.target === target && x.source === source)),
    tookDamageThisTurn: (target) => ([0, 1] as const).some((p) => countsThisTurn(state(), p).followersDamagedBy.some((x) => x.target === target)),
    choosesAnyNumberOfOptions: (p) => choosesAnyNumberOfOptions(env, p),
    banishableByAbilities: (id) => {
      const c = state().cards[id];
      return c !== undefined && !(c.zone === "field" && activeScript(env, id)?.cannotBeBanishedByAbilities === true);
    },
    hasGainedText: (id, text) =>
      state().effects.some((e) => e.target === id && e.change.kind === "gainedText" && e.change.text === text && effectInForce(state(), e)),
    playZone: (id) => {
      const c = state().cards[id];
      if (!c) return null;
      return c.zone === "resolution" ? c.playedFrom : c.zone;
    },
    canSelect: (id, p) => {
      const c = state().cards[id];
      return c !== undefined && !(c.zone === "field" && c.controller !== p && characteristics(env, id).keywords.includes("aura"));
    },
    isBoxed: (id) => isBoxed(state(), id),
    gainedStatsThisTurn: (id) => {
      const c = state().cards[id];
      return c !== undefined && countsThisTurn(state(), c.controller).statsGained.includes(id);
    },
    usesThisTurn: (id, key) => {
      const c = state().cards[id];
      return c === undefined ? 0 : usesThisTurn(state(), c, key);
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
  readers.set(env, reader);
  return reader;
}
