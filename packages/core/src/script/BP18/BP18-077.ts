// BP18-077 Ilze & Urze, Centennial Reapers — Abysscraft follower, 3, 3/3. 透京・魔界.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Bury the top 2 cards of your deck.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.mill(2);
      },
    }),
  ],
});
