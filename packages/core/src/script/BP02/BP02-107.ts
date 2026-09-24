// BP02-107 Bahamut — Neutral follower, 9, 9/9.
// {[evolve]}{[cost00]}: Evolve this follower.
// {[fanfare]} Destroy each other follower on the field.
// If there are at least 2 enemy followers on the field, this follower can't attack enemy leaders.
// (CR 8.4.3)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { atLeastTwoEnemyFollowers } from "./shared";

export default defineCard({
  cannotAttackLeader: atLeastTwoEnemyFollowers,
  abilities: [
    evolveAbility(0),
    fanfare({
      *resolve(fx) {
        const all = [...fx.game.followers(fx.controller), ...fx.game.followers(fx.game.opponent(fx.controller))];
        yield* fx.destroy(all.filter((id) => id !== fx.self));
      },
    }),
  ],
});
