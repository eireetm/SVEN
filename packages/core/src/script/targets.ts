import type { CardType } from "../model/card";
import type { CardId, PlayerId } from "../model/ids";
import type { PlayerZone } from "../model/state";
import type { GameReader } from "../engine/query";
import type { TargetSpec } from "./types";

/**
 * Reusable target specifications ("Select ..." in card text, CR 10.6.2.3).
 * `filter` receives the reader and a candidate; defaults: exactly `count` targets.
 */
type Filter = (game: GameReader, card: CardId) => boolean;
interface Opts {
  count?: number;
  upTo?: boolean;
  filter?: Filter;
  when?: TargetSpec["when"];
  max?: TargetSpec["max"];
  distinct?: boolean;
  distinctNames?: boolean;
}

function spec(candidates: (g: GameReader, controller: PlayerId, self: CardId) => CardId[], o: Opts): TargetSpec {
  const t: TargetSpec = {
    count: o.count ?? 1,
    upTo: o.upTo ?? false,
    candidates: (g, c, self) => candidates(g, c, self).filter((id) => o.filter?.(g, id) ?? true),
  };
  if (o.when) t.when = o.when;
  if (o.max) t.max = o.max;
  if (o.distinct) t.distinct = true;
  if (o.distinctNames) t.distinctNames = true;
  return t;
}

const ofType = (g: GameReader, id: CardId, type: CardType) => g.info(id).type === type;

/** `count` of "select any number of ..." (好きな枚数, e.g. BP04-001), always with `upTo: true`. */
export const ANY = Number.POSITIVE_INFINITY;

/** "an enemy follower on the field" */
export const enemyFollower = (o: Opts = {}) => spec((g, c) => g.followers(g.opponent(c)), o);

/** "an enemy leader or enemy follower on the field" */
export const enemyLeaderOrFollower = (o: Opts = {}) =>
  spec((g, c) => [...g.followers(g.opponent(c)), g.leader(g.opponent(c))], o);

/** "an enemy leader" */
export const enemyLeader = (o: Opts = {}) => spec((g, c) => [g.leader(g.opponent(c))], o);

/** "an enemy card on the field" (follower or amulet) */
export const enemyCardOnField = (o: Opts = {}) => spec((g, c) => g.cards(g.opponent(c), "field"), o);

/** "a follower on your field" */
export const yourFollower = (o: Opts = {}) => spec((g, c) => g.followers(c), o);

/** "your leader or a follower on your field" (BP21-101). */
export const yourLeaderOrFollower = (o: Opts = {}) => spec((g, c) => [g.leader(c), ...g.followers(c)], o);

/** "another follower on your field" */
export const anotherYourFollower = (o: Opts = {}) => spec((g, c, self) => g.followers(c).filter((id) => id !== self), o);

/** "a card on your field" */
export const yourCardOnField = (o: Opts = {}) => spec((g, c) => g.cards(c, "field"), o);

/** "a follower on the field" (either side) */
export const anyFollower = (o: Opts = {}) => spec((g, c) => [...g.followers(c), ...g.followers(g.opponent(c))], o);

/** "another follower on the field" (either side) */
export const anotherFollower = (o: Opts = {}) =>
  spec((g, c, self) => [...g.followers(c), ...g.followers(g.opponent(c))].filter((id) => id !== self), o);

/** CR 4.1.2 — zones whose cards are not visible to all players. */
const NON_PUBLIC: readonly PlayerZone[] = ["hand", "deck", "evolveDeck"];

/**
 * Cards in one of your zones. In a non-public zone (hand, deck) a card cannot be guaranteed to
 * satisfy a condition and the player may treat it as if it didn't exist (CR 4.1.2.2), so
 * selecting from there is always "up to" (e.g. BP02-092 Kaguya — ruling).
 */
export const inYourZone = (zone: PlayerZone, o: Opts = {}) =>
  spec((g, c) => g.cards(c, zone), NON_PUBLIC.includes(zone) ? { ...o, upTo: true } : o);

/** Cards in one of the opponent's zones. */
export const inOpponentZone = (zone: PlayerZone, o: Opts = {}) => spec((g, c) => g.cards(g.opponent(c), zone), o);

/**
 * "a [matching] card on your field or in your EX area" (e.g. BP07-011 "Pixie followers on your
 * field or in your EX area"; a follower card in the EX area is a follower, CR 2.3).
 */
export const yourFieldOrEx = (o: Opts = {}) => spec((g, c) => [...g.cards(c, "field"), ...g.cards(c, "ex")], o);

/** "a card in an EX area" (either player's, e.g. BP02-061). */
export const inAnyExArea = (o: Opts = {}) => spec((g, c) => [...g.cards(c, "ex"), ...g.cards(g.opponent(c), "ex")], o);

// Common predicates -------------------------------------------------------------------------

export const isFollower: Filter = (g, id) => ofType(g, id, "follower");
export const isAmulet: Filter = (g, id) => ofType(g, id, "amulet");
export const isSpell: Filter = (g, id) => ofType(g, id, "spell");
/** CR 2.3.2 — a crest (BP20; tokens in the EX area, 9.1.4.2). */
export const isCrest: Filter = (g, id) => ofType(g, id, "crest");
export const hasTrait = (trait: string): Filter => (g, id) => g.info(id).traits.includes(trait);
export const isClass = (cls: string): Filter => (g, id) => g.info(id).class === cls;
export const costAtMost = (n: number): Filter => (g, id) => (g.info(id).cost ?? Infinity) <= n;
export const costAtLeast = (n: number): Filter => (g, id) => (g.info(id).cost ?? -Infinity) >= n;
/** Printed name or an extra name the card has on the field (BP03-078 "also Ghost"). */
export const named = (name: string): Filter => (g, id) => g.info(id).names.includes(name);
/** "With [text] in its name" (CR 2.1.2, BP03-056). Matches every name the card currently has. */
export const nameIncludes = (part: string): Filter => (g, id) => g.info(id).names.some((n) => n.includes(part));
export const isToken: Filter = (g, id) => g.info(id).baseDef.token;
/** "A follower with {[lastwords]}" (BP15-082): it has a Last Words ability (CR 12.5). */
export const hasLastWords: Filter = (g, id) => g.info(id).abilities.some((a) => a.ability.kind === "automatic" && a.ability.timing === "lastWords");
/** Has the special type "evolved" (CR 2.3.3.1): an evolved follower on the field. */
export const isEvolved: Filter = (g, id) => g.info(id).evolved;
export const isUnevolved: Filter = (g, id) => !g.info(id).evolved;
/**
 * An evolved follower card (エボルヴフォロワー), e.g. "faceup evolved followers in your evolve deck":
 * not an evolved amulet (BP08-090, BP08-110 ruling) nor an advanced follower (CR 9.2, BP10).
 */
export const isEvolvedFollower: Filter = (g, id) => ofType(g, id, "follower") && g.info(id).evolved;
/** An advanced card (CR 9.2), e.g. BP10-063 "an advanced follower with "Dual Form" in its name". */
export const isAdvanced: Filter = (g, id) => g.info(id).def.advanced === true;
/** Put onto the field during this turn (CR 8.4.2.1), e.g. BP02-101. */
export const enteredThisTurn: Filter = (g, id) => g.enteredFieldThisTurn(id);
export const and = (...fs: Filter[]): Filter => (g, id) => fs.every((f) => f(g, id));
