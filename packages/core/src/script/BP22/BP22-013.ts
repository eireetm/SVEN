// BP22-013 冷徹のダークエルフ — Forestcraft follower, 5, 3/3. エルフ族・キラー.
// 進化コスト1：これは進化する。
// ファンファーレEXエリアの妖精・トークン・カード2枚を消滅：相手の場のフォロワー1体を選ぶ。それに5ダメージ。1枚引く。
// (Evolve (1). Fanfare - Banish 2 Pixie token cards from your EX area: select an enemy follower on the field, deal it 5 damage,
// and draw a card. Without a follower to select, it can't be played and nothing is drawn — ruling.)
import { banishFromYourEx } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower, isToken } from "../targets";
import { pixie } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyFollower()],
      cost: banishFromYourEx((g, id) => pixie(g, id) && isToken(g, id), 2),
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
        yield* fx.draw(1);
      },
    }),
  ],
});
