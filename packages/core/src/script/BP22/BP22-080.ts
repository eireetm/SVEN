// BP22-080 ゾンビドッグ — Abysscraft follower, 2, 3/2. 死者・獣.
// 【突進】
// 【攻撃時】自分の墓場の『ゾンビドッグ』が2枚なら、これは攻撃力+2/体力+2する。相手のリーダーすべてに2ダメージ。
// ラストワード自分のデッキから『ゾンビドッグ』1枚を探し、EXエリアに置く。
// (Rush. Strike - If there are 2 ゾンビドッグ in your cemetery (「2枚なら」: exactly 2, as BP12-049), give this +2/+2 and deal 2 damage to
// each enemy leader — both under the condition (Q10). Last Words - Search your deck for a ゾンビドッグ and put it into your EX area.)
import { defineCard, lastWords, strike } from "../helpers";
import { named } from "../targets";
import { ZOMBIE_DOG } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    strike({
      *resolve(fx) {
        const g = fx.game;
        if (g.cards(fx.controller, "cemetery").filter((id) => named(ZOMBIE_DOG)(g, id)).length !== 2) return;
        if (g.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 2, 2);
        yield* fx.dealDamage(g.leader(g.opponent(fx.controller)), 2);
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.search((id) => named(ZOMBIE_DOG)(fx.game, id), { to: "ex" });
      },
    }),
  ],
});
