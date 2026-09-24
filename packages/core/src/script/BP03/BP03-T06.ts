// BP03-T06 Gargantuan Ghost — Abysscraft follower token, 1, 3/3. 死者.
// Ward.
// At the start of your main phase, banish this card.
import { atStartOfYourMainPhase, defineCard } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    atStartOfYourMainPhase({
      *resolve(fx) {
        yield* fx.banish([fx.self]);
      },
    }),
  ],
});
