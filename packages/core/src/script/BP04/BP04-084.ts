// BP04-084 Stheno — Abysscraft follower, 5, 3/4. 魔界・ゴルゴーン.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Summon a Serpent token.
// Whenever a Serpent is put onto your field, select an enemy follower on the field and deal it 2
// damage.
import { defineCard, evolveAbility, fanfare, whenFollowerEntersYourField } from "../helpers";
import { enemyFollower, named } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Serpent"]);
      },
    }),
    whenFollowerEntersYourField(
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        },
      },
      { filter: named("Serpent") },
    ),
  ],
});
