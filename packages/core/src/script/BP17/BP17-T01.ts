// BP17-T01 Lococo's Teddy Bear — Forestcraft follower token, 2, 2/2. 人形.
// {[lastwords]} Deal 1 damage to your leader.
import { defineCard, lastWords } from "../helpers";

export default defineCard({
  abilities: [
    lastWords({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.controller), 1);
      },
    }),
  ],
});
