// BP11-091 Paladin of Clemency — Havencraft follower, 2, 2/2. 信仰.
// {[fanfare]} Give your leader {[defense]}+1. Draw a card. Discard a card.
// {[act]} {[cost02]}: Select an enemy follower on the field. Deal it 2 damage and give your leader
// {[defense]}+1. (Not playable without a target — ruling.)
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
        yield* fx.draw(1);
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
    activated(
      { playPoints: 2 },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 2);
          yield* fx.giveLeaderDefense(fx.controller, 1);
        },
      },
    ),
  ],
});
