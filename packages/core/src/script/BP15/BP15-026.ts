// BP15-026 Ultimate Hollow — Swordcraft spell, 1. 絶傑・盗賊・財宝.
// {[quick]}
// Select an enemy follower on the field. Deal it 2 damage and put a Gilded Goblet token into your EX area. (Not
// playable without a target — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { GILDED_GOBLET } from "./shared";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        yield* fx.tokensToEx([GILDED_GOBLET]);
      },
    }),
  ],
});
