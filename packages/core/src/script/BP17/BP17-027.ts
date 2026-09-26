// BP17-027 Valhorean Dealer — Swordcraft follower, 3, 3/3. 兵士・商人.
// {[evolve]} {[cost03]}: Evolve this.
// {[evolve]} {[cost01]}: Evolve this. Activate only if there are at least 8 cards in your hand.
// {[fanfare]} Draw a card.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(3),
    evolveAbility(1, { condition: (g, p) => g.cards(p, "hand").length >= 8 }),
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
