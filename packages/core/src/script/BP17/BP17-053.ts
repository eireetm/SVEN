// BP17-053 Panacea Alchemist — Runecraft follower, 5, 5/5. 錬金術師.
// {[fanfare]} Choose 1. (1) Give your leader {[defense]}+5. (2) {[cost02]}: Deal 5 damage to each enemy follower on the
// field. (The option's cost is asked as it resolves, CR 10.4.7.5.)
import { playPointsCost } from "../costs";
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      modes: [
        {
          id: "leader",
          label: "(1) Leader +5",
          *resolve(fx) {
            yield* fx.giveLeaderDefense(fx.controller, 5);
          },
        },
        {
          id: "damage",
          label: "(2) (2): 5 damage to each enemy follower",
          cost: playPointsCost(2),
          *resolve(fx) {
            yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 5);
          },
        },
      ],
    }),
  ],
});
