// BP21-110 Lucius, Travelled Trainer — Neutral follower, 3, 2/4. 学院.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Give your leader {[defense]}+1. Draw a card.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
        yield* fx.draw(1);
      },
    }),
  ],
});
