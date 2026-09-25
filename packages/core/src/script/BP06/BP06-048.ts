// BP06-048 Talisman Disciple — Runecraft follower, 1, 1/1. 陰陽師.
// {[lastwords]} Search your deck for a Shikigami Summons, reveal it, add it to your hand, then
// shuffle your deck. (Shuffled even without one — ruling.)
import { defineCard, lastWords } from "../helpers";
import { named } from "../targets";

export default defineCard({
  abilities: [
    lastWords({
      *resolve(fx) {
        yield* fx.search((id) => named("Shikigami Summons")(fx.game, id));
      },
    }),
  ],
});
