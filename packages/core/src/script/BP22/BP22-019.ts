// BP22-019 ビクトリーブレイダー — Swordcraft follower, 6, 4/8. 指揮官.
// 【突進】【指定攻撃】
// 自分のターンごとに10回、これが交戦ダメージを与えたとき、これをスタンドする。
// 【攻撃時】これは体力+1する。自分のPPを1回復する。
// (Rush. Assail. Ten times on each of your turns, when this deals combat damage, refresh this — not when it attacks a leader:
// that is not combat damage (rulings, CR 5.14.3.2). Strike - Give this +0/+1 and recover 1 play point.)
import { defineCard, strike, whenThisDealsCombatDamage } from "../helpers";

export default defineCard({
  keywords: ["rush", "assail"],
  abilities: [
    whenThisDealsCombatDamage(
      {
        timesPerTurn: 10,
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "field") yield* fx.refresh([fx.self]);
        },
      },
      { onlyYourTurn: true },
    ),
    strike({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 0, 1);
        yield* fx.recoverPlayPoints(1);
      },
    }),
  ],
});
