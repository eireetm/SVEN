// BP17-071 Mermaid Archer — Dragoncraft follower, 2, 0/4. 海洋.
// Activate {[engage]} this,put a Marine card from your hand into your EX area: Select an enemy follower on the field and deal
// it damage equal to the number of Marine followers on your field. (A full EX area can't pay — ruling.)
import { activated, defineCard } from "../helpers";
import { enemyFollower, isFollower } from "../targets";
import { countIn, marine } from "./shared";
import { putFromHandIntoEx } from "./shared-dragon";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true, custom: putFromHandIntoEx(marine) },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          const x = countIn(fx.game, fx.controller, "field", (g, id) => isFollower(g, id) && marine(g, id));
          yield* fx.dealDamage(fx.targets[0]![0]!, x);
        },
      },
    ),
  ],
});
