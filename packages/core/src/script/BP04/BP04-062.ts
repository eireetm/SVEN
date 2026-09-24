// BP04-062 Lævateinn Dragon, Blast Form — Dragoncraft evolved follower, 6/6. 竜族・武装.
// Evolved into from BP03-056 ("an evolved follower with Lævateinn Dragon in its name").
// Intimidate.
// On Evolve: Deal X damage to each enemy follower on the field. X equals 2 times the number of
// Armed followers on your field (this one included — ruling).
// This follower's name is also Lævateinn Dragon (on the field only).
import { defineCard, onEvolve } from "../helpers";
import { hasTrait } from "../targets";

export default defineCard({
  keywords: ["intimidate"],
  alsoNames: ["Lævateinn Dragon"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        const armed = fx.game.followers(fx.controller).filter((id) => hasTrait("武装")(fx.game, id)).length;
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 2 * armed);
      },
    }),
  ],
});
