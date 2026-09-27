// CP01-050 Grass Wonder — Dragoncraft follower, 5, 5/5. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// {[fanfare]} Deal 2 damage to each enemy follower on the field.
import { defineCard, fanfare, serveAbility } from "../helpers";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    fanfare({
      *resolve(fx) {
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 2);
      },
    }),
  ],
});
