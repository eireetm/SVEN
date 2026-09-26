// BP11-020 Bunny & Baron, Specter Duo (Evolved) — Swordcraft follower, 4/4. 荒野・盗賊.
// On Evolve - Choose one. (1) Summon a Val, Trusty Getaway Car token. (2) Search your deck for a
// Desperados' Shot, reveal it, add it to your hand, then shuffle.
import { defineCard, onEvolve } from "../helpers";
import { named } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      modes: [
        {
          id: "val",
          label: "(1) Summon a Val, Trusty Getaway Car",
          *resolve(fx) {
            yield* fx.summon(["Val, Trusty Getaway Car"]);
          },
        },
        {
          id: "shot",
          label: "(2) Search for a Desperados' Shot",
          *resolve(fx) {
            yield* fx.search((id) => named("Desperados' Shot")(fx.game, id));
          },
        },
      ],
    }),
  ],
});
