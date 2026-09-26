// BP20-087 Ephemeral Demon Princess — Abysscraft follower, 4, 3/3. 妖怪・魔界.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Bury the top 3 cards of your deck.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.mill(3);
      },
    }),
  ],
});
