// BP20-080 Congregant of Entwining (Evolved) — 4/4.
// On Evolve - Choose one. (1) Select an enemy follower on the field and deal it 5 damage. (2) Select a 3-cost or less
// {[abysscraft]} Omen follower from your cemetery and summon it. (3) Give each {[abysscraft]} Omen follower on your field
// {[attack]}+1/{[defense]}+1. ((1) needs its target — ruling; 元のコスト.)
import { defineCard, onEvolve } from "../helpers";
import { and, costAtMost, enemyFollower, inYourZone, isFollower } from "../targets";
import { abyssOmen } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      modes: [
        {
          id: "damage",
          label: "(1) 5 damage to an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 5);
          },
        },
        {
          id: "summon",
          label: "(2) A 3-cost or less Abysscraft Omen follower from your cemetery",
          targets: [inYourZone("cemetery", { filter: and(isFollower, abyssOmen, costAtMost(3)) })],
          *resolve(fx) {
            yield* fx.putOntoField(fx.targets[0]!);
          },
        },
        {
          id: "buff",
          label: "(3) +1/+1 to each Abysscraft Omen follower of yours",
          *resolve(fx) {
            for (const id of fx.game.cards(fx.controller, "field").filter((c) => isFollower(fx.game, c) && abyssOmen(fx.game, c))) {
              yield* fx.giveStats(id, 1, 1);
            }
          },
        },
      ],
    }),
  ],
});
