// BP22-055 鏡像の召喚 — Runecraft spell, 2. 錬金術師・ゴーレム.
// 自分の場の元のコスト5以下のトークン・フォロワー1体を選ぶ。それと同名のトークン・フォロワー1体を場に出す。
// (Select a token follower on your field that costs 5 or less (元のコスト) and summon a token follower of the same name.)
import { defineCard, spell } from "../helpers";
import { costAtMost, isToken, yourFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [yourFollower({ filter: (g, id) => isToken(g, id) && costAtMost(5)(g, id) })],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        if (fx.game.card(target)) yield* fx.summon([fx.game.info(target).baseDef.name]);
      },
    }),
  ],
});
