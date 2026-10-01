// BP22-113 ゴブリンリーダー — Neutral follower, 2, 1/1. ゴブリン.
// 進化コスト1：これは進化する。
// 自分の場に他のゴブリン・フォロワーが出たとき、それは攻撃力+1する。
// (Evolve (1). Whenever another Goblin follower is put onto your field, give it +1/+0.)
import { defineCard, evolveAbility, whenFollowerEntersYourField } from "../helpers";
import { goblin } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    whenFollowerEntersYourField(
      {
        *resolve(fx) {
          const card = fx.data?.card;
          if (card !== undefined && fx.game.card(card)?.zone === "field") yield* fx.giveStats(card, 1, 0);
        },
      },
      { another: true, filter: goblin },
    ),
  ],
});
