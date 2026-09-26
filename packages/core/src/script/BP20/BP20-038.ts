// BP20-038 Velharia, Heir to Truth — Runecraft follower, 2, 0/2. 絶傑・継承者・魔法使い.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Draw a card.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
