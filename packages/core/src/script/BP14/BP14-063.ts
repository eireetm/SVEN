// BP14-063 March of the Dragonspring — Dragoncraft spell, 4. 宴楽・竜族.
// When playing this, remove 2 divine water counters from a Soothing Dragonspring on your field: This costs 2
// less to play. (CR 10.4.7.3; not without the counters — ruling.)
// ----------
// Select an enemy follower on the field. Destroy it and draw a card. (Not playable without a target — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { removeDivineWater } from "./shared";

export default defineCard({
  playOptions: [{ id: "water", label: "Remove 2 divine water counters: 2 less", ...removeDivineWater, costDelta: -2 }],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
        yield* fx.draw(1);
      },
    }),
  ],
});
