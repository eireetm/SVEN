// CP03-071 Bellicosity Dragon — Dragoncraft follower, 5, 4/4. ヴァンガード・かげろう.
// {[ride]} {[cost01]}: Give this follower Drive. (CR 14.4.9: a Drive Point is linked; once per card per game.)
// On Drive - Select up to 2 enemy followers on the field. Deal 4 damage divided between them and give this follower
// {[attack]}+1/{[defense]}+1.
// {[fanfare]} Give your leader {[defense]}+2. Draw a card.
import { defineCard, fanfare, onDrive, rideAbility } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    rideAbility(1),
    onDrive({
      targets: [enemyFollower({ count: 2, upTo: true })],
      *resolve(fx) {
        const targets = fx.targets[0] ?? [];
        if (targets.length > 0) yield* fx.dealDividedDamage(targets, 4);
        yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
    fanfare({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
        yield* fx.draw(1);
      },
    }),
  ],
});
