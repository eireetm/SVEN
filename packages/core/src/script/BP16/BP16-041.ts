// BP16-041 Zizdvend, Fate's Arbiter (Evolved) — Runecraft follower, 4/4. 宴楽・禁忌.
// On Evolve - Select an enemy follower on the field and deal it damage equal to 2 times the number of Festive
// followers on your field. (This one counts.)
// At the start of your end phase, deal each enemy leader damage equal to the number of other Festive followers on
// your field.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { festive } from "./shared";
import { zizdvendVerdict } from "./shared-rune";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const festiveFollowers = fx.game.followers(fx.controller).filter((id) => festive(fx.game, id)).length;
        yield* fx.dealDamage(fx.targets[0]![0]!, 2 * festiveFollowers);
      },
    }),
    zizdvendVerdict,
  ],
});
