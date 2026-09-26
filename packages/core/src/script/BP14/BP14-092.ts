// BP14-092 Nekhbet (Evolved) — Havencraft follower, 3/3. 信仰・鳥族.
// On Evolve - Recover 2 play points.
// {[lastwords]} Put this into its owner's EX area. (A full EX area can't take it — ruling, CR 4.8.3.2.)
import { defineCard, lastWords, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.recoverPlayPoints(2);
      },
    }),
    lastWords({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "cemetery") yield* fx.putIntoEx([fx.self]);
      },
    }),
  ],
});
