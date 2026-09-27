// CSD03b-011 Follower, Reas — Dragoncraft follower, 1, 1/1. ヴァンガード・かげろう.
// {[ride]} {[cost02]}: Give this follower Drive. (CR 14.4.9.)
// On Drive - Give this follower {[attack]}+1/{[defense]}+1. Search your deck for a Kagero follower, reveal it, add it to your hand,
// then shuffle.
import { defineCard, onDrive, rideAbility } from "../helpers";
import { followerThat, kagero } from "../CP03/shared";

export default defineCard({
  abilities: [
    rideAbility(2),
    onDrive({
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 1, 1);
        yield* fx.search((id) => followerThat(kagero)(fx.game, id));
      },
    }),
  ],
});
