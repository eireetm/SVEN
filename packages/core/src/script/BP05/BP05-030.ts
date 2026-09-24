// BP05-030 Captain Meteo — Swordcraft follower, 8, 7/7. 指揮官.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Select an enemy leader and deal it 4 damage.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyLeader } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyLeader()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
  ],
});
