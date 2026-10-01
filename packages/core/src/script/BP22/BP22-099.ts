// BP22-099 天空の守護者・ガルラ — Havencraft follower, 3, 3/4. 鳥族・光輝.
// 自分の場に他の鳥族・フォロワーが出たとき、相手の場のフォロワー1体を選ぶ。それに3ダメージ。
// 起動コスト1：『ホーリーファルコン』1体を場に出す。この能力は1ターンに1回使える。
// (Whenever another Avian follower is put onto your field — during the opponent's turn too (ruling) — select an enemy follower on
// the field and deal it 3 damage. Activate {[cost01]}: summon a Holy Falcon token (an Avian follower); once per turn.)
import { activated, defineCard, whenFollowerEntersYourField } from "../helpers";
import { enemyFollower } from "../targets";
import { avian, HOLY_FALCON } from "./shared";

export default defineCard({
  abilities: [
    whenFollowerEntersYourField(
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        },
      },
      { another: true, filter: avian },
    ),
    activated(
      { playPoints: 1 },
      {
        oncePerTurn: true,
        *resolve(fx) {
          yield* fx.summon([HOLY_FALCON]);
        },
      },
    ),
  ],
});
