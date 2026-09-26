// BP10-024 Prudent General (Evolved) — Swordcraft follower, 4/4. アルカナ・指揮官.
// Each {[swordcraft]} token on your field has Rush.
// On Evolve - Summon a Steelclad Knight token. Give each Steelclad Knight on your field {[attack]}
// +1/{[defense]}+1 (Also with a full field — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { named } from "../targets";
import { swordcraftTokensHaveRush } from "./shared";

export default defineCard({
  field: { keywordsFor: swordcraftTokensHaveRush },
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon(["Steelclad Knight"]);
        for (const id of fx.game.followers(fx.controller)) if (named("Steelclad Knight")(fx.game, id)) yield* fx.giveStats(id, 1, 1);
      },
    }),
  ],
});
