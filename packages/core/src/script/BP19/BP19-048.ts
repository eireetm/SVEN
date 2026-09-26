// BP19-048 Volunteer Test Subject — Runecraft follower, 2, 2/2. 八獄・魔法生物・禁忌.
// When this card is fused by your Condemned follower's ability, draw a card, then discard a card. (CR 12.18.4.1.)
// {[fanfare]} If there are at least 5 Condemned followers in your cemetery, give this {[attack]}+2/{[defense]}+2 and Rush.
// If there are at least 10, give this Assail and Bane.
// {[lastwords]} Draw a card.
import { defineCard, fanfare, lastWords, whenThisIsFused } from "../helpers";
import { condemnedFollower } from "./shared";
import { subjectFanfare } from "./shared-rune";

export default defineCard({
  abilities: [
    whenThisIsFused(
      {
        *resolve(fx) {
          yield* fx.draw(1);
          yield* fx.discard(fx.controller, 1, 1);
        },
      },
      condemnedFollower,
    ),
    fanfare(subjectFanfare),
    lastWords({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
