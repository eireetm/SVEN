// BP18-110 Votary of Contemplation — Havencraft follower, 2, 2/2. 透京・信仰.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} If there's a Seishiro, Admonishing Faith on your field, give your leader {[defense]}+1 and draw a card. (Both
// under the condition — Q10, as in English.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { seishiroOnField } from "./shared-haven";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        if (!seishiroOnField(fx.game, fx.controller)) return;
        yield* fx.giveLeaderDefense(fx.controller, 1);
        yield* fx.draw(1);
      },
    }),
  ],
});
