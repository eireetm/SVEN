// BP14-055 Sacred Springs Dragon — Dragoncraft follower, 5, 5/5. 宴楽・竜族.
// Rush. Assail
// {[fanfare]} Search your deck for a Soothing Dragonspring, summon it, then shuffle.
// Strike - Remove 2 divine water counters from a Soothing Dragonspring on your field: Draw a card. The next
// time this would take damage this turn, it doesn't. (Without the counters it isn't played — ruling.)
import { defineCard, fanfare, strike } from "../helpers";
import { named } from "../targets";
import { DRAGONSPRING, removeDivineWater } from "./shared";

export default defineCard({
  keywords: ["rush", "assail"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => named(DRAGONSPRING)(fx.game, id), { to: "field" });
      },
    }),
    strike({
      cost: removeDivineWater,
      *resolve(fx) {
        yield* fx.draw(1);
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.preventNextDamage(fx.self, "endOfTurn");
      },
    }),
  ],
});
