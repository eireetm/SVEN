// ECP02-024 Miho Kohinata [Youthful Romance] — Swordcraft follower, 4, 4/4. デレマス・キュート.
// Ward.
// {[fanfare]} Discard 2 Cute cards: Give your leader {[defense]}+2. Draw 2 cards.
// {[act]} Lesson (1), {[engage]}: Select up to 2 enemy followers on the field and deal them 2 damage. If there are at least 5 Cute
// cards in your cemetery, deal 3 damage instead. (The engage cost is in the Japanese and official English texts, not in this
// printing's English.)
import { discardMatching, lesson } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { cute, inYourCemetery } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      cost: discardMatching(cute, 2),
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
        yield* fx.draw(2);
      },
    }),
    activated(
      { engageSelf: true, custom: lesson(1) },
      {
        targets: [enemyFollower({ count: 2, upTo: true })],
        *resolve(fx) {
          yield* fx.dealDamageEach(fx.targets[0] ?? [], inYourCemetery(fx.game, fx.controller, cute) >= 5 ? 3 : 2);
        },
      },
    ),
  ],
});
