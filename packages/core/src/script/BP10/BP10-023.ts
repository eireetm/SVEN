// BP10-023 Prudent General — Swordcraft follower, 4, 3/3. アルカナ・指揮官.
// {[evolve]} {[cost01]}: Evolve this follower.
// Each {[swordcraft]} token on your field has Rush. (A token that attacks keeps attacking if it loses
// Rush — ruling.)
// {[fanfare]} Summon a Steelclad Knight token
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { swordcraftTokensHaveRush } from "./shared";

export default defineCard({
  field: { keywordsFor: swordcraftTokensHaveRush },
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Steelclad Knight"]);
      },
    }),
  ],
});
