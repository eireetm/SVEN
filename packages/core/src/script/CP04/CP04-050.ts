// CP04-050 Yuki (Evolved) — Runecraft, 4/4. プリコネ・ヴァイスフリューゲル.
// {[ub]} On Evolve - Select an enemy follower on the field and give {[attack]}-2/{[defense]}-2.
import { defineCard, onEvolve, ub } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    ub(
      onEvolve({
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.giveStats(fx.targets[0]![0]!, -2, -2);
        },
      }),
    ),
  ],
});
