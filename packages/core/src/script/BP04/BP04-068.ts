// BP04-068 Venomous Pucewyrm — Dragoncraft follower, 4, 6/7. 竜族.
// {[fanfare]} Discard a card.
// At the start of your main phase, discard a card (after the start-phase draw; not optional —
// rulings).
import { atStartOfYourMainPhase, defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
    atStartOfYourMainPhase({
      *resolve(fx) {
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
  ],
});
