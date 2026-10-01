// BP22-025 ファングスレイヤー — Swordcraft follower, 8, 3/9. 兵士.
// 【突進】【指定攻撃】【必殺】
// 自分のターン中、相手のフォロワーが場から墓場に置かれたとき、それのリーダーに「それの攻撃力」と同じダメージ。
// (Rush. Assail. Bane. During your turn, whenever an enemy follower is put from the field into the cemetery, deal damage equal to
// its attack to its leader: its attack on the field, changes included (CR 10.7.4.1.2); once per follower, tokens too (rulings).)
import { defineCard, whenEnemyFollowerToCemetery } from "../helpers";

export default defineCard({
  keywords: ["rush", "assail", "bane"],
  abilities: [
    whenEnemyFollowerToCemetery(
      {
        *resolve(fx) {
          yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), Math.max(0, fx.data?.count ?? 0));
        },
      },
      { onlyYourTurn: true },
    ),
  ],
});
