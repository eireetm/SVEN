// CP03-122 Battle Maiden, Tagitsuhime — Havencraft follower, 2, 2/2. ヴァンガード・オラクルシンクタンク.
// {[ride]} {[cost01]}: Give this follower Drive. (CR 14.4.9: a Drive Point is linked; once per card per game.)
// On Drive - Select up to 1 enemy follower on the field. Deal it 2 damage and give this follower {[attack]}+1/{[defense]}+1.
// {[fanfare]} Look at the top 2 cards of your deck. Put any number of them on the top of your deck in any order. Put the rest on
// the bottom in any order.
import { defineCard, fanfare, onDrive, rideAbility } from "../helpers";
import { enemyFollower } from "../targets";
import { arrangeTop } from "./shared";

export default defineCard({
  abilities: [
    rideAbility(1),
    onDrive({
      targets: [enemyFollower({ upTo: true })],
      *resolve(fx) {
        const [target] = fx.targets[0] ?? [];
        if (target !== undefined) yield* fx.dealDamage(target, 2);
        yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
    fanfare({
      *resolve(fx) {
        yield* arrangeTop(fx, 2);
      },
    }),
  ],
});
