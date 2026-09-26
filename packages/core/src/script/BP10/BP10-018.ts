// BP10-018 Fairy Assault — Forestcraft spell, 3. 妖精.
// Summon 2 Fairy tokens. Deal each enemy leader damage equal to the number of Pixie tokens on your
// field.
import { defineCard, spell } from "../helpers";
import { and, hasTrait, isToken } from "../targets";

const pixieToken = and(isToken, hasTrait("妖精"));

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.summon(["Fairy", "Fairy"]);
        const x = fx.game.cards(fx.controller, "field").filter((id) => pixieToken(fx.game, id)).length;
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), x);
      },
    }),
  ],
});
