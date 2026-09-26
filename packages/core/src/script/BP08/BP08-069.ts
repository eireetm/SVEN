// BP08-069 Crimson Rose Queen — Abysscraft follower, 6, 4/4. 魔界.
// {[evolve]} {[cost02]}: Evolve this follower.
// {[fanfare]} Put a Thorn Burst token into your EX area (CR 5.5.2, 12.4.3).
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Thorn Burst"]);
      },
    }),
  ],
});
