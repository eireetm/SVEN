// BP01-018 Archer — Forestcraft follower, 2, 1/4.
// {[evolve]}{[cost01]}: Evolve this follower.
// Whenever another follower is put onto your field, select an enemy follower on the field and
// deal it 1 damage. (Triggers once per follower; each Archer triggers — rulings.)
import { defineCard, evolveAbility, whenFollowerEntersYourField } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    whenFollowerEntersYourField(
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 1);
        },
      },
      { another: true },
    ),
  ],
});
