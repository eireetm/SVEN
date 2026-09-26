// BP15-042 Noble Shikigami — Runecraft advanced follower, 10, 5/5. 式神.
// Ward.
// This doesn't take ability damage. (All damage but combat damage and attack damage to a leader — ruling.)
// {[fanfare]} Deal 5 damage to each enemy leader and enemy follower on the field.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  field: { damageTaken: (_g, _self, damage) => (damage.kind === "ability" ? -damage.amount : 0) },
  abilities: [
    fanfare({
      *resolve(fx) {
        const opp = fx.game.opponent(fx.controller);
        yield* fx.dealDamageEach([fx.game.leader(opp), ...fx.game.followers(opp)], 5);
      },
    }),
  ],
});
