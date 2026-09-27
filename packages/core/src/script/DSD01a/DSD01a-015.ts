// DSD01a-015 術式の教師・ジル (Formula teacher Jill) — Runecraft follower, 1, 1/2. 魔法使い・学院.
// Japanese-only data (no English text); implemented from the Japanese:
// ファンファーレ下記から1つチョイスする。【1】『マナリアの魔弾』1枚をEXエリアに置く。
// 【2】自分の墓場の学院・スペル1枚を選ぶ。自分の墓場の学院・カードが5枚以上なら、それを手札に加える。
// ({[fanfare]} Choose one. (1) Put a マナリアの魔弾 token into your EX area. (2) Select an Academic spell in your cemetery. If there are
// at least 5 Academic cards in your cemetery, add it to your hand. (2) can't be chosen without a spell to select — ruling.)
import { defineCard, fanfare } from "../helpers";
import { and, inYourZone, isSpell } from "../targets";
import { MAGIC_BULLET, academic, academicsInCemetery } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      modes: [
        {
          id: "1",
          label: "Put a マナリアの魔弾 token into your EX area",
          *resolve(fx) {
            yield* fx.tokensToEx([MAGIC_BULLET]);
          },
        },
        {
          id: "2",
          label: "Select an Academic spell in your cemetery; with 5 Academic cards there, add it to your hand",
          targets: [inYourZone("cemetery", { filter: and(isSpell, academic) })],
          *resolve(fx) {
            if (academicsInCemetery(fx.game, fx.controller) >= 5) yield* fx.returnToHand(fx.targets[0]!);
          },
        },
      ],
    }),
  ],
});
