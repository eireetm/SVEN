// BP02-083 Mini Soul Devil — Abysscraft follower, 2, 3/2.
// Whenever one of your followers evolves, deal 2 damage to each enemy leader.
import { defineCard, whenYourFollowerEvolves } from "../helpers";

export default defineCard({
  abilities: [
    whenYourFollowerEvolves({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
      },
    }),
  ],
});
