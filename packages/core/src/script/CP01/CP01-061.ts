// CP01-061 Curren Chan — Abysscraft follower, 1, 1/1. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// {[act]} {[cost01]}, {[engage]}: Select an enemy follower on the field. Deal it 1 damage and put the top card of your deck into your
// cemetery. (Not playable without a target — ruling.)
import { activated, defineCard, serveAbility } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    activated(
      { playPoints: 1, engageSelf: true },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 1);
          yield* fx.mill(1);
        },
      },
    ),
  ],
});
