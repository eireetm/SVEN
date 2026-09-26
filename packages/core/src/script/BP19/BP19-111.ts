// BP19-111 Cutthroat, Discord Convict (Evolved) — 4/4.
// On Evolve - Select up to 2 enemy followers on the field and deal 4 damage divided between them.
// On Super Evolve - Select an enemy follower on the field and deal 8 damage to it and its leader.
// (Each selected follower gets at least 1, rulings BP08-028 / EBD02-015.)
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower({ count: 2, upTo: true, max: () => 4 })],
      *resolve(fx) {
        yield* fx.dealDividedDamage(fx.targets[0] ?? [], 4);
      },
    }),
    onSuperEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.dealDamageEach([target, fx.game.leader(fx.game.controller(target))], 8);
      },
    }),
  ],
});
