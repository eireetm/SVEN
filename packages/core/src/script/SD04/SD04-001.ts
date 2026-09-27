// SD04-001 Fafnir — Dragoncraft follower, 8, 7/8. 竜族.
// {[fanfare]} Deal 5 damage to each enemy follower on the field. (Aura doesn't stop it — ruling.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 5);
      },
    }),
  ],
});
