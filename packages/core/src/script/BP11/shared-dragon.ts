// BP11 Dragoncraft pieces shared by several cards (not a card).
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { CustomCost } from "../types";
import { and, costAtLeast, hasTrait, isClass } from "../targets";

/** "A {[dragoncraft]} card that costs 7 or more" (元のコスト). */
export const bigDragon = and(isClass("Dragoncraft"), costAtLeast(7));
/** 海洋 (Marine) cards. */
export const marine = hasTrait("海洋");

/** "While Overflow is active for you, this follower has Storm" (BP11-052 / 053). */
export const stormWithOverflow = (g: GameReader, self: CardId) => (g.overflow(g.controller(self)) ? (["storm"] as const) : []);

/**
 * "Discard this card and a {[dragoncraft]} card that costs 7 or more" (BP11-058, 059, 066; valid in
 * the hand): both together, the second one another card.
 */
export const discardThisAndBigDragon: CustomCost = {
  canPay: (g, c, self) => g.card(self)?.zone === "hand" && g.cards(c, "hand").some((id) => id !== self && bigDragon(g, id)),
  *pay(fx) {
    const others = fx.game.cards(fx.controller, "hand").filter((id) => id !== fx.self && bigDragon(fx.game, id));
    const [other] = yield* fx.chooseCards(others, 1, 1);
    yield* fx.discardCards([fx.self, ...(other === undefined ? [] : [other])]);
  },
};
