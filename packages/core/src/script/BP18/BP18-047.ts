// BP18-047 Bejeweled Advisor — Runecraft follower, 2, 2/2. 透京・錬金術師・商人.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Banish the top card of your deck. Then, if there are at least 10 cards in your banished zone, give your
// leader {[defense]}+2. (The card just banished counts — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { banishedCount } from "./shared";
import { banishTop } from "./shared-rune";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* banishTop(fx, 1);
        if (banishedCount(fx.game, fx.controller) >= 10) yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
