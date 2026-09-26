// BP11-115 Vagabond Lizard — Neutral follower, 2, 2/2. 荒野・傭兵.
// {[fanfare]} You may put a Bullet Bike token onto your field or into your EX area. (Or neither, also
// when one is full — ruling.)
// {[lastwords]} Put a Dutiful Steed token into your EX area.
import { defineCard, fanfare, lastWords } from "../helpers";
import { BIKE, STEED, tokenOntoFieldOrEx } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* tokenOntoFieldOrEx(fx, BIKE);
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.tokensToEx([STEED]);
      },
    }),
  ],
});
