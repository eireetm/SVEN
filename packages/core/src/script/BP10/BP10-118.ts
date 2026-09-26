// BP10-118 Angelic Strike — Neutral spell, 6. 天使.
// Select up to 2 enemy followers on the field. Destroy them and, if there's a Fallen Angel card in your
// cemetery, give your leader {[defense]}+2. (Playable selecting none — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower, hasTrait } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower({ count: 2, upTo: true })],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0] ?? []);
        if (fx.game.cards(fx.controller, "cemetery").some((id) => hasTrait("堕天使")(fx.game, id))) yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
