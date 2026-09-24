// BP02-056 Neptune (Evolved) — 5/5.
// Ward. // On Evolve: Summon a Megalorca token.
// While this card is on your field, your Megalorca tokens have Storm. (CR 10.9.1.2)
import { defineCard, onEvolve } from "../helpers";
import { yourTokensNamed } from "./shared";

export default defineCard({
  keywords: ["ward"],
  field: { keywordsFor: (g, self, card) => (yourTokensNamed(g, self, card, "Megalorca") ? ["storm"] : []) },
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon(["Megalorca"]);
      },
    }),
  ],
});
