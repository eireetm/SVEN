// CP04-082 Yori (Evolved) — Abysscraft, 3/3. プリコネ・ディアボロス.
// {[ub]} On Evolve - Select an enemy follower on the field and deal it 2 damage.
import { defineCard, onEvolve, ub } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    ub(
      onEvolve({
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        },
      }),
    ),
  ],
});
