// CP04-021 Christina — Swordcraft follower, 5, 4/4. プリコネ・NIGHTMARE・七冠.
// {[ub]} Strike - Discard a card: Select an enemy follower on the field and deal it 5 damage. (Not paying, it isn't executed —
// ruling.)
// Storm.
// {[fanfare]} {[cost02]} Equip this with a Sanctum Blade Avalon token.
import { discardCardsCost } from "../costs";
import { defineCard, equipFanfare, strike, ub } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    ub(
      strike({
        cost: discardCardsCost(1),
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 5);
        },
      }),
    ),
    equipFanfare("Sanctum Blade Avalon", 2),
  ],
});
