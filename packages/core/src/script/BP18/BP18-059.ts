// BP18-059 El, Destructive Dragon (Evolved) — 4/4.
// On Evolve - Look at the top 3 cards of your deck. You may put a Draconic Duelist card from among them into your EX area.
// It costs 3 less to play this turn. Put the rest on the bottom of your deck in any order.
// On Super-Evolve - Put a Youthful Strike token into your EX area.
import { defineCard, lookAtTopCards, onEvolve, onSuperEvolve } from "../helpers";
import { draconicDuelist } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const put = yield* lookAtTopCards(fx, 3, { filter: draconicDuelist, to: "ex" });
        for (const id of put) yield* fx.changePlayCost(id, -3, "endOfTurn");
      },
    }),
    onSuperEvolve({
      *resolve(fx) {
        yield* fx.tokensToEx(["Youthful Strike"]);
      },
    }),
  ],
});
