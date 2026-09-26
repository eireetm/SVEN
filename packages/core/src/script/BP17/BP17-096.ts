// BP17-096 Marlone, Peace Advocate — Havencraft follower, 4, 2/2. 信仰.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Summon an Eschamali Adviser token.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Eschamali Adviser"]);
      },
    }),
  ],
});
