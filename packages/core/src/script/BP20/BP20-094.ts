// BP20-094 Himeka, Heir to Repose — Havencraft follower, 2, 2/2. 絶傑・継承者・狂信.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Put a Crest: Himeka, Heir to Repose token into your EX area.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Crest: Himeka, Heir to Repose"]);
      },
    }),
  ],
});
