// BP08-051 Joy of Destruction — Runecraft spell, 0. 絶傑・アイドル.
// If there's an Idolatry card on your field, recover 1 play point. If there's a Lishenna, Omen of
// Destruction on your field, draw a card. (Both apply when both hold, and it can be played with
// neither — rulings.)
import { defineCard, spell } from "../helpers";
import { hasTrait, named } from "../targets";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const field = fx.game.cards(fx.controller, "field");
        if (field.some((id) => hasTrait("アイドル")(fx.game, id))) yield* fx.recoverPlayPoints(1);
        if (field.some((id) => named("Lishenna, Omen of Destruction")(fx.game, id))) yield* fx.draw(1);
      },
    }),
  ],
});
