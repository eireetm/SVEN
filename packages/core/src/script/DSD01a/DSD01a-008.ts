// DSD01a-008 Anne's Sorcery (アンの大魔法) — Runecraft spell, 5. 魔法使い・学院・プリンセス.
// Japanese-only text (the English name is data/fixes.ts's, from BP21-039, which searches for it); implemented from the Japanese:
// 下記から1つチョイスする。【1】相手のリーダー1人か相手の場のフォロワー1体を選ぶ。それに4ダメージ。1枚引く。
// 【2】コスト3：相手のリーダー1人か相手の場のフォロワー1体を選ぶ。自分の墓場の学院・カードが10枚以上なら、それに8ダメージ。2枚引く。
// (Choose one. (1) Select an enemy leader or enemy follower on the field. Deal it 4 damage. Draw a card. (2) {[cost03]}: Select an
// enemy leader or enemy follower on the field. If there are at least 10 Academic cards in your cemetery, deal it 8 damage. Draw 2
// cards. — "Draw 2" is under the condition too (open-questions Q10). The cost of (2) is paid when the option resolves, CR 10.4.7.5;
// this spell is not yet in the cemetery and doesn't count — ruling.)
import { playPointsCost } from "../costs";
import { defineCard, spell } from "../helpers";
import { enemyLeaderOrFollower } from "../targets";
import { academicsInCemetery } from "./shared";

export default defineCard({
  abilities: [
    spell({
      modes: [
        {
          id: "1",
          label: "Deal 4 damage to an enemy leader or follower and draw a card",
          targets: [enemyLeaderOrFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 4);
            yield* fx.draw(1);
          },
        },
        {
          id: "2",
          label: "{[cost03]}: with 10 Academic cards in your cemetery, deal 8 damage and draw 2 cards",
          targets: [enemyLeaderOrFollower()],
          cost: playPointsCost(3),
          *resolve(fx) {
            if (academicsInCemetery(fx.game, fx.controller) < 10) return;
            yield* fx.dealDamage(fx.targets[0]![0]!, 8);
            yield* fx.draw(2);
          },
        },
      ],
    }),
  ],
});
