// BP10-069 Springwell Dragon Keeper (Evolved) — Dragoncraft follower, 4/4. アルカナ・竜使い.
// On Evolve - Discard a card: Select an enemy follower on the field. Deal it 4 damage and, if you
// discarded an Arcana card, draw a card. (Without a target the cost can't be paid — ruling.)
import type { CustomCost } from "../types";
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { arcana } from "./shared";

/** "Discard a card", remembering whether it was an Arcana card. */
const discardOne: CustomCost = {
  canPay: (g, p) => g.cards(p, "hand").length > 0,
  *pay(fx) {
    const [card] = yield* fx.chooseCards(fx.game.cards(fx.controller, "hand"), 1, 1);
    fx.memory.arcana = card !== undefined && arcana(fx.game, card);
    yield* fx.discardCards(card === undefined ? [] : [card]);
  },
};

export default defineCard({
  abilities: [
    onEvolve({
      cost: discardOne,
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        if (fx.memory.arcana === true) yield* fx.draw(1);
      },
    }),
  ],
});
