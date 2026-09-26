// BP16-102 Angelic Prism Priestess (Evolved) — Havencraft follower, 2/2. 先導・鳥族.
// On Evolve - You may summon an amulet that costs 2 or less from your hand. (元のコスト.)
import { defineCard, onEvolve } from "../helpers";
import { and, costAtMost, isAmulet } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const cards = fx.game.cards(fx.controller, "hand").filter((id) => and(isAmulet, costAtMost(2))(fx.game, id));
        yield* fx.putOntoField(yield* fx.chooseCards(cards, 0, 1));
      },
    }),
  ],
});
