// BP22-086 霹靂の悪魔 — Abysscraft follower, 5, 3/4. 魔界.
// 進化コスト1：これは進化する。
// ファンファーレ相手の場のフォロワー1体を選ぶ。それに2ダメージ。自分のリーダーは体力+2する。1枚引く。
// (Evolve (1). Fanfare - Select an enemy follower on the field, deal it 2 damage, give your leader +2 defense and draw a card;
// nothing without a follower to select — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { thunderDevil } from "./shared-abyss";

export default defineCard({
  abilities: [evolveAbility(1), fanfare(thunderDevil)],
});
