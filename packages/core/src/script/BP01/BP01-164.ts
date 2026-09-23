// BP01-164 Goblinmount Demon — Neutral follower, 5, 6/6.
// {[evolve]}{[cost00]}: Evolve this follower. // Ward.
// {[fanfare]} Deal 2 damage to each other follower on your field.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(0),
    fanfare({
      *resolve(fx) {
        yield* fx.dealDamageEach(fx.game.followers(fx.controller).filter((id) => id !== fx.self), 2);
      },
    }),
  ],
});
