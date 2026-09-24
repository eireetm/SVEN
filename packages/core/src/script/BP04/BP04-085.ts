// BP04-085 Stheno (Evolved) — Abysscraft, 4/5.
// On Evolve: Summon a Serpent token.
// Whenever a Serpent is put onto your field, select an enemy follower on the field and deal it 2
// damage.
import { defineCard, onEvolve, whenFollowerEntersYourField } from "../helpers";
import { enemyFollower, named } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
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
