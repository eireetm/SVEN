// BP16-115 Phildau, Lionheart Ward (Evolved) — Neutral follower, 4/4. シンガー・光輝.
// Ward.
// On Evolve - Select an enemy follower on the field and deal it 3 damage.
// On Super-Evolve - Select an enemy card on the field and destroy it.
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { enemyCardOnField, enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
    onSuperEvolve({
      targets: [enemyCardOnField()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
      },
    }),
  ],
});
