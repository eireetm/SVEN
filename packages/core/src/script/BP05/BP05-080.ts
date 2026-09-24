// BP05-080 Servant of Lust — Abysscraft follower, 2, 3/1. 絶傑・魔界.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Deal 1 damage to your leader.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.controller), 1);
      },
    }),
  ],
});
