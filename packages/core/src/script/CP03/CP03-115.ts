// CP03-115 Goddess of the Crescent Moon, Tsukuyomi — Havencraft follower, 1, 2/1. ヴァンガード・オラクルシンクタンク.
// {[fanfare]} Look at the top 3 cards of your deck. Put any number of them on the top of your deck in any order. Put the rest on
// the bottom in any order.
// Activate {[engage]}: Reveal the top card of your deck. If you revealed a Goddess of the Half Moon, Tsukuyomi, add it to your
// hand.
import { activated, defineCard, fanfare } from "../helpers";
import { named } from "../targets";
import { arrangeTop } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* arrangeTop(fx, 3);
      },
    }),
    activated(
      { engageSelf: true },
      {
        *resolve(fx) {
          const [top] = fx.topCards(1);
          if (top === undefined) return;
          yield* fx.reveal([top]);
          if (named("Goddess of the Half Moon, Tsukuyomi")(fx.game, top)) yield* fx.returnToHand([top]);
        },
      },
    ),
  ],
});
