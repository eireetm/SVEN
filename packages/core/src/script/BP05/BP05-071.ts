// BP05-071 Rulenye, Omen of Silence (Evolved) — Abysscraft follower, 4/4. 絶傑・死霊術師.
// On Evolve: Each opponent discards a random card.
// While this card is on your field, any spell an opponent plays costs 1 more.
import { defineCard, onEvolve } from "../helpers";
import { opponentSpellsCostMore } from "./shared";

export default defineCard({
  field: opponentSpellsCostMore,
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.discardRandom(1, fx.game.opponent(fx.controller));
      },
    }),
  ],
});
