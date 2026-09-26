// BP14-017 Elven Craftsmanship — Forestcraft spell, 2. エルフ族・狩人.
// {[quick]}
// Select an enemy follower on the field. Deal it 3 damage, draw a card, then discard a card. (Not playable
// without a target — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        yield* fx.draw(1);
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
  ],
});
