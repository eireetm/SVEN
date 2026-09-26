// BP08-107 Sahaquiel (Evolved) — Neutral follower, 6/6. 天使・大神.
// On Evolve: each follower on your field, including this one, gains Rush and Assail (ruling;
// CR 10.9.1.2, 12.10, 12.11).
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        for (const id of fx.game.followers(fx.controller)) {
          yield* fx.giveKeyword(id, "rush");
          yield* fx.giveKeyword(id, "assail");
        }
      },
    }),
  ],
});
