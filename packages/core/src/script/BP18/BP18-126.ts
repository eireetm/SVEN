// BP18-126 Third-Class Officer — Neutral follower, 1, 1/2. 透京・区役所.
// {[fanfare]} Discard a card: Search your deck for a Ward Office card not named Third-Class Officer, reveal it, add it to your
// hand, then shuffle. (CR 10.4.7.4.)
import { discardCardsCost } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { named } from "../targets";
import { wardOffice } from "./shared";

const officer = named("Third-Class Officer");

export default defineCard({
  abilities: [
    fanfare({
      cost: discardCardsCost(1),
      *resolve(fx) {
        yield* fx.search((id) => wardOffice(fx.game, id) && !officer(fx.game, id));
      },
    }),
  ],
});
