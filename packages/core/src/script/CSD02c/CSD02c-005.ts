// CSD02c-005 Suzuho Ueda — Forestcraft follower, 3, 3/3. デレマス・パッション.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Look at the top card of your deck. (It goes back face down where it was — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.lookAt(fx.topCards(1));
      },
    }),
  ],
});
