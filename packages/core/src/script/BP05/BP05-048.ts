// BP05-048 Servant of Destruction — Runecraft follower, 2, 2/2. 絶傑・アイドル.
// {[evolve]} {[cost02]}: Evolve this follower.
// {[fanfare]} If there are at least 3 Idolatry cards on your field, change this card's Evolve cost
// to 0 for the rest of this turn.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { idolatryOnField } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        if (idolatryOnField(fx.game, fx.controller) >= 3) yield* fx.setEvolveCost(fx.self, 0, "endOfTurn");
      },
    }),
  ],
});
