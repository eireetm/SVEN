// CP03-074 Demonic Dragon Berserker, Yaksha — Dragoncraft follower, 3, 3/3. ヴァンガード・かげろう.
// {[fanfare]} Choose one. (1) Select an enemy amulet on the field and destroy it. (2) Deal 2 damage to each enemy leader.
// (Without an enemy amulet (1) can't be chosen — ruling.)
import { defineCard, fanfare } from "../helpers";
import { enemyCardOnField, isAmulet } from "../targets";
import { damageEnemyLeader } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      modes: [
        {
          id: "1",
          label: "Destroy an enemy amulet",
          targets: [enemyCardOnField({ filter: isAmulet })],
          *resolve(fx) {
            yield* fx.destroy(fx.targets[0]!);
          },
        },
        {
          id: "2",
          label: "Deal 2 damage to each enemy leader",
          *resolve(fx) {
            yield* damageEnemyLeader(fx, 2);
          },
        },
      ],
    }),
  ],
});
