// BP22-038 クロノウィッチ (evolved) — Runecraft, 5/5. 魔法使い.
// 自分のターン中、自分の消滅領域にカードが置かれたとき、相手の場のフォロワー1体を選ぶ。それに1ダメージ。
// 【進化時】自分の消滅領域のウィッチフォロワーを元のコストの合計が4以下になるように2枚まで選ぶ。それをEXエリアに置く。このターン、それをプレイす
// る際、コストを0にする。
// (During your turn, whenever a card is put into your banished zone, 1 damage to a selected enemy follower (BP22-037). On Evolve -
// Select up to 2 Runecraft followers in your banished zone that cost a total of 4 or less (元のコスト) and put them into your EX
// area; they cost 0 to play this turn.)
import { defineCard, onEvolve, selectWithinTotalCost } from "../helpers";
import { isClass, isFollower } from "../targets";
import { chronoWitchPing } from "./shared-rune";

export default defineCard({
  abilities: [
    chronoWitchPing,
    onEvolve({
      *resolve(fx) {
        const g = fx.game;
        const witches = g.cards(fx.controller, "banished").filter((id) => isFollower(g, id) && isClass("Runecraft")(g, id));
        const chosen = yield* selectWithinTotalCost(fx, witches, 4, 2);
        for (const card of yield* fx.putIntoEx(chosen)) yield* fx.setPlayCost(card, 0, "endOfTurn");
      },
    }),
  ],
});
