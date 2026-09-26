// BP18-105 Deliverer of Punishment — Havencraft follower, 1, 1/1. 透京・信仰.
// {[evolve]} {[cost02]}: Evolve this.
// {[fanfare]} Give your leader {[defense]}+1. If there's a Seishiro, Admonishing Faith on your field, evolve this. (Not this
// turn's evolve ability — ruling, CR 8.3.2.1.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { seishiroOnField } from "./shared-haven";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
        if (seishiroOnField(fx.game, fx.controller) && fx.game.card(fx.self)?.zone === "field") yield* fx.evolve(fx.self);
      },
    }),
  ],
});
