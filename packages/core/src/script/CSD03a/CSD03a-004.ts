// CSD03a-004 Blaster Blade (Evolved) — 4/4.
// Single Drive.
// On Evolve - Select an enemy follower on the field and deal it damage equal to 2 times the number of Royal Paladin followers on
// your field. (Counted when it resolves; this follower counts.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { followerThat, royalPaladin } from "../CP03/shared";

export default defineCard({
  keywords: ["singleDrive"],
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const paladins = fx.game.followers(fx.controller).filter((id) => followerThat(royalPaladin)(fx.game, id)).length;
        yield* fx.dealDamage(fx.targets[0]![0]!, 2 * paladins);
      },
    }),
  ],
});
