// BP12-113 Plucky Treasure Hunter (Evolved) — Neutral follower, 2/3. 傭兵.
// On Evolve - Discard a card: Roll a 6-sided die. If you roll a 4, 5, or 6, draw 3 cards. (CR 5.20)
import { defineCard, onEvolve } from "../helpers";
import { discardCardsCost } from "../costs";

export default defineCard({
  abilities: [
    onEvolve({
      cost: discardCardsCost(1),
      *resolve(fx) {
        if ((yield* fx.rollDie()) >= 4) yield* fx.draw(3);
      },
    }),
  ],
});
