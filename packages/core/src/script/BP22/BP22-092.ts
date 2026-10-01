// BP22-092 ゴッド・オブ・カース — Havencraft follower, 9, 1/5. 狂信.
// これをプレイする際、コストを-Xする。Xは「自分のターン数」である。
// 自分のエンドフェイズが来たとき、相手のリーダーすべてに2ダメージ。自分のリーダーは体力+2する。
// ファンファーレ相手の場のフォロワー1体を選ぶ。それは攻撃力-5/体力-5する。
// (This costs X less to play, X = your turn count: how many times you have begun a start phase as the active player, this turn
// included (rulings, CR 3.3.2). At the start of your end phase, deal 2 damage to each enemy leader and give your leader +2 defense.
// Fanfare - Select an enemy follower on the field and give it -5/-5; attack may go below 0 (ruling).)
import { atStartOfYourEndPhase, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  playCost: (g, _self, player) => -g.turnsPassed(player),
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, -5, -5);
      },
    }),
  ],
});
