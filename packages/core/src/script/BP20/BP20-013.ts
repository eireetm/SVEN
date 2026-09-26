// BP20-013 Bearer of the Fairy Blade — Forestcraft follower, 2, 2/2. エルフ族・精霊.
// {[evolve]} {[cost01]}: Evolve this.
// Whenever you summon a Pixie token follower, give it {[attack]}+1. (Whenever one is put onto your field — the Japanese and
// official English texts.)
// {[fanfare]} Put a Fairy token into your EX area.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { fairyBladeBoost } from "./shared-forest";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fairyBladeBoost,
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Fairy"]);
      },
    }),
  ],
});
