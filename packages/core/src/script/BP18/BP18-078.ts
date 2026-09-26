// BP18-078 Ilze & Urze, Centennial Reapers (Evolved) — 4/4.
// On Evolve - Look at the top 5 cards of your deck. You may put an {[abysscraft]} card that costs 2 or less or Togh Keyoh
// card that costs 2 or less from among them into your EX area. It costs 2 less to play this turn. Put the rest on the
// bottom of your deck in any order. (元のコスト.)
// On Super-Evolve - Put a Diurnal Slumber token into your EX area.
import { defineCard, lookAtTopCards, onEvolve, onSuperEvolve } from "../helpers";
import { costAtMost, isClass } from "../targets";
import { toghKeyoh } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const put = yield* lookAtTopCards(fx, 5, {
          filter: (g, id) => costAtMost(2)(g, id) && (isClass("Abysscraft")(g, id) || toghKeyoh(g, id)),
          to: "ex",
        });
        for (const id of put) yield* fx.changePlayCost(id, -2, "endOfTurn");
      },
    }),
    onSuperEvolve({
      *resolve(fx) {
        yield* fx.tokensToEx(["Diurnal Slumber"]);
      },
    }),
  ],
});
