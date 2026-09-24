// BP02-035 Daria, Dimensional Witch — Runecraft follower, 6, 5/5.
// {[evolve]}{[cost01]}: Evolve this follower.
// {[fanfare]} Discard your hand. Put the top card of your deck into your EX area. Repeat this until
// your EX area is full.
// While this card is on your field, include both spells and {[runecraft]} followers in your
// cemetery when counting your Spellchain (CR 13.3.1.1).
// (effect_en writes "Discard your hand: ..." like a cost; the Japanese, Chinese and official
// English texts all make it two sequential effects, so it is not a cost. With an empty deck the
// repetition just stops, and it cannot stop early — rulings.)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  field: { spellchainCountsRunecraftFollowers: true },
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.discardHand();
        yield* fx.topToEx(Number.MAX_SAFE_INTEGER);
      },
    }),
  ],
});
