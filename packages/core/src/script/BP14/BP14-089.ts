// BP14-089 All-Feeling Divine (Evolved) — Havencraft follower, 4/4. 宴楽・狂信・偶像.
// On Evolve - Select an enemy follower on the field and deal it damage equal to 2 times the number of Zealot
// followers on your field.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { zealot } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const count = fx.game.followers(fx.controller).filter((id) => zealot(fx.game, id)).length;
        yield* fx.dealDamage(fx.targets[0]![0]!, 2 * count);
      },
    }),
  ],
});
