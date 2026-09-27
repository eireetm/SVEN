// CP04-014 Lima (Evolved) — Forestcraft, 4/4. プリコネ・エリザベスパーク.
// {[ub]} On Evolve - Give your leader {[defense]}+3.
// Ward.
import { defineCard, onEvolve, ub } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    ub(
      onEvolve({
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 3);
        },
      }),
    ),
  ],
});
