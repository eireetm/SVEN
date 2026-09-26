// BP15-106 Temple Healer — Havencraft follower, 2, 1/3. 信仰.
// {[evolve]} {[cost01]}: Evolve this.
// Ward.
// {[fanfare]} Discard a follower with Ward: Draw a card. (CR 10.4.7.4.)
import { discardA } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { wardFollower } from "./shared-haven";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(1),
    fanfare({
      cost: discardA(wardFollower),
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
