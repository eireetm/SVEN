// BP19-T02 Multi-Headed Test Subject — Runecraft follower token, 2, 2/2. 八獄・魔法生物・禁忌.
// {[fanfare]} If there are at least 5 Condemned followers in your cemetery, give this {[attack]}+2/{[defense]}+2 and Rush.
// If there are at least 10, give this Assail and Bane.
// {[lastwords]} Draw a card.
import { defineCard, fanfare, lastWords } from "../helpers";
import { subjectFanfare } from "./shared-rune";

export default defineCard({
  abilities: [
    fanfare(subjectFanfare),
    lastWords({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
