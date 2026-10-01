// BP22-011 アクアフェアリー — Forestcraft follower, 1, 2/1. 妖精.
// ファンファーレ『フェアリー』1枚をEXエリアに置く。自分のEXエリアの妖精・カードが5枚なら、自分のリーダーは体力+1する。1枚引く。
// (Fanfare - Put a Fairy token into your EX area. If there are 5 Pixie cards in your EX area, give your leader +1 defense and draw
// a card. The Fairy put in counts (ruling); 「5枚なら」 is exactly 5 (as BP12-049); the draw is under the condition too, as the
// ruling asks them together (open-questions Q10).)
import { defineCard, fanfare } from "../helpers";
import { FAIRY, pixiesInEx } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([FAIRY]);
        if (pixiesInEx(fx.game, fx.controller) !== 5) return;
        yield* fx.giveLeaderDefense(fx.controller, 1);
        yield* fx.draw(1);
      },
    }),
  ],
});
