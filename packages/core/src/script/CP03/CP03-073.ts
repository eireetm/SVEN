// CP03-073 Dragon Monk, Gojo — Dragoncraft follower, 2, 2/2. ヴァンガード・かげろう.
// {[ride]} {[cost01]}: Give this follower Drive. (CR 14.4.9: a Drive Point is linked; once per card per game.)
// On Drive - Give this follower {[attack]}+1/{[defense]}+1. Look at the top 2 cards of your deck. You may reveal a Kagero follower
// from among them and add it to your hand. Put the rest on the bottom of your deck in any order. If Overflow is active for you,
// you may reveal and add up to 2 instead.
import { defineCard, lookAtTopCards, onDrive, rideAbility } from "../helpers";
import { followerThat, kagero } from "./shared";

export default defineCard({
  abilities: [
    rideAbility(1),
    onDrive({
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 1, 1);
        yield* lookAtTopCards(fx, 2, { filter: followerThat(kagero), to: "hand", max: fx.game.overflow(fx.controller) ? 2 : 1 });
      },
    }),
  ],
});
