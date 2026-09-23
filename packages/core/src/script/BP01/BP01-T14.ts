// BP01-T14 Ghost — Abysscraft follower token, 1, 1/1.
// Storm. // At the start of your end phase, banish this card.
import { atStartOfYourEndPhase, defineCard } from "../helpers";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        yield* fx.banish([fx.self]);
      },
    }),
  ],
});
