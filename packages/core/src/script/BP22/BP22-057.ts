// BP22-057 イグニスドラゴン (evolved) — Dragoncraft, 5/7. 竜族.
// 【攻撃時】相手の場のフォロワーすべてに「これの攻撃力」と同じダメージ。
// (Strike - Deal damage equal to this follower's attack to each enemy follower on the field.)
import { defineCard, strike } from "../helpers";

export default defineCard({
  abilities: [
    strike({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone !== "field") return;
        const attack = fx.game.info(fx.self).attack ?? 0;
        if (attack > 0) yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), attack);
      },
    }),
  ],
});
