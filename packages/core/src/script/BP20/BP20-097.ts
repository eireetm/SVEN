// BP20-097 Congregant of Repose — Havencraft follower, 3, 3/3. 絶傑・狂信.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Put a Crest: Congregant of Repose token into your EX area.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Crest: Congregant of Repose"]);
      },
    }),
  ],
});
