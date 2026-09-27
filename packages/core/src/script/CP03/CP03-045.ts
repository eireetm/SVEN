// CP03-045 Purple Trapezist — Runecraft follower, 2, 2/3. ヴァンガード・ペイルムーン.
// {[fanfare]} Choose one. (1) Draw a card. Banish a card from your hand. (2) Select a Pale Moon follower on your field and, if
// there are at least 5 cards in your banished zone, give it Storm. ((2) may be chosen with fewer; then nothing happens —
// ruling.)
import { defineCard, fanfare } from "../helpers";
import { yourFollower } from "../targets";
import { countIn, paleMoon } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      modes: [
        {
          id: "1",
          label: "Draw a card, then banish a card from your hand",
          *resolve(fx) {
            yield* fx.draw(1);
        const hand = fx.game.cards(fx.controller, "hand");
        yield* fx.banish(yield* fx.chooseCards(hand, Math.min(1, hand.length), 1));
          },
        },
        {
          id: "2",
          label: "Storm to a Pale Moon follower with 5 cards in your banished zone",
          targets: [yourFollower({ filter: paleMoon })],
          *resolve(fx) {
            if (countIn(fx.game, fx.controller, "banished") >= 5) yield* fx.giveKeyword(fx.targets[0]![0]!, "storm");
          },
        },
      ],
    }),
  ],
});
