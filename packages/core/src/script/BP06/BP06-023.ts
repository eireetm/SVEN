// BP06-023 Hero of Antiquity (Evolved) — Swordcraft follower, 7/11. 兵士.
// Aura.
// This card can't be destroyed or banished by abilities.
// On Evolve: Select an enemy follower on the field and destroy it. If it costs 6 or more, banish it
// instead. (元のコスト: printed cost.)
import { defineCard, onEvolve } from "../helpers";
import { costAtLeast, enemyFollower } from "../targets";

export default defineCard({
  keywords: ["aura"],
  cannotBeDestroyedByAbilities: true,
  cannotBeBanishedByAbilities: true,
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        if (fx.game.card(target)?.zone !== "field") return;
        if (costAtLeast(6)(fx.game, target)) yield* fx.banish([target]);
        else yield* fx.destroy([target]);
      },
    }),
  ],
});
