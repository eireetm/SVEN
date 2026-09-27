// CP01-025 Biko Pegasus — Swordcraft follower, 1, 2/1. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// On Race: Select an enemy follower on the field and engage it.
import { defineCard, onRace, serveAbility } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    onRace({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.engage(fx.targets[0]!);
      },
    }),
  ],
});
