// CP04-020 Pecorine (Evolved) — Swordcraft, 4/4. プリコネ・美食殿.
// {[ub]} On Evolve - Select an enemy follower on the field and deal it 4 damage.
// Ward.
// On Super-Evolve - Deal 4 damage to each enemy leader.
import { defineCard, onEvolve, onSuperEvolve, ub } from "../helpers";
import { enemyFollower } from "../targets";
import { damageEnemyLeader } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    ub(
      onEvolve({
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        },
      }),
    ),
    onSuperEvolve({
      *resolve(fx) {
        yield* damageEnemyLeader(fx, 4);
      },
    }),
  ],
});
