// BP15-PR16 Torrent of Despair — Havencraft spell token, 0. 絶傑・狂信.
// Select an enemy follower on the field and banish it.
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.banish(fx.targets[0]!);
      },
    }),
  ],
});
