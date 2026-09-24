// BP02-055 Neptune — Dragoncraft follower, 5, 4/4.
// {[evolve]}{[cost02]}: Evolve this follower. // Ward.
// {[fanfare]} Summon a Megalorca token.
// While this card is on your field, your Megalorca tokens have Rush. (CR 10.9.1.2)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { yourTokensNamed } from "./shared";

export default defineCard({
  keywords: ["ward"],
  field: { keywordsFor: (g, self, card) => (yourTokensNamed(g, self, card, "Megalorca") ? ["rush"] : []) },
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Megalorca"]);
      },
    }),
  ],
});
