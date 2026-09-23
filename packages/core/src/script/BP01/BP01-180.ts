// BP01-180 Angelic Barrage — Neutral spell, 1. {[quick]}
// Deal 1 damage to each enemy follower on the field. (Aura does not stop it — ruling.)
import { defineCard, spell } from "../helpers";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 1);
      },
    }),
  ],
});
