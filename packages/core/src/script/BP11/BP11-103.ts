// BP11-103 Sylvia, Grand Arbiter — Neutral follower, 2, 2/2. 超克.
// {[fanfare]} Evolve this follower. (Not this turn's evolve ability — ruling, CR 8.3.2.1.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.evolve(fx.self);
      },
    }),
  ],
});
