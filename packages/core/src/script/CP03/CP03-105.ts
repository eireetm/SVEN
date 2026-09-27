// CP03-105 Goddess of the Half Moon, Tsukuyomi — Havencraft follower, 2, 2/3. ヴァンガード・オラクルシンクタンク.
// {[fanfare]} Look at the top 3 cards of your deck. Put any number of them on the top of your deck in any order. Put the rest on
// the bottom in any order.
// {[act]} {[cost01]}, {[engage]}: Select an enemy follower on the field. Reveal the top card of your deck and deal damage equal to
// its cost to the selected follower. If you revealed a Goddess of the Full Moon, Tsukuyomi, add it to your hand. (元のコスト; not
// playable without an enemy follower — ruling.)
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower, named } from "../targets";
import { arrangeTop } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* arrangeTop(fx, 3);
      },
    }),
    activated(
      { playPoints: 1, engageSelf: true },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          const [top] = fx.topCards(1);
          if (top === undefined) return;
          yield* fx.reveal([top]);
          const cost = fx.game.info(top).cost ?? 0;
          if (cost > 0) yield* fx.dealDamage(fx.targets[0]![0]!, cost);
          if (named("Goddess of the Full Moon, Tsukuyomi")(fx.game, top)) yield* fx.returnToHand([top]);
        },
      },
    ),
  ],
});
