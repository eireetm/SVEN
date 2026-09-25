// BP07-046 Mechastaff Sorcerer — Runecraft follower, 2, 2/2. 機械・魔法使い.
// {[fanfare]} Put an Assembly Droid or Repair Mode token into your EX area.
// Activate {[engage]}, banish a Machina card from your EX area: Select and enemy follower on the
// field and deal it damage equal to the number of Machina cards in your EX area. (Counted after the
// cost — ruling.)
import { banishFromYourEx } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { countIn, droidOrRepairToEx, machina } from "./shared";

export default defineCard({
  abilities: [
    fanfare({ resolve: droidOrRepairToEx }),
    activated(
      { engageSelf: true, custom: banishFromYourEx(machina) },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, countIn(fx.game, fx.controller, "ex", machina));
        },
      },
    ),
  ],
});
