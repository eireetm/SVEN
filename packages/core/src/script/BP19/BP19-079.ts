// BP19-079 Abyssal Colonel (Evolved) — 4/4.
// Necrocharge (10) - This has Storm and Ward.
// On Evolve - Give your leader {[defense]}+2.
// {[lastwords]} Select an enemy follower on the field and deal it 3 damage.
import { defineCard, onEvolve } from "../helpers";
import { colonelLastWords } from "./shared-abyss";

export default defineCard({
  selfKeywords: (g, self) => (g.necrocharge(g.controller(self), 10) ? ["storm", "ward"] : []),
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
    colonelLastWords,
  ],
});
