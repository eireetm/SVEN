// Shared pieces of BP15 Dragoncraft card scripts (not a card: the file name has no set prefix).
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { AutomaticAbility, CustomCost } from "../types";
import { type TimingSpec, whenFollowerEntersYourField, whenThisTakesDamage, whenYouDiscard } from "../helpers";
import { engageThis } from "../costs";
import { marine } from "./shared";

type Filter = (g: GameReader, id: CardId) => boolean;

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

/** BP15-074 "discard this and a [matching] card" — both at once (CR 5.12), from the hand. */
export const discardThisAnd = (filter: Filter): CustomCost => {
  const others = (g: GameReader, self: CardId, p: PlayerId) =>
    g.cards(p, "hand").filter((id) => id !== self && filter(g, id));
  return {
    canPay: (g, c, self) => g.card(self)?.zone === "hand" && others(g, self, c).length > 0,
    *pay(fx) {
      const [other] = yield* fx.chooseCards(others(fx.game, fx.self, fx.controller), 1, 1);
      yield* fx.discardCards(other === undefined ? [fx.self] : [fx.self, other]);
    },
  };
};
