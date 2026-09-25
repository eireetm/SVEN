// BP09-051 Staff of Whirlwinds — Runecraft spell, 4. 魔法使い.
// Deal each enemy leader and enemy follower on the field damage equal to the number of {[runecraft]}
// followers on your field.
import { defineCard, spell } from "../helpers";
import { isClass } from "../targets";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const opp = fx.game.opponent(fx.controller);
        const x = fx.game.followers(fx.controller).filter((id) => isClass("Runecraft")(fx.game, id)).length;
        yield* fx.dealDamageEach([fx.game.leader(opp), ...fx.game.followers(opp)], x);
      },
    }),
  ],
});
