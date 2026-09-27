// Shared pieces of ECP01 card scripts (not a card: the file name has no set prefix). The Umamusume universe's traits and
// helpers are CP01's.
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { EffectContext } from "../../engine/effects/context";
import type { Proc } from "../../engine/runtime/proc";
import type { CustomCost, TargetSpec } from "../types";
import { lookAtTopCards } from "../helpers";
import { costAtMost, isSpell, named } from "../targets";
import { mejiro, umamusume, umamusumeFollower } from "../CP01/shared";

export { bnw, mayTakeTopCard, mejiro, umamusume, umamusumeFollower, umamusumeInCemetery } from "../CP01/shared";

/** "Umamusume cards on your field" */
export const umamusumeOnYourField = (g: GameReader, p: PlayerId): number => g.cards(p, "field").filter((id) => umamusume(g, id)).length;

/** "Mejiro Family cards on your field" */
export const mejiroOnYourField = (g: GameReader, p: PlayerId): number => g.cards(p, "field").filter((id) => mejiro(g, id)).length;

/** "Umamusume spells in your cemetery" */
export const umamusumeSpellsInCemetery = (g: GameReader, p: PlayerId): number =>
  g.cards(p, "cemetery").filter((id) => isSpell(g, id) && umamusume(g, id)).length;

/**
 * "faceup cards named Carrot in your evolve deck" (CR 4.6.3: faceup cards are only part of it when referenced like this; 11.8
 * puts a Carrot there faceup when its racing follower leaves). The Carrots linked to racing followers are in the race zone, not
 * counted (ECP01-033 / 038 rulings).
 */
export const faceUpCarrots = (g: GameReader, p: PlayerId): CardId[] => g.faceUpEvolveDeck(p).filter((id) => named("Carrot")(g, id));

/** "Select a faceup Carrot in your evolve deck" (ECP01-019): a public card of the evolve deck area. */
export const faceUpCarrot: TargetSpec = { count: 1, candidates: (g, c) => faceUpCarrots(g, c) };

/**
 * "Discard an Umamusume card" as a cost, recording the base cost of the discarded card (元のコスト) for "if you discarded an
 * Umamusume card that costs 7 or more" (ECP01-030, 036, 049).
 */
export const discardUmamusumeRecorded: CustomCost = {
  canPay: (g, c, self) => g.cards(c, "hand").some((id) => id !== self && umamusume(g, id)),
  *pay(fx) {
    const cards = fx.game.cards(fx.controller, "hand").filter((id) => id !== fx.self && umamusume(fx.game, id));
    const [card] = yield* fx.chooseCards(cards, 1, 1);
    if (card === undefined) return;
    fx.memory.discardedCost = fx.game.info(card).cost ?? 0;
    yield* fx.discardCards([card]);
  },
};

/** Did the recorded discard (discardUmamusumeRecorded) cost N or more? */
export const discardedCostAtLeast = (fx: EffectContext, n: number): boolean => typeof fx.memory.discardedCost === "number" && fx.memory.discardedCost >= n;

/**
 * "Look at the top N cards of your deck. You may summon an Umamusume follower that costs M or less from among them. Put the rest
 * on the bottom of your deck in any order." (元のコスト.) Returns the summoned card.
 */
export function* maySummonUmamusumeFromTop(fx: EffectContext, n: number, maxCost: number): Proc<CardId[]> {
  return yield* lookAtTopCards(fx, n, { filter: (g, id) => umamusumeFollower(g, id) && costAtMost(maxCost)(g, id), to: "field" });
}

/** "Give this follower +1/+1" — while it is on the field. */
export function* plusOneThis(fx: EffectContext): Proc<void> {
  if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 1);
}

/** "You may summon a [matching] card from your hand." */
export function* maySummonFromHand(fx: EffectContext, filter: (g: GameReader, id: CardId) => boolean): Proc<CardId[]> {
  const fits = fx.game.cards(fx.controller, "hand").filter((id) => filter(fx.game, id));
  return yield* fx.putOntoField(yield* fx.chooseCards(fits, 0, 1));
}

/** "Put it into your EX area. It costs N less to play this turn." (Only the cards that got there, CR 4.8.3.2.) */
export function* intoExCheaper(fx: EffectContext, cards: readonly CardId[], n: number): Proc<void> {
  const moved = yield* fx.putIntoEx(cards);
  for (const id of moved) if (fx.game.card(id)?.zone === "ex") yield* fx.changePlayCost(id, -n, "endOfTurn");
}

/** "Select up to 1 enemy follower on the field and deal it N damage. Give this follower +1/+1." (On Race: ECP01-008, 021.) */
export function* damageUpToOneThenPlusOne(fx: EffectContext, n: number): Proc<void> {
  const target = fx.targets[0]?.[0];
  if (target !== undefined) yield* fx.dealDamage(target, n);
  yield* plusOneThis(fx);
}
