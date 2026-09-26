// BP12-083 Mechasaw Deathbringer — Abysscraft follower, 3, 1/1. 機械・死者.
// {[act]} {[cost01]}, bury this card: Bury the top 2 cards of your deck.
// {[lastwords]} Select an enemy follower on the field and destroy it. (Burying it as the cost triggers
// its Last Words, CR 12.5.1.)
import { activated, defineCard, lastWords } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    activated(
      { playPoints: 1, burySelf: true },
      {
        *resolve(fx) {
          yield* fx.mill(2);
        },
      },
    ),
    lastWords({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
      },
    }),
  ],
});
