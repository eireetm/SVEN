import type { CardId } from "../model/ids";
import type { GameReader } from "../engine/query";
import type { CustomCost } from "./types";

/**
 * Reusable costs ("[cost]: [effect]"). Costs are paid from your own zones only (BP01-123
 * ruling), and selecting cards for a cost is not the ability "selecting" them, so Aura does
 * not apply.
 */
type Filter = (game: GameReader, card: CardId) => boolean;

/** "Return another card on your field to its owner's hand" (BP01-002 / 003). */
export const returnAnotherCardOnYourField: CustomCost = {
  canPay: (g, c, self) => g.cards(c, "field").some((id) => id !== self),
  *pay(fx) {
    const cards = fx.game.cards(fx.controller, "field").filter((id) => id !== fx.self);
    yield* fx.returnToHand(yield* fx.chooseCards(cards, 1, 1));
  },
};

/** "Discard a [matching] card" from your hand. */
export function discardA(filter: Filter): CustomCost {
  return {
    canPay: (g, c) => g.cards(c, "hand").some((id) => filter(g, id)),
    *pay(fx) {
      const cards = fx.game.cards(fx.controller, "hand").filter((id) => filter(fx.game, id));
      yield* fx.discardCards(yield* fx.chooseCards(cards, 1, 1));
    },
  };
}

/** "Put a [matching] card from your field into its owner's cemetery" (may be this card itself). */
export function buryFromYourField(filter: Filter): CustomCost {
  return {
    canPay: (g, c) => g.cards(c, "field").some((id) => filter(g, id)),
    *pay(fx) {
      const cards = fx.game.cards(fx.controller, "field").filter((id) => filter(fx.game, id));
      yield* fx.bury(yield* fx.chooseCards(cards, 1, 1));
    },
  };
}

/** "Banish a [matching] card in your EX area". */
export function banishFromYourEx(filter: Filter): CustomCost {
  return {
    canPay: (g, c) => g.cards(c, "ex").some((id) => filter(g, id)),
    *pay(fx) {
      const cards = fx.game.cards(fx.controller, "ex").filter((id) => filter(fx.game, id));
      yield* fx.banish(yield* fx.chooseCards(cards, 1, 1));
    },
  };
}

/** "Give your leader -X defense" as a cost (CR 10.4.5: needs at least X; BP01-119 ruling). */
export function leaderDefenseCost(x: number): CustomCost {
  return {
    canPay: (g, c) => g.state.players[c].leaderDefense >= x,
    *pay(fx) {
      yield* fx.giveLeaderDefense(fx.controller, -x);
    },
  };
}
