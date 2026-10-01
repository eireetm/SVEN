// BP22-006 フラワーフォックス (evolved) — Forestcraft, 2/2. 植物族・獣.
// 【進化時】『フェアリーウィスプ』1枚をEXエリアに置く。自分の場に『ブリリアントフェアリー』がいるなら、自分のEXエリアの妖精・トークン・
// フォロワーすべては攻撃力+1/体力+1する。
// (On Evolve - Put a Fairy Wisp token into your EX area. If there is a ブリリアントフェアリー on your field, give each Pixie token
// follower in your EX area +1/+1 — kept when it goes onto the field, CR 4.8.3.3.)
import { defineCard, onEvolve } from "../helpers";
import { named } from "../targets";
import { BRILLIANT_FAIRY, FAIRY_WISP, onYourField, pixieTokenFollower } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.tokensToEx([FAIRY_WISP]);
        if (!onYourField(fx.game, fx.controller, named(BRILLIANT_FAIRY))) return;
        for (const id of fx.game.cards(fx.controller, "ex").filter((c) => pixieTokenFollower(fx.game, c))) yield* fx.giveStats(id, 1, 1);
      },
    }),
  ],
});
