// BP22-074 スケルトンレイダー — Abysscraft follower, 2, 4/4. 死者.
// 自分の墓場の元のコスト2のカードが9枚以下である限り、これは相手を攻撃できない。
// ファンファーレ自分の墓場の元のコスト2のカード10枚につき、下記から1つまでチョイスする。【1】相手の場のフォロワー1体を選ぶ。それを破壊する。相手の
// リーダーすべてと相手の場のフォロワーすべてに1ダメージ。【2】これは【疾走】を持つ。
// (While there are 9 or fewer cards that cost 2 (元のコスト) in your cemetery, this can't attack — neither leaders nor followers
// (ruling). Fanfare - For every 10 cards that cost 2 in your cemetery, choose up to 1 of the following, each once (ruling, CR 5.18):
// (1) select an enemy follower on the field and destroy it, then deal 1 damage to each enemy leader and each enemy follower on the
// field — not choosable without a follower to select (ruling); (2) this gains Storm.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { cost2InCemetery } from "./shared";

export default defineCard({
  cannotAttack: (g, self) => cost2InCemetery(g, g.controller(self)) <= 9,
  abilities: [
    fanfare({
      condition: (g, c) => cost2InCemetery(g, c) >= 10,
      modeCount: (g, c) => Math.min(2, Math.max(1, Math.floor(cost2InCemetery(g, c) / 10))),
      modes: [
        {
          id: "destroy",
          label: "Destroy an enemy follower, then 1 damage to each enemy leader and follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.destroy([fx.targets[0]![0]!]);
            const opp = fx.game.opponent(fx.controller);
            yield* fx.dealDamageEach([fx.game.leader(opp), ...fx.game.followers(opp)], 1);
          },
        },
        {
          id: "storm",
          label: "This gains Storm",
          *resolve(fx) {
            if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "storm");
          },
        },
      ],
    }),
  ],
});
