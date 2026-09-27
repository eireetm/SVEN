// CP01-012 Taiki Shuttle — Forestcraft follower, 2, 2/3. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// When this card is returned to hand from your field, select an enemy follower on the field and deal it 2 damage.
import { defineCard, serveAbility, whenReturnedToHand } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    whenReturnedToHand({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
