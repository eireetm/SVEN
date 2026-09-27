// Shared pieces of CP02 card scripts (not a card: the file name has no set prefix).
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { EffectContext } from "../../engine/effects/context";
import type { Proc } from "../../engine/runtime/proc";
import type { TargetSpec } from "../types";
import { hasTrait, isFollower } from "../targets";

type Filter = (g: GameReader, id: CardId) => boolean;

/**
 * Traits used by CP02 cards (日文种族): iM@S CG (デレマス) and the types Cute (キュート), Cool (クール) and Passion (パッション).
 * A card may have several types, and then counts as each of them (CP02-103 ruling).
 */
export const imas = hasTrait("デレマス");
export const cute = hasTrait("キュート");
export const cool = hasTrait("クール");
export const passion = hasTrait("パッション");

/** "a [matching] follower" */
export const followerThat =
  (f: Filter): Filter =>
  (g, id) =>
    isFollower(g, id) && f(g, id);

/** "[matching] followers on your field" (e.g. "if there are at least 3 iM@S CG followers on your field"). */
export const followersOnYourField = (g: GameReader, p: PlayerId, f: Filter): number => g.followers(p).filter((id) => f(g, id)).length;

/** "[matching] cards in your cemetery" */
export const inYourCemetery = (g: GameReader, p: PlayerId, f: Filter): number => g.cards(p, "cemetery").filter((id) => f(g, id)).length;

/** "a follower with [part] in its name on your field" (CP02-021, 022). */
export const nameOnYourField = (g: GameReader, p: PlayerId, part: string): boolean =>
  g.followers(p).some((id) => g.info(id).names.some((n) => n.includes(part)));

/** "If you have 10 max play points" (CP02-052, 056, 058, 061). */
export const maxPlayPointsTen = (g: GameReader, p: PlayerId): boolean => g.state.players[p].maxPlayPoints >= 10;

/** "another card that costs N or less on your field" as a target (CP02-004 / 005; 元のコスト, CR 5.24.1). */
export const anotherCardCostingAtMost = (n: number): TargetSpec => ({
  count: 1,
  candidates: (g, c, self) => g.cards(c, "field").filter((id) => id !== self && (g.info(id).cost ?? Infinity) <= n),
});

/** "Deal N damage to each enemy leader" */
export function* damageEnemyLeader(fx: EffectContext, n: number): Proc<void> {
  yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), n);
}

/**
 * "Look at the top card of your deck. You may reveal it and add it to your hand." Not taken, it stays on top, unrevealed
 * (CP02-015 ruling). Returns the card added to the hand.
 */
export function* mayTakeTopCard(fx: EffectContext): Proc<CardId | null> {
  const top = fx.topCards(1);
  const [chosen] = yield* fx.selectCards(top, 0, 1, fx.controller, top);
  if (chosen === undefined) return null;
  yield* fx.reveal([chosen]);
  const [inHand] = yield* fx.returnToHand([chosen]);
  return inHand ?? null;
}
