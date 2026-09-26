// BP10-082 Ghost Maid — Abysscraft follower, 2, 2/2. 死者・メイド.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Summon a Ghost token.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Ghost"]);
      },
    }),
  ],
});
