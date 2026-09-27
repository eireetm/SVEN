// ECP02-037 Fumika Sagisawa [Cinderella Girl] — Dragoncraft follower, 2, 2/2. デレマス・クール.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} If there are at least 3 Cool followers on your field, deal 1 damage to each enemy leader. (This follower counts.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { cool, damageEnemyLeader, followersOnYourField } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        if (followersOnYourField(fx.game, fx.controller, cool) >= 3) yield* damageEnemyLeader(fx, 1);
      },
    }),
  ],
});
