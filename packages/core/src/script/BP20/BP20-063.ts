// BP20-063 Ferocious Flame — Dragoncraft spell, 2. 絶傑・竜族.
// Select a follower on your field and an enemy follower on the field. Deal 1 damage to the first follower and 4 damage to the
// second. Draw a card. If you have a follower on your field with "Galmieux" in its name, increase your max play points by 1.
// (Both targets are needed — ruling; the damage is dealt at the same time, CR 5.14.)
import { defineCard, spell } from "../helpers";
import { enemyFollower, isFollower, nameIncludes, yourFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [yourFollower(), enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamages([
          { target: fx.targets[0]![0]!, amount: 1 },
          { target: fx.targets[1]![0]!, amount: 4 },
        ]);
        yield* fx.draw(1);
        const g = fx.game;
        if (g.cards(fx.controller, "field").some((id) => isFollower(g, id) && nameIncludes("Galmieux")(g, id))) yield* fx.increaseMaxPlayPoints(1);
      },
    }),
  ],
});
