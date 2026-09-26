// BP14-023 Jiemon, Thief Lord (Evolved) — Swordcraft follower, 4/5. 宴楽・指揮官・盗賊.
// Each other Festive follower on your field has Storm.
// On Evolve - Banish 2 cards named Glittering Gold from your EX area: Look at the top 5 cards of your deck.
// You may put a Festive card that costs 3 or less from among them into your EX area. It costs 3 less to
// play this turn. Put the rest on the bottom of your deck in any order.
// {[act]} {[cost01]}: Play this follower's On Evolve ability. (It is played, not triggered, so effects
// against On Evolve triggers don't stop it; its cost must still be paid — rulings.)
import { activated, defineCard, onEvolve } from "../helpers";
import { banishTwoGold, jiemonDig, otherFestiveHaveStorm } from "./shared-sword";

export default defineCard({
  field: { keywordsFor: otherFestiveHaveStorm },
  abilities: [
    onEvolve({
      cost: banishTwoGold,
      *resolve(fx) {
        yield* jiemonDig(fx);
      },
    }),
    activated(
      { playPoints: 1 },
      {
        *resolve(fx) {
          if (yield* fx.optionalCost(banishTwoGold)) yield* jiemonDig(fx);
        },
      },
    ),
  ],
});
