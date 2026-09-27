// CP03-111 Maiden of Libra — Havencraft follower, 3, 3/3. ヴァンガード・オラクルシンクタンク.
// Ward.
// {[fanfare]} Look at the top 5 cards of your deck. Put any number of them on the top of your deck in any order. Put the rest on
// the bottom in any order.
// Activate {[engage]}: Draw a card.
import { activated, defineCard, fanfare } from "../helpers";
import { arrangeTop } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* arrangeTop(fx, 5);
      },
    }),
    activated(
      { engageSelf: true },
      {
        *resolve(fx) {
          yield* fx.draw(1);
        },
      },
    ),
  ],
});
