// BP22-018 シードショット — Forestcraft spell, 2. エルフ族・植物族.
// クイック
// 相手の場のフォロワー1体を選ぶ。それに3ダメージ。自分の場に植物族・フォロワーがいるなら、相手のリーダーすべてに1ダメージ。1枚引く。
// (Quick. Select an enemy follower on the field and deal it 3 damage. If there is a Verdant follower on your field, deal 1 damage to
// each enemy leader and draw a card — the draw under the condition too (open-questions Q10). Not playable without a follower to
// select — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower, isFollower } from "../targets";
import { onYourField, verdant } from "./shared";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        if (!onYourField(fx.game, fx.controller, (g, id) => isFollower(g, id) && verdant(g, id))) return;
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 1);
        yield* fx.draw(1);
      },
    }),
  ],
});
