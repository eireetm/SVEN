// BP11-085 Spiderweb Array — Abysscraft spell, 2. 魔界.
// Select an enemy follower on the field. {[engage]} it and draw a card. It doesn't refresh during its
// controller's next start phase. (An engaged one can be selected: the rest applies — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.engage([target]);
        yield* fx.skipNextRefresh(target);
        yield* fx.draw(1);
      },
    }),
  ],
});
