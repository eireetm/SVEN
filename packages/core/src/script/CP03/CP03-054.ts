// CP03-054 Midnight Bunny — Runecraft follower, 2, 2/2. ヴァンガード・ペイルムーン.
// {[ride]} {[cost01]}: Give this follower Drive. (CR 14.4.9: a Drive Point is linked; once per card per game.)
// On Drive - Give this follower {[attack]}+1/{[defense]}+1. Look at the top 2 cards of your deck. Add one of them to your hand and
// banish the other.
import { defineCard, onDrive, rideAbility } from "../helpers";

export default defineCard({
  abilities: [
    rideAbility(1),
    onDrive({
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 1, 1);
        const top = fx.topCards(2);
        const [keep] = yield* fx.selectCards(top, Math.min(1, top.length), 1, fx.controller, top);
        if (keep === undefined) return;
        yield* fx.returnToHand([keep]);
        yield* fx.banish(top.filter((id) => id !== keep));
      },
    }),
  ],
});
