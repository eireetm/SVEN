// CP01-064 Seeking the Pearl — Abysscraft follower, 2, 3/2. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// {[lastwords]} Put the top 2 cards of your deck into your cemetery.
import { defineCard, lastWords, serveAbility } from "../helpers";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    lastWords({
      *resolve(fx) {
        yield* fx.mill(2);
      },
    }),
  ],
});
