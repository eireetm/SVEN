// BP16-030 Rusty, Luxcard Trickster — Swordcraft follower, 3, 3/3. 盗賊.
// Storm.
// {[lastwords]} Search your deck for a Rusty, Luxcard Trickster, reveal it, add it to your hand, then shuffle.
import { defineCard, lastWords } from "../helpers";
import { named } from "../targets";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    lastWords({
      *resolve(fx) {
        yield* fx.search((id) => named("Rusty, Luxcard Trickster")(fx.game, id));
      },
    }),
  ],
});
