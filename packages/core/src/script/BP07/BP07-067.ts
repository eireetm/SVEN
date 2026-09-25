// BP07-067 Boomfish — Dragoncraft follower, 2, 3/2. 海洋.
// {[act]} {[cost02]}, bury this card: Deal 3 damage to each follower on the field and your leader.
import { activated, defineCard } from "../helpers";

export default defineCard({
  abilities: [
    activated(
      { playPoints: 2, burySelf: true },
      {
        *resolve(fx) {
          const me = fx.controller;
          const followers = [...fx.game.followers(me), ...fx.game.followers(fx.game.opponent(me))];
          yield* fx.dealDamageEach([...followers, fx.game.leader(me)], 3);
        },
      },
    ),
  ],
});
