// Shared pieces of BP17 Dragoncraft card scripts (not a card: the file name has no set prefix).
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { CustomCost } from "../types";
import { hasRoom } from "./shared";

type Filter = (g: GameReader, id: CardId) => boolean;

/** "put a [matching] card from your hand into your EX area" as a cost (BP17-071): a full EX area can't pay it (ruling). */
export const putFromHandIntoEx = (filter: Filter): CustomCost => {
  const cards = (g: GameReader, c: PlayerId, self: CardId) => g.cards(c, "hand").filter((id) => id !== self && filter(g, id));
  return {
    canPay: (g, c, self) => hasRoom(g, c, "ex") && cards(g, c, self).length > 0,
    *pay(fx) {
      yield* fx.putIntoEx(yield* fx.chooseCards(cards(fx.game, fx.controller, fx.self), 1, 1));
    },
  };
};

/** "bury a [matching] card from your EX area" as a cost (BP17-058). */
export const buryFromYourEx = (filter: Filter): CustomCost => ({
  canPay: (g, c) => g.cards(c, "ex").some((id) => filter(g, id)),
  *pay(fx) {
    const cards = fx.game.cards(fx.controller, "ex").filter((id) => filter(fx.game, id));
    yield* fx.bury(yield* fx.chooseCards(cards, 1, 1));
  },
});
