// BP22-096 セイクリッドレオ — Havencraft follower, 5, 0/5. 光輝・獣.
// 進化コスト1場のアミュレット1つを墓場に置く：これは進化する。
// 【指定攻撃】【必殺】
// これは交戦ダメージを受けない。
// (Evolve {[cost01]}, bury an amulet on your field (CR 10.4.3). Assail. Bane. This doesn't take combat damage (CR 5.14.3.2).)
import { buryFromYourField } from "../costs";
import { defineCard, evolveAbility } from "../helpers";
import { isAmulet } from "../targets";

export default defineCard({
  keywords: ["assail", "bane"],
  field: { damageTaken: (_g, _self, damage) => (damage.combat ? -damage.amount : 0) },
  abilities: [evolveAbility({ playPoints: 1, custom: buryFromYourField(isAmulet, 1) })],
});
