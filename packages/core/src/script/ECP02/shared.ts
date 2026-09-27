// Shared pieces of ECP02 card scripts (not a card: the file name has no set prefix). The iM@S CG universe's traits and helpers
// are CP02's.
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { EffectContext } from "../../engine/effects/context";
import type { Proc } from "../../engine/runtime/proc";
import type { CustomCost } from "../types";
import { MAGICAL_ITEM } from "../../data/universes";
import { isFollower } from "../targets";
import { cool, cute, passion } from "../CP02/shared";

export { cool, cute, followerThat, followersOnYourField, imas, inYourCemetery, passion } from "../CP02/shared";

type Filter = (g: GameReader, id: CardId) => boolean;

/** "a follower with [part] (or [part] ...) in its name" (CR 2.1.2: every name the card has). */
export const followerNamed =
  (...parts: readonly string[]): Filter =>
  (g, id) =>
    isFollower(g, id) && g.info(id).names.some((n) => parts.some((p) => n.includes(p)));

/** "Deal N damage to each enemy leader" */
export function* damageEnemyLeader(fx: EffectContext, n: number): Proc<void> {
  yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), n);
}

/**
 * "Look at the top card of your deck. If it's a [matching] card, you may reveal it and add it to your hand." Not taken, it stays
 * on top, unrevealed (ECP02-003, 016, 063 rulings).
 */
export function* mayTakeTopCard(fx: EffectContext, filter: Filter): Proc<void> {
  const top = fx.topCards(1);
  const chosen = yield* fx.selectCards(top.filter((id) => filter(fx.game, id)), 0, 1, fx.controller, top);
  if (chosen.length === 0) return;
  yield* fx.reveal(chosen);
  yield* fx.returnToHand(chosen);
}

/** "Put N Magical Item tokens into your EX area" (CR 14.3.1; none when it is full — ECP02-072 ruling). */
export function* magicalItems(fx: EffectContext, n = 1): Proc<CardId[]> {
  return yield* fx.tokensToEx(Array<string>(n).fill(MAGICAL_ITEM));
}

/** "Put it into your EX area. It costs N less to play this turn." (Only the cards that got there, CR 4.8.3.2.) */
export function* intoExCheaper(fx: EffectContext, cards: readonly CardId[], n: number): Proc<void> {
  const moved = yield* fx.putIntoEx(cards);
  for (const id of moved) if (fx.game.card(id)?.zone === "ex") yield* fx.changePlayCost(id, -n, "endOfTurn");
}

/** "Search your deck for a [matching] card, put it into your EX area, then shuffle. It costs N less to play this turn." */
export function* searchIntoExCheaper(fx: EffectContext, filter: Filter, n: number, max = 1): Proc<void> {
  const found = yield* fx.search((id) => filter(fx.game, id), { to: "ex", max });
  for (const id of found) if (fx.game.card(id)?.zone === "ex") yield* fx.changePlayCost(id, -n, "endOfTurn");
}

/** "You may summon a [matching] card from your hand." */
export function* maySummonFromHand(fx: EffectContext, filter: Filter): Proc<CardId[]> {
  const fits = fx.game.cards(fx.controller, "hand").filter((id) => filter(fx.game, id));
  return yield* fx.putOntoField(yield* fx.chooseCards(fits, 0, 1));
}

/** The three types, for "a Cute card, Cool card, and Passion card" (ECP02-034, 039). */
export const TYPES: readonly Filter[] = [cute, cool, passion];

/** Can every `left` get a different `right` it fits (a bipartite matching, Kuhn's algorithm)? */
function matchAll<L, R>(left: readonly L[], right: readonly R[], fits: (l: L, r: R) => boolean): boolean {
  const owner = new Map<R, L>();
  const tryMatch = (l: L, seen: Set<R>): boolean => {
    for (const r of right) {
      if (seen.has(r) || !fits(l, r)) continue;
      seen.add(r);
      const other = owner.get(r);
      if (other === undefined || tryMatch(other, seen)) {
        owner.set(r, l);
        return true;
      }
    }
    return false;
  };
  return left.every((l) => tryMatch(l, new Set()));
}

/**
 * Can each card count as a different one of `slots` (a card with several of the types counts as any one of them, once — CP02-103,
 * ECP02-034 and 039 rulings)?
 */
export const canAssign = (g: GameReader, cards: readonly CardId[], slots: readonly Filter[]): boolean =>
  matchAll(cards, slots, (id, slot) => slot(g, id));

/** Can each of `slots` get a different one of the cards? */
export const canFill = (g: GameReader, cards: readonly CardId[], slots: readonly Filter[]): boolean =>
  matchAll(slots, cards, (slot, id) => slot(g, id));

/** "Return an iM@S CG card on your field to its owner's hand" (ECP02-007): your own field (CR 10.4.3), this card too. */
export const returnImasCardOnYourField = (imasFilter: Filter): CustomCost => ({
  canPay: (g, c) => g.cards(c, "field").some((id) => imasFilter(g, id)),
  *pay(fx) {
    const cards = fx.game.cards(fx.controller, "field").filter((id) => imasFilter(fx.game, id));
    yield* fx.returnToHand(yield* fx.chooseCards(cards, 1, 1));
  },
});
