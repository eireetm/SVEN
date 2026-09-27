// Shared pieces of CP01 card scripts (not a card: the file name has no set prefix).
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { EffectContext } from "../../engine/effects/context";
import type { Proc } from "../../engine/runtime/proc";
import type { CustomCost, TargetSpec } from "../types";
import { whenYouPlay } from "../helpers";
import { enemyFollower, hasTrait, isFollower, isSpell } from "../targets";

/** Traits used by several CP01 cards (日文种族). */
export const umamusume = hasTrait("ウマ娘");
export const mejiro = hasTrait("メジロ家");
export const bnw = hasTrait("BNW");

/** "an Umamusume follower" */
export const umamusumeFollower = (g: GameReader, id: CardId): boolean => isFollower(g, id) && umamusume(g, id);

/** "Umamusume cards in your cemetery" (CP01-057, 059, 060, 062). */
export const umamusumeInCemetery = (g: GameReader, p: PlayerId): number => g.cards(p, "cemetery").filter((id) => umamusume(g, id)).length;

/** "another card on your field" as a target (CP01-011). */
export const anotherCardOnYourField: TargetSpec = {
  count: 1,
  candidates: (g, c, self) => g.cards(c, "field").filter((id) => id !== self),
};

/** A cost that returns cards to hand counts them in `fx.memory.returned` (CP01-003). */
export const returnedCount = (memory: Readonly<Record<string, string | number | boolean | null>>): number => Number(memory.returned ?? 0);

/**
 * CP01-003 "Return any number of other Umamusume cards on your field to their owners' hands" — only your own cards
 * (ruling); an evolved or racing follower counts as 1 card (ruling). Paying it with none returned would do nothing.
 */
export const returnOtherUmamusume: CustomCost = {
  canPay: (g, c, self) => g.cards(c, "field").some((id) => id !== self && umamusume(g, id)),
  *pay(fx) {
    const g = fx.game;
    const cards = g.cards(fx.controller, "field").filter((id) => id !== fx.self && umamusume(g, id));
    const chosen = yield* fx.chooseCards(cards, 1, cards.length);
    fx.memory.returned = chosen.length;
    yield* fx.returnToHand(chosen);
  },
};

/**
 * CP01-027 / 028 "Whenever you play a spell, select an enemy follower on the field and give it {[attack]}-1/{[defense]}-1."
 * (Each copy triggers; on the opponent's turn too; serving a Carrot is not playing a spell — rulings.)
 */
export const tachyonSpellPlayed = () =>
  whenYouPlay(
    {
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, -1, -1);
      },
    },
    isSpell,
  );

/**
 * "Look at the top card of your deck. You may reveal a [matching] card and add it to your hand." — not taken, it stays on
 * top, unrevealed (CP01-040, 073 rulings).
 */
export function* mayTakeTopCard(fx: EffectContext, filter: (g: GameReader, id: CardId) => boolean): Proc<void> {
  const top = fx.topCards(1);
  const chosen = yield* fx.selectCards(top.filter((id) => filter(fx.game, id)), 0, 1, fx.controller, top);
  if (chosen.length === 0) return;
  yield* fx.reveal(chosen);
  yield* fx.returnToHand(chosen);
}
