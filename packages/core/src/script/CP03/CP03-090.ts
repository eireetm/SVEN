// CP03-090 Darkness Maiden, Macha — Abysscraft follower, 3, 3/3. ヴァンガード・シャドウパラディン.
// {[ride]} {[cost01]}: Give this follower Drive. (CR 14.4.9: a Drive Point is linked; once per card per game.)
// On Drive - Give this follower {[attack]}+1/{[defense]}+1. Search your deck for a Shadow Paladin follower that costs 2 or less,
// summon it, then shuffle. (元のコスト.)
import { defineCard, onDrive, rideAbility } from "../helpers";
import { costAtMost } from "../targets";
import { followerThat, shadowPaladin } from "./shared";

export default defineCard({
  abilities: [
    rideAbility(1),
    onDrive({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.giveStats(fx.self, 1, 1);
        yield* fx.search((id) => followerThat(shadowPaladin)(g, id) && costAtMost(2)(g, id), { to: "field" });
      },
    }),
  ],
});
