// Shared pieces of BP20 Dragoncraft card scripts (not a card: the file name has no set prefix).
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { CustomCost } from "../types";
import { discardA } from "../costs";
import { lookAtTopCards, whenThisTakesDamage, type TimingSpec } from "../helpers";
import { marine } from "./shared";

/**
 * BP20-060 / 061 "Discard a Marine card: Look at the top 2 cards of your deck. You may put a Marine card from among them
 * into your EX area. Put the rest on the bottom of your deck in any order. Give your leader {[defense]}+1." (CR 10.4.7.4:
 * all of it after the discard.)
 */
export const mermanager: TimingSpec = {
  cost: discardA(marine),
  *resolve(fx) {
    yield* lookAtTopCards(fx, 2, { filter: marine, to: "ex" });
    yield* fx.giveLeaderDefense(fx.controller, 1);
  },
};

/** "Put a [matching] card from your hand into your EX area" as a cost (BP20-071); the EX area needs room (CR 4.8.3.2). */
export function putFromHandIntoEx(filter: (g: GameReader, id: CardId) => boolean): CustomCost {
  const cards = (g: GameReader, c: PlayerId, self: CardId) => g.cards(c, "hand").filter((id) => id !== self && filter(g, id));
  return {
    canPay: (g, c, self) => cards(g, c, self).length > 0 && g.cards(c, "ex").length < g.exAreaLimit(c),
    *pay(fx) {
      yield* fx.putIntoEx(yield* fx.chooseCards(cards(fx.game, fx.controller, fx.self), 1, 1));
    },
  };
}

/** BP20-057 / 058 "During your turn, whenever this takes ability damage, deal 1 damage to each enemy follower on the field." */
export const azurifritPing = whenThisTakesDamage(
  {
    *resolve(fx) {
      const enemies = fx.game.followers(fx.game.opponent(fx.controller));
      if (enemies.length > 0) yield* fx.dealDamageEach(enemies, 1);
    },
  },
  { onlyYourTurn: true, ability: true },
);
