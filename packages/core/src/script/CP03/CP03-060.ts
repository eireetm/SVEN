// CP03-060 Jumping Jill — Runecraft follower, 1, 2/2. ヴァンガード・ペイルムーン.
// {[ride]} {[cost03]}: Give this follower Drive. (CR 14.4.9: a Drive Point is linked; once per card per game.)
// On Drive - Select up to 1 Pale Moon card in your banished zone. Add it to your hand and give this follower
// {[attack]}+1/{[defense]}+1.
// {[fanfare]} Banish the top 2 cards of your deck.
import { defineCard, fanfare, onDrive, rideAbility } from "../helpers";
import { inYourZone } from "../targets";
import { paleMoon } from "./shared";

export default defineCard({
  abilities: [
    rideAbility(3),
    onDrive({
      targets: [inYourZone("banished", { upTo: true, filter: paleMoon })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0] ?? []);
        yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
    fanfare({
      *resolve(fx) {
        yield* fx.banish(fx.topCards(2));
      },
    }),
  ],
});
