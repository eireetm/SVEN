// CP03-101 Witch of Nostrum, Arianrhod — Abysscraft follower, 2, 2/2. ヴァンガード・シャドウパラディン.
// {[ride]} {[cost01]}: Give this follower Drive. (CR 14.4.9: a Drive Point is linked; once per card per game.)
// On Drive - Give this follower {[attack]}+1/{[defense]}+1. You may discard a Shadow Paladin card. If you do, draw 2 cards.
import { discardA } from "../costs";
import { defineCard, onDrive, rideAbility } from "../helpers";
import { shadowPaladin } from "./shared";

export default defineCard({
  abilities: [
    rideAbility(1),
    onDrive({
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 1, 1);
        if (yield* fx.optionalCost(discardA(shadowPaladin))) yield* fx.draw(2);
      },
    }),
  ],
});
