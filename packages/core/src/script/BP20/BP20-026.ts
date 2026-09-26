// BP20-026 Returning Slash — Swordcraft spell, 2. 絶傑・盗賊・財宝.
// Select an enemy follower on the field and deal it 4 damage. If there's a follower with "Octrice" in its name on your
// field, put a Gilded Blade token into your EX area.
// Activate, Fuse 1 Loot card that costs at least 1: Give this "This costs 1 less to play." (Valid in the hand — ruling;
// CR 12.18; 元のコスト.)
import { fuse } from "../costs";
import { activated, defineCard, spell } from "../helpers";
import { and, costAtLeast, enemyFollower, isFollower, nameIncludes } from "../targets";
import { GILDED_BLADE, loot } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        const g = fx.game;
        if (g.cards(fx.controller, "field").some((id) => isFollower(g, id) && nameIncludes("Octrice")(g, id))) {
          yield* fx.tokensToEx([GILDED_BLADE]);
        }
      },
    }),
    activated(
      { custom: fuse(and(loot, costAtLeast(1)), 1) },
      {
        validIn: ["hand"],
        *resolve(fx) {
          const card = fx.memory.fusion;
          if (typeof card === "string") yield* fx.changePlayCost(card, -1);
        },
      },
    ),
  ],
});
