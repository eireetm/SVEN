// BP06-073 Ginsetsu, Great Fox — Abysscraft follower, 6, 1/5. 挑戦者・妖怪.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Put 5 One-Tailed Fox tokens into your EX area. (As many as fit — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(Array<string>(5).fill("One-Tailed Fox"));
      },
    }),
  ],
});
