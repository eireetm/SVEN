// BP06-047 Crimson Meteor Storm — Runecraft spell, 7. 魔法使い.
// Spellchain (10) - This card costs 2 less to play. (CR 13.3.1)
// Deal 6 damage to each enemy follower on the field. Deal 3 damage to each enemy leader.
import { defineCard, spell } from "../helpers";

export default defineCard({
  playCost: (g, _self, controller) => (g.spellchain(controller, 10) ? -2 : 0),
  abilities: [
    spell({
      *resolve(fx) {
        const opponent = fx.game.opponent(fx.controller);
        yield* fx.dealDamageEach(fx.game.followers(opponent), 6);
        yield* fx.dealDamage(fx.game.leader(opponent), 3);
      },
    }),
  ],
});
