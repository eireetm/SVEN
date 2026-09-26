// BP18-099 Tenmei, Insatiable Adjudicator — Havencraft follower, 4, 4/4. 透京・信仰.
// Whenever your leader gains {[defense]}, select an enemy follower on the field and deal it 2 damage.
// {[act]} {[cost00]}: Deal damage to each enemy leader equal to the number of Togh Keyoh followers on your field. Give your
// leader {[defense]}+1. Activate only once per turn.
import { activated, defineCard } from "../helpers";
import { judgment, toghKeyohFollowers } from "./shared-haven";

export default defineCard({
  abilities: [
    judgment,
    activated(
      { playPoints: 0 },
      {
        oncePerTurn: true,
        *resolve(fx) {
          const n = toghKeyohFollowers(fx.game, fx.controller);
          if (n > 0) yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), n);
          yield* fx.giveLeaderDefense(fx.controller, 1);
        },
      },
    ),
  ],
});
