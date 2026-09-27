// CP03-088 Skull Witch, Nemain — Abysscraft follower, 4, 3/3. ヴァンガード・シャドウパラディン.
// {[ride]} {[cost01]}: Give this follower Drive. (CR 14.4.9: a Drive Point is linked; once per card per game.)
// On Drive - Give this follower {[attack]}+1/{[defense]}+1. Look at the top 3 cards of your deck. You may reveal a Shadow Paladin
// card from among them and add it to your hand. Bury the rest.
// {[fanfare]} Select an enemy follower on the field and deal it 4 damage.
import { defineCard, fanfare, lookAtTopCards, onDrive, rideAbility } from "../helpers";
import { enemyFollower } from "../targets";
import { shadowPaladin } from "./shared";

export default defineCard({
  abilities: [
    rideAbility(1),
    onDrive({
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 1, 1);
        yield* lookAtTopCards(fx, 3, { filter: shadowPaladin, to: "hand", rest: "cemetery" });
      },
    }),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
  ],
});
