// BP07-071 Kudlak — Abysscraft follower, 7, 4/6. 吸血鬼.
// {[fanfare]} Select up to 2 Vampire cards that cost a total of 6 or less in your cemetery and put
// them into your EX area. They cost 0 play points to play this turn. (元のコスト.)
// Activate {[engage]}: Select an enemy follower on the field and deal it damage equal to the number
// of Vampire cards on your field. (This one too.)
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower, hasTrait } from "../targets";
import { countIn, selectWithinTotalCost } from "./shared";

const vampire = hasTrait("吸血鬼");

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const vampires = fx.game.cards(fx.controller, "cemetery").filter((id) => vampire(fx.game, id));
        const chosen = yield* selectWithinTotalCost(fx, vampires, 6, 2);
        for (const id of yield* fx.putIntoEx(chosen)) yield* fx.setPlayCost(id, 0, "endOfTurn");
      },
    }),
    activated(
      { engageSelf: true },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, countIn(fx.game, fx.controller, "field", vampire));
        },
      },
    ),
  ],
});
