// CP03-070 Flame of Promise, Aermo — Dragoncraft follower, 1, 2/2. ヴァンガード・かげろう.
// {[fanfare]} Reveal a follower with "Overlord" in its name from your hand: Draw a card.
import { revealFromHand } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { isFollower, nameIncludes } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      cost: revealFromHand((g, id) => isFollower(g, id) && nameIncludes("Overlord")(g, id), 1),
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
