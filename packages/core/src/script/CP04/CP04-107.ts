// CP04-107 Kurumi — Havencraft follower, 1, 2/2. プリコネ・サレンディア救護院.
// {[ub]}{[fanfare]} Select an enemy follower on the field and engage it. (Without one it isn't executed — ruling.)
import { defineCard, fanfare, ub } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    ub(
      fanfare({
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.engage(fx.targets[0]!);
        },
      }),
    ),
  ],
});
