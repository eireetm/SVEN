// BP22-106 砕氷の聖獣 — Havencraft follower, 7, 5/8. 光輝・獣.
// 【守護】
// これが場にいる限り、自分の場のフォロワーすべては【突進】を持つ。
// 自分の場のフォロワーが攻撃したとき、自分のリーダーは体力+2する。
// (Ward. While this is on the field, each follower on your field has Rush — an attack goes on if it loses it (ruling). Whenever a
// follower on your field attacks, give your leader +2 defense.)
import { defineCard, whenYourFollowerAttacks } from "../helpers";
import type { FieldPassives } from "../types";

const yourFollowersHaveRush: NonNullable<FieldPassives["keywordsFor"]> = (g, self, card) => {
  const c = g.card(card);
  if (!c || c.zone !== "field" || g.controller(card) !== g.controller(self)) return [];
  return g.typeAndTraits(card).type === "follower" ? ["rush"] : [];
};

export default defineCard({
  keywords: ["ward"],
  field: { keywordsFor: yourFollowersHaveRush },
  abilities: [
    whenYourFollowerAttacks(
      {
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 2);
        },
      },
      () => true,
    ),
  ],
});
