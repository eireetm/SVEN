// CP01-065 Matikanetannhauser — Abysscraft follower, 4, 4/4. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// {[fanfare]} Select an enemy amulet on the field and destroy it.
import { defineCard, fanfare, serveAbility } from "../helpers";
import { enemyCardOnField, isAmulet } from "../targets";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    fanfare({
      targets: [enemyCardOnField({ filter: isAmulet })],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
      },
    }),
  ],
});
