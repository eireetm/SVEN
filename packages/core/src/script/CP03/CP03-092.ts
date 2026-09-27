// CP03-092 Knight of Darkness, Rugos — Abysscraft follower, 2, 2/2. ヴァンガード・シャドウパラディン.
// {[ride]} {[cost01]}: Give this follower Drive. (CR 14.4.9: a Drive Point is linked; once per card per game.)
// On Drive - Select up to 1 enemy follower on the field. Deal it 2 damage, give this follower {[attack]}+1/{[defense]}+1, and bury
// the top card of your deck.
import { defineCard, onDrive, rideAbility } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    rideAbility(1),
    onDrive({
      targets: [enemyFollower({ upTo: true })],
      *resolve(fx) {
        const [target] = fx.targets[0] ?? [];
        if (target !== undefined) yield* fx.dealDamage(target, 2);
        yield* fx.giveStats(fx.self, 1, 1);
        yield* fx.mill(1);
      },
    }),
  ],
});
