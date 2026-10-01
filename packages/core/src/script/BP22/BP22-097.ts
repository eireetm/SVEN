// BP22-097 セイクリッドレオ (evolved) — Havencraft, 0/5. 光輝・獣.
// 【指定攻撃】【必殺】
// これは交戦ダメージを受けない。
// 【攻撃時】2枚引く。自分の手札1枚を捨てる。フォロワーを捨てたなら、相手のリーダーすべてに3ダメージ。アミュレットを捨てたなら、相手の場のフォロワー
// すべてに3ダメージ。
// (Assail. Bane. This doesn't take combat damage. Strike - Draw 2 cards, then discard a card. If you discarded a follower, deal 3
// damage to each enemy leader; if an amulet, 3 damage to each enemy follower on the field — the second a condition of its own (Q10).)
import { defineCard, strike } from "../helpers";

export default defineCard({
  keywords: ["assail", "bane"],
  field: { damageTaken: (_g, _self, damage) => (damage.combat ? -damage.amount : 0) },
  abilities: [
    strike({
      *resolve(fx) {
        yield* fx.draw(2);
        const discarded = yield* fx.discard(fx.controller, 1, 1);
        const g = fx.game;
        const opp = g.opponent(fx.controller);
        const typeOf = (id: string) => (g.card(id) ? g.info(id).type : null);
        if (discarded.some((id) => typeOf(id) === "follower")) yield* fx.dealDamage(g.leader(opp), 3);
        if (discarded.some((id) => typeOf(id) === "amulet")) yield* fx.dealDamageEach(g.followers(opp), 3);
      },
    }),
  ],
});
