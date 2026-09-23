// BP01-121 Rabbit Necromancer — Abysscraft follower, 3, 3/3.
// {[lastwords]} Deal 2 damage to each leader.
import { defineCard, lastWords } from "../helpers";

export default defineCard({
  abilities: [
    lastWords({
      *resolve(fx) {
        yield* fx.dealDamageEach([fx.game.leader(0), fx.game.leader(1)], 2);
      },
    }),
  ],
});
