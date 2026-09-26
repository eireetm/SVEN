// BP18-019 Airbound Barrage — Forestcraft spell, 1. エルフ族・狩人.
// Select a {[forestcraft]} card on your field and an enemy follower on the field. Return the first card to its owner's hand
// and deal 3 damage to the second. (Playable only if both can be selected — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower, isClass, yourCardOnField } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [yourCardOnField({ filter: isClass("Forestcraft") }), enemyFollower()],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
        yield* fx.dealDamage(fx.targets[1]![0]!, 3);
      },
    }),
  ],
});
