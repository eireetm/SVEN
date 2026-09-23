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
}

function spec(candidates: (g: GameReader, controller: PlayerId, self: CardId) => CardId[], o: Opts): TargetSpec {
  const t: TargetSpec = {
    count: o.count ?? 1,
    upTo: o.upTo ?? false,
    candidates: (g, c, self) => candidates(g, c, self).filter((id) => o.filter?.(g, id) ?? true),
  };
  if (o.when) t.when = o.when;
  return t;
}

const ofType = (g: GameReader, id: CardId, type: CardType) => g.info(id).type === type;

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

/** "another follower on your field" */
export const anotherYourFollower = (o: Opts = {}) => spec((g, c, self) => g.followers(c).filter((id) => id !== self), o);

/** "a card on your field" */
export const yourCardOnField = (o: Opts = {}) => spec((g, c) => g.cards(c, "field"), o);

/** "a follower on the field" (either side) */
export const anyFollower = (o: Opts = {}) => spec((g, c) => [...g.followers(c), ...g.followers(g.opponent(c))], o);

/** "another follower on the field" (either side) */
export const anotherFollower = (o: Opts = {}) =>
  spec((g, c, self) => [...g.followers(c), ...g.followers(g.opponent(c))].filter((id) => id !== self), o);

/** Cards in one of your zones (public zones: cemetery, EX area). */
export const inYourZone = (zone: PlayerZone, o: Opts = {}) => spec((g, c) => g.cards(c, zone), o);

/** Cards in one of the opponent's zones. */
export const inOpponentZone = (zone: PlayerZone, o: Opts = {}) => spec((g, c) => g.cards(g.opponent(c), zone), o);

// Common predicates -------------------------------------------------------------------------

export const isFollower: Filter = (g, id) => ofType(g, id, "follower");
export const isAmulet: Filter = (g, id) => ofType(g, id, "amulet");
export const isSpell: Filter = (g, id) => ofType(g, id, "spell");
export const hasTrait = (trait: string): Filter => (g, id) => g.info(id).traits.includes(trait);
export const isClass = (cls: string): Filter => (g, id) => g.info(id).class === cls;
export const costAtMost = (n: number): Filter => (g, id) => (g.info(id).cost ?? Infinity) <= n;
export const costAtLeast = (n: number): Filter => (g, id) => (g.info(id).cost ?? -Infinity) >= n;
export const named = (name: string): Filter => (g, id) => g.info(id).name === name;
export const isToken: Filter = (g, id) => g.info(id).baseDef.token;
export const and = (...fs: Filter[]): Filter => (g, id) => fs.every((f) => f(g, id));
