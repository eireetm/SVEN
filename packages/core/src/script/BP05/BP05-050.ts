// BP05-050 Honest Cohort — Runecraft spell, 2. 絶傑・魔法使い.
// Quick.
// Select an enemy follower on the field and deal it 3 damage. If there is a Raio, Omen of Truth on
// your field, deal 6 damage to the selected follower and 3 damage to its leader instead.
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { onYourField } from "./shared";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        if (!onYourField(fx.game, fx.controller, "Raio, Omen of Truth")) {
          yield* fx.dealDamage(target, 3);
          return;
        }
        yield* fx.dealDamages([
          { target, amount: 6 },
          { target: fx.game.leader(fx.game.controller(target)), amount: 3 },
        ]);
      },
    }),
  ],
});
