// BP01-118 Ambling Wraith — Abysscraft follower, 1, 2/1.
// {[fanfare]} Deal 1 damage to each leader.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.dealDamageEach([fx.game.leader(0), fx.game.leader(1)], 1);
      },
    }),
  ],
});
