// BP07-027 Valse, Champion Deadeye — Swordcraft follower, 2, 2/3. 兵士.
// {[act]} {[cost01]}, {[engage]}: Select an enemy leader or enemy follower on the field and deal it
// damage equal to this follower's attack.
// {[act]} {[cost03]}, {[engage]}: Select an enemy amulet on the field and banish it.
import { activated, defineCard } from "../helpers";
import { enemyCardOnField, enemyLeaderOrFollower, isAmulet } from "../targets";

export default defineCard({
  abilities: [
    activated(
      { playPoints: 1, engageSelf: true },
      {
        targets: [enemyLeaderOrFollower()],
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone !== "field") return;
          yield* fx.dealDamage(fx.targets[0]![0]!, fx.game.info(fx.self).attack ?? 0);
        },
      },
    ),
    activated(
      { playPoints: 3, engageSelf: true },
      {
        targets: [enemyCardOnField({ filter: isAmulet })],
        *resolve(fx) {
          yield* fx.banish(fx.targets[0]!);
        },
      },
    ),
  ],
});
