// BP13-082 Linkstaff Necromancer — Abysscraft follower, 3, 3/3. 死霊術師.
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
