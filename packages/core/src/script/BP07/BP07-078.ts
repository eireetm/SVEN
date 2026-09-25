// BP07-078 Hellblaze Demon — Abysscraft follower, 2, 2/3. 魔界.
// {[fanfare]} Discard a card: Put the top card of your deck into your EX area. If it's a follower,
// give it {[attack]} +1/{[defense]}+1. (CR 10.4.7.4. It keeps +1/+1 when put or played onto the
// field, CR 4.8.3.3.)
import { discardA } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { isFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      cost: discardA(() => true),
      *resolve(fx) {
        const [card] = yield* fx.topToEx(1);
        if (card !== undefined && isFollower(fx.game, card)) yield* fx.giveStats(card, 1, 1);
      },
    }),
  ],
});
