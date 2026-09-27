// SD06-005 Acolyte's Light — Havencraft spell, 4. 信仰. {[quick]}
// Select an enemy follower on the field. Banish it and give your leader {[defense]}+2. (Not playable without a follower to select
// — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.banish(fx.targets[0]!);
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
