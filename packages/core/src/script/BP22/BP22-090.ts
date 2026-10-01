// BP22-090 ゴシックリーパー — Abysscraft follower, 4, 4/4. 魔界.
// ファンファーレ下記から1つチョイスする。【ネクロチャージ_10】代わりに2つまで。【1】自分のデッキの上2枚を墓場に置く。【2】自分のPPを2回復する。
// (Fanfare - Choose one; Necrocharge (10): up to 2 instead, each once (ruling): (1) put the top 2 cards of your deck into your
// cemetery; (2) recover 2 play points. The number is set when it is played, CR 5.18.3.1.1.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      modeCount: (g, c) => (g.necrocharge(c, 10) ? 2 : 1),
      modes: [
        {
          id: "mill",
          label: "Put the top 2 cards of your deck into your cemetery",
          *resolve(fx) {
            yield* fx.mill(2);
          },
        },
        {
          id: "recover",
          label: "Recover 2 play points",
          *resolve(fx) {
            yield* fx.recoverPlayPoints(2);
          },
        },
      ],
    }),
  ],
});
