// CP04-043 Precia — Runecraft follower, 2, 2/3. プリコネ・アルターメイデン.
// {[ub]}{[fanfare]} Select an enemy follower on the field. Deal it damage equal to the number of other followers on your field and,
// if {[ub]} abilities you control have executed at least 2 other times this turn, draw a card. (Without an enemy follower it isn't
// played, so nothing is drawn — ruling.)
import { defineCard, fanfare, ub } from "../helpers";
import { enemyFollower } from "../targets";
import { otherUnionBursts } from "./shared";

export default defineCard({
  abilities: [
    ub(
      fanfare({
        targets: [enemyFollower()],
        *resolve(fx) {
          const others = fx.game.followers(fx.controller).filter((id) => id !== fx.self).length;
          yield* fx.dealDamage(fx.targets[0]![0]!, others);
          if (otherUnionBursts(fx) >= 2) yield* fx.draw(1);
        },
      }),
    ),
  ],
});
