// BP22-044 グレートマジシャン — Runecraft follower, 2, 2/3. 魔法使い.
// ファンファーレ自分の場の【スタック】を+1する。（自分の場に【スタック】を持つカードがないなら、『大地の魔片』1つを場に出し【スタック】を+する）
// 起動これをアクト【土の秘術_3】：自分の場の【スタック】を+6する。
// (Fanfare - Stack +1 on your field (a Magic Sediment with it when you have no card with Stack — ruling, rules of 2026-07-31).
// Activate, engage this, Earth Rite (3): Stack +6 on your field.)
import { activated, defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.addToStack(1);
      },
    }),
    activated(
      { engageSelf: true },
      {
        earthRite: { mode: "required", count: 3 },
        *resolve(fx) {
          yield* fx.addToStack(6);
        },
      },
    ),
  ],
});
