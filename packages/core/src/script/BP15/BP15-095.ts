// BP15-095 Marwynn, Repose of Despair (Evolved) — Havencraft follower, 5/5. 絶傑・狂信.
// Ward.
// On Evolve - Destroy each other follower on the field. (Yours too — ruling.)
// At the start of each opponent's main phase, give your leader {[defense]}+2.
import { defineCard, onEvolve } from "../helpers";
import { marwynnHeal } from "./shared-haven";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.destroy([...g.followers(fx.controller), ...g.followers(g.opponent(fx.controller))].filter((id) => id !== fx.self));
      },
    }),
    marwynnHeal(),
  ],
});
