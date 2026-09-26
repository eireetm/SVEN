// BP13-046 Hurricane Golem — Runecraft follower, 6, 5/5. ゴーレム.
// {[fanfare]} Deal 2 damage to each enemy follower on the field. Earth Rite: Deal 2 damage to each enemy
// follower on the field. (Earth Rite is optional, CR 13.3.3.2; the second damage follows the first.)
// {[lastwords]} Summon a Magic Sediment token.
import { defineCard, fanfare, lastWords } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      earthRite: { mode: "optional" },
      *resolve(fx) {
        const enemies = () => fx.game.followers(fx.game.opponent(fx.controller));
        yield* fx.dealDamageEach(enemies(), 2);
        if (fx.earthRitePaid) yield* fx.dealDamageEach(enemies(), 2);
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.summon(["Magic Sediment"]);
      },
    }),
  ],
});
