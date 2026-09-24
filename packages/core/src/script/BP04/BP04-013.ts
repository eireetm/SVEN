// BP04-013 Elf Song — Forestcraft spell, 2. 妖精.
// Summon a Fairy token. Combo (3): Give each Forestcraft follower on your field +1/+1.
// Playable with a full field; the Combo part still works, and a Fairy it summoned gets +1/+1 too
// (rulings).
import { defineCard, spell } from "../helpers";
import { isClass } from "../targets";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.summon(["Fairy"]);
        if (!fx.game.combo(fx.controller, 3)) return;
        for (const id of fx.game.followers(fx.controller)) {
          if (isClass("Forestcraft")(fx.game, id)) yield* fx.giveStats(id, 1, 1);
        }
      },
    }),
  ],
});
