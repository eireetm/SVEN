// CP04-092 Saren (Evolved) — Havencraft, 4/4. プリコネ・サレンディア救護院.
// {[ub]} On Evolve - Select an enemy follower on the field. Deal 4 damage to it and 1 damage to each other enemy follower on the
// field. (At the same time.)
// On Super-Evolve - Deal 2 damage to each enemy leader and enemy follower on the field.
import { defineCard, onEvolve, onSuperEvolve, ub } from "../helpers";
import { enemyFollower } from "../targets";
import { damageEnemies } from "./shared";

export default defineCard({
  abilities: [
    ub(
      onEvolve({
        targets: [enemyFollower()],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          const others = fx.game.followers(fx.game.opponent(fx.controller)).filter((id) => id !== target);
          yield* fx.dealDamages([{ target, amount: 4 }, ...others.map((id) => ({ target: id, amount: 1 }))]);
        },
      }),
    ),
    onSuperEvolve({
      *resolve(fx) {
        yield* damageEnemies(fx, 2);
      },
    }),
  ],
});
