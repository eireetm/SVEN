// BP08-063 Zealot of Disdain — Dragoncraft follower, 2, 2/2. 絶傑・竜族・キラー.
// {[fanfare]} Deal 1 damage to each follower, including this follower.
// During your turn, whenever this takes ability damage, deal 1 damage to each enemy leader. Lethal
// ability damage still triggers; attack and combat damage do not (rulings, CR 5.14.3, 10.7.2).
import { defineCard, fanfare, whenThisTakesDamage } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.dealDamageEach([...fx.game.followers(fx.controller), ...fx.game.followers(fx.game.opponent(fx.controller))], 1);
      },
    }),
    whenThisTakesDamage(
      {
        *resolve(fx) {
          yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 1);
        },
      },
      { onlyYourTurn: true, ability: true },
    ),
  ],
});
