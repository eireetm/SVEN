// BP12-031 Sheena, Maid of the Mists — Swordcraft follower, 2, 3/2. 兵士・メイド.
// Rush.
// {[fanfare]} Select an enemy follower on the field and deal it 1 damage. If there's an Azord, Duke of the
// Mists on your field, deal 5 damage instead.
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { AZORD, onYourField } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, onYourField(fx.game, fx.controller, AZORD) ? 5 : 1);
      },
    }),
  ],
});
