// BP16-029 Luminous Magus — Swordcraft follower, 2, 1/1. 指揮官・ルミナス.
// {[fanfare]} Summon a Shield Guardian or Knight token.
// {[act]} {[cost00]}: Select an enemy follower on the field. Deal it 5 damage and draw a card. Activate only if
// there are at least 3 Officer token followers on your field with different names, and only once per turn. (Not
// without a target — ruling.)
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { KNIGHT, SHIELD_GUARDIAN } from "./shared";
import { oneOfTokens, threeOfficerNames } from "./shared-sword";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* oneOfTokens(fx, [SHIELD_GUARDIAN, KNIGHT], "field");
      },
    }),
    activated(
      { playPoints: 0 },
      {
        oncePerTurn: true,
        condition: threeOfficerNames,
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 5);
          yield* fx.draw(1);
        },
      },
    ),
  ],
});
