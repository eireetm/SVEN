// BP04-099 Dark Jeanne — Havencraft follower, 6, 5/5. 狂信.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Deal 2 damage to each other follower on the field. Give each other follower on your
// field +2/+0. (Followers the damage will destroy are still on the field until rules handling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        const others = (p: 0 | 1) => fx.game.followers(p).filter((id) => id !== fx.self);
        yield* fx.dealDamageEach([...others(fx.controller), ...others(fx.game.opponent(fx.controller))], 2);
        for (const id of others(fx.controller)) yield* fx.giveStats(id, 2, 0);
      },
    }),
  ],
});
