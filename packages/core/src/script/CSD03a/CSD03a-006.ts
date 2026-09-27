// CSD03a-006 Knight of Conviction, Bors — Swordcraft follower, 3, 3/3. ヴァンガード・ロイヤルパラディン.
// {[ride]} {[cost01]}: Give this follower Drive. (CR 14.4.9.)
// Assail.
// On Drive - Give this follower {[attack]}+2/{[defense]}+2.
import { defineCard, onDrive, rideAbility } from "../helpers";

export default defineCard({
  keywords: ["assail"],
  abilities: [
    rideAbility(1),
    onDrive({
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 2, 2);
      },
    }),
  ],
});
