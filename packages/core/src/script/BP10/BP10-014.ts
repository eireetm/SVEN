// BP10-014 Reclusive Ponderer (Evolved) — Forestcraft follower, 5/5. アルカナ・獣.
// On Evolve - Search your deck for an Arcana card, put it into your EX area, then shuffle.
import { defineCard, onEvolve } from "../helpers";
import { arcana } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => arcana(fx.game, id), { to: "ex" });
      },
    }),
  ],
});
