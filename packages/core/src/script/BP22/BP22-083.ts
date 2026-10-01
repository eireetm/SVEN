// BP22-083 スカーレットヴァンパイア (evolved) — Abysscraft, 4/5. 吸血鬼.
// 【進化時】相手のリーダーすべてと相手の場のフォロワーすべてに2ダメージ。自分の墓場の吸血鬼・カードが5枚以上なら、代わりに4ダメージ。
// (On Evolve - Deal 2 damage to each enemy leader and each enemy follower on the field; 4 instead if there are at least 5 Vampire
// cards in your cemetery.)
import { defineCard, onEvolve } from "../helpers";
import { vampire } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const g = fx.game;
        const opp = g.opponent(fx.controller);
        const amount = g.cards(fx.controller, "cemetery").filter((id) => vampire(g, id)).length >= 5 ? 4 : 2;
        yield* fx.dealDamageEach([g.leader(opp), ...g.followers(opp)], amount);
      },
    }),
  ],
});
