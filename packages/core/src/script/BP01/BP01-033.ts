// BP01-033 Royal Banner — Swordcraft amulet, 4.
// {[fanfare]} Give each {[swordcraft]} follower on your field +1/+1.
// Whenever a {[swordcraft]} follower is put onto your field, give it +1/+1.
import { defineCard, fanfare, whenFollowerEntersYourField } from "../helpers";
import { isClass } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        for (const id of fx.game.followers(fx.controller)) {
          if (isClass("Swordcraft")(fx.game, id)) yield* fx.giveStats(id, 1, 1);
        }
      },
    }),
    whenFollowerEntersYourField(
      {
        *resolve(fx) {
          yield* fx.giveStats(fx.data!.card!, 1, 1);
        },
      },
      { filter: isClass("Swordcraft") },
    ),
  ],
});
