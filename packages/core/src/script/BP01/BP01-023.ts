// BP01-023 Fairy Circle — Forestcraft spell, 1.
// Put 3 Fairy tokens into your EX area. (Only as many as the EX area holds — ruling, CR 4.8.3.2.)
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.tokensToEx(["Fairy", "Fairy", "Fairy"]);
      },
    }),
  ],
});
