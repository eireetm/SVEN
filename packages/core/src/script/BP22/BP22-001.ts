// BP22-001 ブリリアントフェアリー — Forestcraft follower, 3, 3/4. 妖精.
// これが場にいる限り、自分の場の妖精・トークン・フォロワーすべては【疾走】を持つ。
// 起動コスト0：相手の場のフォロワー1体を選ぶ。それにXダメージ。Xは「このターン中に自分がプレイしたカードの枚数」である。この能力は1ターン
// に1回使える。
// (While this is on the field, each Pixie token follower on your field has Storm. Activate (0): select an enemy follower and
// deal it X damage, X = the number of cards you played this turn. Once per turn. A follower that loses Storm while attacking
// still attacks — ruling, CR 8.4.)
import { activated, defineCard } from "../helpers";
import { enemyFollower } from "../targets";
import type { FieldPassives } from "../types";

const pixieTokensHaveStorm: NonNullable<FieldPassives["keywordsFor"]> = (g, self, card) => {
  const c = g.card(card);
  if (!c || c.zone !== "field" || g.controller(card) !== g.controller(self) || !g.db.get(c.def).token) return [];
  const { type, traits } = g.typeAndTraits(card);
  return type === "follower" && traits.includes("妖精") ? ["storm"] : [];
};

export default defineCard({
  field: { keywordsFor: pixieTokensHaveStorm },
  abilities: [
    activated(
      { playPoints: 0 },
      {
        oncePerTurn: true,
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, fx.game.playedThisTurn(fx.controller));
        },
      },
    ),
  ],
});
