// BP16-100 Pact of the Beast Princess — Havencraft amulet, 2. 信仰.
// Whenever a Holy Tiger is put onto your field, select an enemy follower on the field and engage it. (Each copy
// triggers, also during the opponent's turn — rulings.)
// {[act]} {[cost02]}, engage this, bury another amulet: Summon a Holy Tiger token. (An amulet on your field, CR 10.4.3.)
import { buryAnotherFromYourField } from "../costs";
import { activated, defineCard, whenFollowerEntersYourField } from "../helpers";
import { enemyFollower, isAmulet, named } from "../targets";
import { HOLY_TIGER } from "./shared";

export default defineCard({
  abilities: [
    whenFollowerEntersYourField(
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.engage(fx.targets[0]!);
        },
      },
      { filter: named(HOLY_TIGER) },
    ),
    activated(
      { playPoints: 2, engageSelf: true, custom: buryAnotherFromYourField(isAmulet) },
      {
        *resolve(fx) {
          yield* fx.summon([HOLY_TIGER]);
        },
      },
    ),
  ],
});
