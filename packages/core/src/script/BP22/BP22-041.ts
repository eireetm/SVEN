// BP22-041 巡りの大魔術師・レヴィ (evolved) — Runecraft, 5/5. 魔法使い.
// 【進化時】相手のリーダー1人か相手の場のフォロワー1体を選ぶ。それに3ダメージ。
// 起動コスト1【土の秘術】：相手のリーダー1人か相手の場のフォロワー1体を選ぶ。それに3ダメージ。この能力は1ターンに1回使える。
// (On Evolve - Select an enemy leader or an enemy follower on the field and deal it 3 damage. Activate {[cost01]}, Earth Rite: the
// same; once per turn.)
import { activated, defineCard, onEvolve } from "../helpers";
import { enemyLeaderOrFollower } from "../targets";
import type { EffectContext } from "../../engine/effects/context";

function* deal3(fx: EffectContext) {
  yield* fx.dealDamage(fx.targets[0]![0]!, 3);
}

export default defineCard({
  abilities: [
    onEvolve({ targets: [enemyLeaderOrFollower()], resolve: deal3 }),
    activated({ playPoints: 1 }, { earthRite: { mode: "required" }, oncePerTurn: true, targets: [enemyLeaderOrFollower()], resolve: deal3 }),
  ],
});
