// BP17-084 Allure of Shadows — Abysscraft spell, 2. 死霊術師.
// Select an enemy follower on the field and deal it 4 damage. Necrocharge (10) - Search your deck for a Luna, Soul Keeper,
// summon it, then shuffle. (Can't be played without a target — ruling, CR 10.6.2.3; Necrocharge is counted as the effect
// begins, CR 13.5.1.3.2.)
import { defineCard, spell } from "../helpers";
import { enemyFollower, named } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const nc = fx.game.necrocharge(fx.controller, 10);
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        if (nc) yield* fx.search((id) => named("Luna, Soul Keeper")(fx.game, id), { to: "field" });
      },
    }),
  ],
});
