// Shared pieces of BP22 Abysscraft card scripts (not a card: the file name has no set prefix).
import type { TimingSpec } from "../helpers";
import { enemyFollower } from "../targets";

/** BP22-086 / 087 "相手の場のフォロワー1体を選ぶ。それに2ダメージ。自分のリーダーは体力+2する。1枚引く。" */
export const thunderDevil: TimingSpec = {
  targets: [enemyFollower()],
  *resolve(fx) {
    yield* fx.dealDamage(fx.targets[0]![0]!, 2);
    yield* fx.giveLeaderDefense(fx.controller, 2);
    yield* fx.draw(1);
  },
};
