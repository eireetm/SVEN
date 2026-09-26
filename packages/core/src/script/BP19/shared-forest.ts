// Shared pieces of BP19 Forestcraft card scripts (not a card: the file name has no set prefix).
import { whenYourFollowerEvolves } from "../helpers";
import { enemyFollower } from "../targets";
import { condemnedFollower } from "./shared";

/** BP19-005 / 006 "Whenever a Condemned follower on your field evolves, Combo (3) - Draw a card." (Super-evolving too.) */
export const lieutenantDraw = whenYourFollowerEvolves(
  {
    *resolve(fx) {
      if (fx.game.combo(fx.controller, 3)) yield* fx.draw(1);
    },
  },
  condemnedFollower,
);

/**
 * BP19-011 "Whenever a Condemned follower on your field evolves, select an enemy follower on the field. Combo (3) - Deal it 3
 * damage." (During the opponent's turn and super-evolving too — rulings.)
 */
export const assassinStrike = whenYourFollowerEvolves(
  {
    targets: [enemyFollower()],
    *resolve(fx) {
      if (fx.game.combo(fx.controller, 3)) yield* fx.dealDamage(fx.targets[0]![0]!, 3);
    },
  },
  condemnedFollower,
);
