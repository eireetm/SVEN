// BP02-044 Shadow Witch — Runecraft follower, 5, 5/5.
// {[fanfare]}, Earth Rite: Select an enemy follower on the field and banish it. (CR 13.3.3.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      earthRite: { mode: "required" },
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.banish(fx.targets[0]!);
      },
    }),
  ],
});
