// BP15-028 Adherent of Hollowness — Swordcraft follower, 2, 2/2. 絶傑・盗賊.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} If there are at least 10 cards in opponents' cemeteries, evolve this
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { opponentsCemetery10 } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      condition: opponentsCemetery10,
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.evolve(fx.self);
      },
    }),
  ],
});
