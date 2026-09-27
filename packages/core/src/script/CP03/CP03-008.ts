// CP03-008 Water General of Wave-like Spirals, Benedict — Forestcraft follower, 3, 3/3. ヴァンガード・アクアフォース.
// {[ride]} {[cost01]}: Give this follower Drive. (CR 14.4.9: a Drive Point is linked; once per card per game.)
// On Drive - Give this follower {[attack]}+1/{[defense]}+1. Search your deck for up to two 1-cost Aqua Force followers with
// different names, reveal them, add them to your hand, then shuffle. (元のコスト.)
import { defineCard, onDrive, rideAbility } from "../helpers";
import { aquaForce, followerThat } from "./shared";

export default defineCard({
  abilities: [
    rideAbility(1),
    onDrive({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.giveStats(fx.self, 1, 1);
        yield* fx.search((id) => followerThat(aquaForce)(g, id) && g.info(id).cost === 1, { max: 2, distinctNames: true });
      },
    }),
  ],
});
