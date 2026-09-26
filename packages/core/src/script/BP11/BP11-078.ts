// BP11-078 Gold Mine Necromancer — Abysscraft follower, 5, 4/5. 荒野・死霊術師.
// {[fanfare]} Select an enemy follower on the field and a Wasteland follower that costs 3 or less in your
// cemetery. Necrocharge (10) - Deal 4 damage to the first follower and summon the second. (Only when both
// can be selected — ruling.)
import { defineCard, fanfare } from "../helpers";
import { and, costAtMost, enemyFollower, inYourZone } from "../targets";
import { wastelandFollower } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower(), inYourZone("cemetery", { filter: and(wastelandFollower, costAtMost(3)) })],
      *resolve(fx) {
        if (!fx.game.necrocharge(fx.controller, 10)) return;
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        yield* fx.putOntoField(fx.targets[1]!);
      },
    }),
  ],
});
