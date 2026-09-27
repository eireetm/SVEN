// CP04-055 Sheffy — Dragoncraft follower, 2, 2/2. プリコネ・美食殿.
// {[ub]}{[fanfare]} Select an enemy follower on the field. It doesn't refresh during its controller's next start phase.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} If Overflow is active for you, equip this with an Eisdrache token.
import { defineCard, equipFanfare, evolveAbility, fanfare, ub } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    ub(
      fanfare({
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.skipNextRefresh(fx.targets[0]![0]!);
        },
      }),
    ),
    evolveAbility(1),
    equipFanfare("Eisdrache", 0, (fx) => fx.game.overflow(fx.controller)),
  ],
});
