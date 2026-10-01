// BP22-089 ゴブリンゾンビ — Abysscraft follower, 1, 2/2. 死者・ゴブリン.
// ファンファーレ手札のゴブリン・カード1枚を捨てる：1枚引く。自分の墓場のゴブリン・カードが3枚以上なら、これは攻撃力+1する。
// (Fanfare - Discard a Goblin card: draw a card; then, if there are at least 3 Goblin cards in your cemetery, give this +1/+0 — both
// after the cost, CR 10.4.7.4.)
import { discardA } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { goblin } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: discardA(goblin),
      *resolve(fx) {
        yield* fx.draw(1);
        const g = fx.game;
        if (g.cards(fx.controller, "cemetery").filter((id) => goblin(g, id)).length >= 3 && g.card(fx.self)?.zone === "field") {
          yield* fx.giveStats(fx.self, 1, 0);
        }
      },
    }),
  ],
});
