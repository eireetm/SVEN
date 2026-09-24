// BP05-041 Destructive Refrain — Runecraft spell, 1. 絶傑・アイドル.
// Choose one of the following. (1) Search your deck for a Lishenna, Omen of Destruction, reveal it,
// add it to your hand, then shuffle your deck. (2) {[cost02]}: Deal X damage to each enemy follower
// on the field. X equals the number of Idolatry cards on your field.
// Rulings: (2)'s cost is optional (not paying does nothing) and can't be made 0 by "play it for 0".
import { defineCard, spell } from "../helpers";
import { playPointsCost } from "../costs";
import { named } from "../targets";
import { idolatryOnField } from "./shared";

export default defineCard({
  abilities: [
    spell({
      modes: [
        {
          id: "search",
          label: "Search for a Lishenna, Omen of Destruction",
          *resolve(fx) {
            yield* fx.search((id) => named("Lishenna, Omen of Destruction")(fx.game, id));
          },
        },
        {
          id: "damage",
          label: "Pay 2: deal X damage to each enemy follower",
          cost: playPointsCost(2),
          *resolve(fx) {
            yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), idolatryOnField(fx.game, fx.controller));
          },
        },
      ],
    }),
  ],
});
