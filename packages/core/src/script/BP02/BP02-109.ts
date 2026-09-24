// BP02-109 Demonic Simulacrum — Neutral follower, 3, 6/5.
// {[fanfare]} Deal 3 damage to your leader. Discard a random card. (CR 5.19)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.controller), 3);
        yield* fx.discardRandom(1);
      },
    }),
  ],
});
