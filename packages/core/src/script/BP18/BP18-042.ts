// BP18-042 Ginger, Accursed Word — Runecraft follower, 10, 3/3. 魔法使い.
// This costs X less to play. X equals the number of cards in your banished zone.
// ----------
// {[fanfare]} Put a Ginger's Curse token into your EX area.
import { defineCard, fanfare } from "../helpers";
import { banishedCount } from "./shared";

export default defineCard({
  playCost: (g, _self, p) => -banishedCount(g, p),
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Ginger's Curse"]);
      },
    }),
  ],
});
