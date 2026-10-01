// BP22-081 デスサイズゴブリン — Abysscraft follower, 4, 4/3. 魔界・ゴブリン.
// 【疾走】
// 自分のターン中、自分のゴブリン・フォロワーが場から墓場に置かれたとき、相手のリーダーすべてに1ダメージ。自分のリーダーは体力+1する。
// ファンファーレ場の他のゴブリン・フォロワー1体を墓場に置く：相手の場のフォロワー1体を選ぶ。それを破壊する。
// (Storm. During your turn, whenever a Goblin follower of yours is put from the field into the cemetery — once per follower, tokens
// too, this card itself too (look-back, CR 10.7.4.2; rulings) — deal 1 damage to each enemy leader and give your leader +1 defense.
// Fanfare - Bury another Goblin follower on your field (CR 10.4.3): select an enemy follower on the field and destroy it.)
import { buryAnotherFromYourField } from "../costs";
import { defineCard, fanfare, whenYourFollowerLeaves } from "../helpers";
import { enemyFollower, isFollower } from "../targets";
import { goblin } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    whenYourFollowerLeaves(
      {
        *resolve(fx) {
          yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 1);
          yield* fx.giveLeaderDefense(fx.controller, 1);
        },
      },
      { to: "cemetery", onlyYourTurn: true, includeSelf: true, filter: (m) => m.before?.traits?.includes("ゴブリン") === true },
    ),
    fanfare({
      targets: [enemyFollower()],
      cost: buryAnotherFromYourField((g, id) => isFollower(g, id) && goblin(g, id)),
      *resolve(fx) {
        yield* fx.destroy([fx.targets[0]![0]!]);
      },
    }),
  ],
});
