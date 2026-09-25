// BP09-008 Storied Falconer — Forestcraft follower, 4, 3/3. 狩人・獣.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Summon a Holy Falcon token.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Holy Falcon"]);
      },
    }),
  ],
});
