// BP20-002 Krulle, Heir to Unkilling — Forestcraft follower, 3, 3/3. 絶傑・継承者・狩人.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} If there are at least 6 Hunter cards in your cemetery, put a Crest: Krulle, Heir to Unkilling token into your EX
// area. Give your leader {[defense]}+2. (Both under the condition — Q10, as in the official English text.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { huntersInCemetery } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        if (huntersInCemetery(fx.game, fx.controller) < 6) return;
        yield* fx.tokensToEx(["Crest: Krulle, Heir to Unkilling"]);
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
