// BP10-007 Windflower Tiger — Forestcraft follower, 2, 2/3. 植物族・獣.
// Ward.
// {[fanfare]} Return a Beast follower not named Windflower Tiger on your field to its owner's hand:
// Search your deck for a Salvia Panther, reveal it, add it to your hand, then shuffle. (Only your own
// field — ruling, CR 10.4.3.)
import { returnAnotherFromYourField } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { and, hasTrait, isFollower, named } from "../targets";

const otherBeast = and(isFollower, hasTrait("獣"), (g, id) => !named("Windflower Tiger")(g, id));

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      cost: returnAnotherFromYourField(otherBeast),
      *resolve(fx) {
        yield* fx.search((id) => named("Salvia Panther")(fx.game, id));
      },
    }),
  ],
});
