// BP04-103 Andromeda — Havencraft follower, 1, 2/2. 星神・プリンセス.
// {[fanfare]} For the rest of this turn, your leader and each follower currently on your field
// (including this one) have "This doesn't take ability damage."
// Only the followers on the field now (ruling). Ability damage is all damage except combat damage
// between followers and attack damage to a leader (ruling); -X/-X is not damage (ruling).
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        for (const id of [fx.game.leader(fx.controller), ...fx.game.followers(fx.controller)]) {
          yield* fx.preventDamage(id, "ability", "endOfTurn");
        }
      },
    }),
  ],
});
