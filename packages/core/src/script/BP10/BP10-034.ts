// BP10-034 Selfless Noble — Swordcraft follower, 7, 7/6. アルカナ・貴族.
// {[fanfare]} Select an enemy follower on the field. Destroy it, discard your hand, then draw 3 cards.
// (Without a target none of it happens — ruling, CR 10.6.2.3.3.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
        yield* fx.discardHand();
        yield* fx.draw(3);
      },
    }),
  ],
});
