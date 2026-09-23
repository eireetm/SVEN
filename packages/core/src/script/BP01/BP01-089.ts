// BP01-089 Conflagration — Dragoncraft spell, 5.
// Deal 5 damage to each follower on the field.
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.dealDamageEach([...g.followers(fx.controller), ...g.followers(g.opponent(fx.controller))], 5);
      },
    }),
  ],
});
