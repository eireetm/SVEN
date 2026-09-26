// BP12-004 Carbuncle, Immortal Jewel — Forestcraft follower, 4, 2/2. 精霊・獣.
// {[evolve]} {[cost02]}: Evolve this follower.
// {[fanfare]} Put a Carbuncle's Sparkle token into your EX area.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { SPARKLE } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([SPARKLE]);
      },
    }),
  ],
});
