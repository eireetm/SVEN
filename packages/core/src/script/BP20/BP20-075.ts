// BP20-075 Rulenye & Valnareik (Evolved) — 3/3.
// On Evolve - Choose one. (1) Summon 2 Rulenye, Echoing Scream tokens. (2) Give this Storm and each {[abysscraft]} Omen
// follower on your field {[attack]}+1. (This one too.)
import { defineCard, onEvolve } from "../helpers";
import { isFollower } from "../targets";
import { abyssOmen, RULENYE } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      modes: [
        {
          id: "summon",
          label: "(1) Summon 2 Rulenye, Echoing Scream",
          *resolve(fx) {
            yield* fx.summon([RULENYE, RULENYE]);
          },
        },
        {
          id: "storm",
          label: "(2) Storm to this, +1/+0 to each Abysscraft Omen follower of yours",
          *resolve(fx) {
            if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "storm");
            for (const id of fx.game.cards(fx.controller, "field").filter((c) => isFollower(fx.game, c) && abyssOmen(fx.game, c))) {
              yield* fx.giveStats(id, 1, 0);
            }
          },
        },
      ],
    }),
  ],
});
