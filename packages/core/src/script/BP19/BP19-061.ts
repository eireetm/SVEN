// BP19-061 Scorched-Earth Tyrant (Evolved) — 5/5.
// On Evolve - Select an enemy follower on the field and deal it 4 damage.
// {[lastwords]} Put this into its owner's EX area. (The unevolved card; the evolved card returns to the evolve deck.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { backToEx } from "./shared-dragon";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
    backToEx,
  ],
});
