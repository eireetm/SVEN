// BP20-090 Wicked Collector — Abysscraft follower, 2, 1/3. 魔界.
// {[fanfare]} Put the top card of your deck into your EX area. If it's a follower, give it {[attack]}+1/{[defense]}+1. (It
// keeps them when played from there, CR 10.6.2.1.3.)
import { defineCard, fanfare } from "../helpers";
import { isFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        for (const id of yield* fx.topToEx(1)) if (isFollower(fx.game, id)) yield* fx.giveStats(id, 1, 1);
      },
    }),
  ],
});
