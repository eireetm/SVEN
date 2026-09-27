// ECP01-032 Super Creek [Piece of Mind] — Dragoncraft follower, 4, 4/5. ウマ娘.
// {[feed]} {[cost01]}: Race this follower.
// Ward.
// {[fanfare]} Give your leader {[defense]}+3. If Overflow is active for you, increase your max play points by 1.
// Activate {[engage]}: Select an Umamusume card that costs 7 or more in your cemetery and add it to your hand. Activate only if
// Overflow is active for you. (元のコスト.)
import { activated, defineCard, fanfare, serveAbility } from "../helpers";
import { costAtLeast, inYourZone } from "../targets";
import { umamusume } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    serveAbility(1, 1),
    fanfare({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 3);
        if (fx.game.overflow(fx.controller)) yield* fx.increaseMaxPlayPoints(1);
      },
    }),
    activated(
      { engageSelf: true },
      {
        condition: (g, c) => g.overflow(c),
        targets: [inYourZone("cemetery", { filter: (g, id) => umamusume(g, id) && costAtLeast(7)(g, id) })],
        *resolve(fx) {
          yield* fx.returnToHand(fx.targets[0]!);
        },
      },
    ),
  ],
});
