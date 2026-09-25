// BP07-073 Doublame, Duke and Dame — Abysscraft follower, 2, 2/2. 魔界.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Bury the top card of your deck.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.mill(1);
      },
    }),
  ],
});
