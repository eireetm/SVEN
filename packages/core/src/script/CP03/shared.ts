// Shared pieces of CP03 card scripts (not a card: the file name has no set prefix).
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { EffectContext } from "../../engine/effects/context";
import type { Proc } from "../../engine/runtime/proc";
import { hasTrait, isFollower } from "../targets";

type Filter = (g: GameReader, id: CardId) => boolean;

/** Traits used by CP03 cards (日文种族): Vanguard (ヴァンガード) and its clans. */
export const vanguard = hasTrait("ヴァンガード");
export const AQUA_FORCE = "アクアフォース";
export const aquaForce = hasTrait(AQUA_FORCE);
export const royalPaladin = hasTrait("ロイヤルパラディン");
export const paleMoon = hasTrait("ペイルムーン");
export const kagero = hasTrait("かげろう");
export const shadowPaladin = hasTrait("シャドウパラディン");
export const oracleThinkTank = hasTrait("オラクルシンクタンク");

/** "a [matching] follower" */
export const followerThat =
  (f: Filter): Filter =>
  (g, id) =>
    isFollower(g, id) && f(g, id);

/** "[matching] cards in your cemetery / banished zone" */
export const countIn = (g: GameReader, p: PlayerId, zone: "cemetery" | "banished", f: Filter = () => true): number =>
  g.cards(p, zone).filter((id) => f(g, id)).length;

/**
 * "Aqua Force followers on your field have attacked N times this turn" (CP03-001, 005, 007, 009, 018, 019): counted when each
 * attacked, also if the attacker was destroyed afterwards (rulings). An attack trigger resolving right after the attack sees
 * the count with that attack.
 */
export const aquaForceAttacks = (g: GameReader, p: PlayerId): number => g.attacksThisTurnWith(p, AQUA_FORCE);

/** "Deal N damage to each enemy leader" */
export function* damageEnemyLeader(fx: EffectContext, n: number): Proc<void> {
  yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), n);
}

/**
 * "Look at the top card of your deck. You may reveal it and add it to your hand." Not taken, it stays on top, unrevealed.
 * Returns the card added to the hand.
 */
export function* mayTakeTopCard(fx: EffectContext, filter: Filter = () => true): Proc<CardId | null> {
  const top = fx.topCards(1);
  const [chosen] = yield* fx.selectCards(top.filter((id) => filter(fx.game, id)), 0, 1, fx.controller, top);
  if (chosen === undefined) return null;
  yield* fx.reveal([chosen]);
  const [inHand] = yield* fx.returnToHand([chosen]);
  return inHand ?? null;
}

/**
 * "Look at the top N cards of your deck. Put any number of them on the top of your deck in any order. Put the rest on the
 * bottom in any order." (as BP06-108)
 */
export function* arrangeTop(fx: EffectContext, n: number, top: readonly CardId[] = fx.topCards(n)): Proc<void> {
  const keep = yield* fx.chooseCards(top, 0, top.length);
  yield* fx.bottomInAnyOrder(top.filter((id) => !keep.includes(id)));
  yield* fx.putOnDeckInAnyOrder(keep, "top");
}

/** "You may summon a [matching] card from your hand." */
export function* maySummonFromHand(fx: EffectContext, filter: Filter): Proc<void> {
  const fits = fx.game.cards(fx.controller, "hand").filter((id) => filter(fx.game, id));
  yield* fx.putOntoField(yield* fx.chooseCards(fits, 0, 1));
}
