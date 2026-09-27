// CP03-114 White Hare of Inaba — Havencraft follower, 1, 1/1. ヴァンガード・オラクルシンクタンク.
// {[ride]} {[cost01]}: Give this follower Drive. (CR 14.4.9: a Drive Point is linked; once per card per game.)
// On Drive - Give this follower {[attack]}+1/{[defense]}+1. Give your leader {[defense]}+1.
// {[fanfare]} Select up to 1 card in your cemetery and put it into your deck 3rd from the top.
import { defineCard, fanfare, onDrive, rideAbility } from "../helpers";
import { inYourZone } from "../targets";

export default defineCard({
  abilities: [
    rideAbility(1),
    onDrive({
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 1, 1);
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
    fanfare({
      targets: [inYourZone("cemetery", { upTo: true })],
      *resolve(fx) {
        const [card] = fx.targets[0] ?? [];
        if (card !== undefined) yield* fx.putIntoDeckAt(card, 3);
      },
    }),
  ],
});
