// BP13-104 Sealed Tome — Havencraft amulet, 1. 狂信.
// {[act]} {[cost05]}, {[engage]}, bury this card: Select an enemy follower on the field and destroy it.
// {[lastwords]} Give your leader {[defense]}+1. Draw a card.
import { activated, defineCard, lastWords } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    activated(
      { playPoints: 5, engageSelf: true, burySelf: true },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.destroy(fx.targets[0]!);
        },
      },
    ),
    lastWords({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
        yield* fx.draw(1);
      },
    }),
  ],
});
