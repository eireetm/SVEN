// BP09-108 Amaterasu — Neutral follower, 2, 2/3. 大神・光輝.
// Ward.
// Whenever this card becomes engaged, give your leader {[defense]}+1. If there's a Tsukuyomi on your
// field, give {[defense]}+2 instead. (Also when it attacks and when Ward engages it — rulings.)
import { defineCard, whenThisBecomesEngaged } from "../helpers";
import { onYourField } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    whenThisBecomesEngaged({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, onYourField(fx.game, fx.controller, "Tsukuyomi") ? 2 : 1);
      },
    }),
  ],
});
