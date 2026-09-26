// BP14-061 Dragonfolk Stoker (Evolved) — Dragoncraft follower, 3/3. 宴楽・ドラゴニュート.
// On Evolve - Select an enemy follower on the field and deal it 2 damage.
// Activate Remove 2 divine water counters from a Soothing Dragonspring on your field: Draw a card. Activate
// only once per turn. (Not without the counters — ruling.)
import { activated, defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { removeDivineWater } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
    activated(
      { custom: removeDivineWater },
      {
        oncePerTurn: true,
        *resolve(fx) {
          yield* fx.draw(1);
        },
      },
    ),
  ],
});
