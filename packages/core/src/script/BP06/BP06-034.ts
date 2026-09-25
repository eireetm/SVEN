// BP06-034 Breakneck Draw — Swordcraft spell, 2. 兵士.
// {[engage]} a {[swordcraft]} follower on your field: Select an enemy follower on the field and
// destroy it. (Only your own follower pays — ruling; the engaging is optional and done while it
// resolves, CR 10.4.7.5, as for BP06-017.)
import { defineCard, spell } from "../helpers";
import { enemyFollower, isClass } from "../targets";
import { engageYourFollowers } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (yield* fx.optionalCost(engageYourFollowers(1, isClass("Swordcraft")))) yield* fx.destroy(fx.targets[0] ?? []);
      },
    }),
  ],
});
