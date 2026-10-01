// BP22-084 デスキャットリーパー — Abysscraft follower, 2, 2/2. 魔界・獣.
// ファンファーレ場の他のフォロワー1体を墓場に置く：相手の場のフォロワー1体を選ぶ。それに5ダメージ。それのリーダーに1ダメージ。自分のリーダーは体力
// +1する。
// (Fanfare - Bury another follower on your field (CR 10.4.3): select an enemy follower on the field, deal it 5 damage and 1 damage to
// its leader, and give your leader +1 defense; nothing without a follower to select — ruling.)
import { buryAnotherFromYourField } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { enemyFollower, isFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      cost: buryAnotherFromYourField(isFollower),
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.dealDamage(target, 5);
        yield* fx.dealDamage(leader, 1);
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
