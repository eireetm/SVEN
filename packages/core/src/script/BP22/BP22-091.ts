// BP22-091 デッドスタンピード — Abysscraft spell, 8. 魔界・死者.
// 自分の墓場の死者・フォロワーを元のコストの合計が6以下になるように3枚まで選ぶ。それを場に出す。それは【突進】を持つ。
// (Select up to 3 Departed followers in your cemetery that cost a total of 6 or less (元のコスト) and put them onto your field; they
// gain Rush.)
import { defineCard, selectWithinTotalCost, spell } from "../helpers";
import { isFollower } from "../targets";
import { departed } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const g = fx.game;
        const chosen = yield* selectWithinTotalCost(fx, g.cards(fx.controller, "cemetery").filter((id) => isFollower(g, id) && departed(g, id)), 6, 3);
        for (const card of yield* fx.putOntoField(chosen)) yield* fx.giveKeyword(card, "rush");
      },
    }),
  ],
});
