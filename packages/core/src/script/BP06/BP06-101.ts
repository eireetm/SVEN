// BP06-101 Winged Staff Priestess — Havencraft follower, 2, 2/2. 先導.
// Ward.
// {[lastwords]} Search your deck for a Winged Staff Priestess, reveal it, add it to your hand, then
// shuffle your deck. (Shuffled even without one — ruling.)
import { defineCard, lastWords } from "../helpers";
import { named } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    lastWords({
      *resolve(fx) {
        yield* fx.search((id) => named("Winged Staff Priestess")(fx.game, id));
      },
    }),
  ],
});
