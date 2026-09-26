// Shared pieces of BP15 Dragoncraft card scripts (not a card: the file name has no set prefix).
import type { AutomaticAbility } from "../types";
import { type TimingSpec, whenFollowerEntersYourField, whenThisTakesDamage, whenYouDiscard } from "../helpers";
import { engageThis } from "../costs";
import { marine } from "./shared";

/**
 * "During your turn, whenever this takes ability damage, ..." (BP15-057, 066, 067, 072): also when the damage
 * destroys it, and then it resolves after the destruction (rulings).
 */
export const whenTakesAbilityDamageOnYourTurn = (spec: TimingSpec): AutomaticAbility =>
  whenThisTakesDamage(spec, { ability: true, onlyYourTurn: true });

/**
 * BP15-060 / 061 "Whenever you discard a card, engage this: Draw a card." Once per discarded card; a later
 * one finds it engaged and can't pay (CR 10.4.7.4; rulings), also during the opponent's turn.
 */
export const celestialDragoonDraw = (): AutomaticAbility =>
  whenYouDiscard(
    {
      cost: engageThis,
      *resolve(fx) {
        yield* fx.draw(1);
      },
    },
    () => true,
  );

/**
 * BP15-062 / 063 "Whenever another Marine follower is put onto your field, deal 1 damage to each enemy leader."
 * (Also during the opponent's turn — ruling.)
 */
export const mermaidOfPunishment = (): AutomaticAbility =>
  whenFollowerEntersYourField(
    {
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 1);
      },
    },
    { another: true, filter: marine },
  );

// Moved to script/costs.ts (also used by BP20-042); re-exported for BP15's scripts.
export { discardThisAnd } from "../costs";
