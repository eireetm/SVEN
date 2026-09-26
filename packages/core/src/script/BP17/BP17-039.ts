// BP17-039 Eleanor, Glorious Flower — Runecraft follower, 1, 1/1. 魔法使い.
// {[fanfare]} Banish a {[runecraft]} card from your cemetery: Draw a card.
// Activate {[engage]} this: Select an enemy follower on the field and, if there are at least 5 cards in your banished
// zone, deal it 1 damage. If there are at least 10, deal 4 damage instead.
import { banishFromYour } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower, isClass } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      cost: banishFromYour(["cemetery"], isClass("Runecraft")),
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
    activated(
      { engageSelf: true },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          const banished = fx.game.cards(fx.controller, "banished").length;
          if (banished >= 5) yield* fx.dealDamage(fx.targets[0]![0]!, banished >= 10 ? 4 : 1);
        },
      },
    ),
  ],
});
