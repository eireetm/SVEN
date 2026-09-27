// SD07-012 レヴィオンアックス・ジェノ (Levin axe Jeno) — Swordcraft follower, 2, 3/2. 兵士・獣・レヴィオン.
// Japanese-only data (no English text); implemented from the Japanese:
// これを自分の手札から捨てたとき、自分のデッキの上1枚を見る。その中から、レヴィオン・カード1枚を公開して手札に加えてよい。
//   (When you discard this from your hand, look at the top card of your deck. You may reveal a Levin card from among it and add it
//   to your hand. Not taken, it stays on top unrevealed — ruling.)
// 自分の墓場にレヴィオン・カードが5枚以上ある限り、これは【疾走】を持つ。
//   (While there are at least 5 Levin cards in your cemetery, this has Storm: a passive that comes and goes — ruling.)
import { defineCard, whenDiscarded } from "../helpers";
import { hasTrait } from "../targets";
import { mayTakeTopCard } from "../ECP02/shared";

export default defineCard({
  selfKeywords: (g, self) =>
    g.cards(g.controller(self), "cemetery").filter((id) => g.typeAndTraits(id).traits.includes("レヴィオン")).length >= 5
      ? ["storm"]
      : [],
  abilities: [
    whenDiscarded({
      *resolve(fx) {
        yield* mayTakeTopCard(fx, hasTrait("レヴィオン"));
      },
    }),
  ],
});
