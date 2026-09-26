// BP08-067 Marionette Dragon — Dragoncraft follower, 3, 7/7. 竜族・人形.
// Rush. At the start of your end phase, destroy this card (CR 5.6, 12.9.1).
import { atStartOfYourEndPhase, defineCard } from "../helpers";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        yield* fx.destroy([fx.self]);
      },
    }),
  ],
});
