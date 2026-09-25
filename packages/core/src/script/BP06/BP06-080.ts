// BP06-080 Kasha — Abysscraft follower, 2, 3/1. 妖怪.
// {[fanfare]} Choose one of the following. (1) Select an enemy follower on the field. Deal it 1
// damage and bury the top card of your deck. (2) Select a Yokai follower not named Kasha in your
// cemetery and add it to your hand. (An option without a target can't be chosen — ruling.)
import { defineCard, fanfare } from "../helpers";
import { and, enemyFollower, hasTrait, inYourZone, isFollower, named } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      modes: [
        {
          id: "damage",
          label: "Deal 1 damage to an enemy follower and bury the top card of your deck",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 1);
            yield* fx.mill(1);
          },
        },
        {
          id: "return",
          label: "Add a Yokai follower from your cemetery to your hand",
          targets: [inYourZone("cemetery", { filter: and(isFollower, hasTrait("妖怪"), (g, id) => !named("Kasha")(g, id)) })],
          *resolve(fx) {
            yield* fx.returnToHand(fx.targets[0] ?? []);
          },
        },
      ],
    }),
  ],
});
