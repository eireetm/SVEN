// BP09-067 Coda, Twilight Dragoon — Dragoncraft follower, 4, 1/1. 竜使い.
// {[fanfare]} Summon a Dragon token.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Dragon"]);
      },
    }),
  ],
});
