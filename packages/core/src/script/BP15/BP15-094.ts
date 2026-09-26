// BP15-094 Marwynn, Repose of Despair — Havencraft follower, 4, 4/4. 絶傑・狂信.
// {[evolve]} {[cost03]}: Evolve this.
// Ward.
// {[fanfare]} If there are at least 3 followers on an opponent's field, put a Torrent of Despair token into your EX
// area.
// At the start of each opponent's main phase, give your leader {[defense]}+2. (The turn player's pending abilities
// resolve first, CR 10.5.2.2 — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { marwynnHeal } from "./shared-haven";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(3),
    fanfare({
      condition: (g, p) => g.followers(g.opponent(p)).length >= 3,
      *resolve(fx) {
        yield* fx.tokensToEx(["Torrent of Despair"]);
      },
    }),
    marwynnHeal(),
  ],
});
