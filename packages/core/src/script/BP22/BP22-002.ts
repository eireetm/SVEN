// BP22-002 デッドリーエルフ — Forestcraft follower, 3, 1/3. エルフ族・キラー.
// 【必殺】
// ファンファーレEXエリアの妖精・カードX枚を消滅：X枚引く。自分の手札X枚を捨てる。
// 起動これをアクト：相手のリーダーすべてと相手の場のフォロワーすべてに6ダメージ。この能力は自分の墓場のエルフカードが20枚以上なら使える。
// (Bane. Fanfare - Banish X Pixie cards from your EX area: draw X cards, then discard X cards. Activate, engage this: deal 6
// damage to each enemy leader and each enemy follower on the field; only with at least 20 Forestcraft cards in your cemetery.
// The cost is in your EX area (CR 10.4.3); X is chosen by paying it, at least 1 — banishing 0 would do nothing, 1.3.2.2.)
import { activated, defineCard, fanfare } from "../helpers";
import { isClass } from "../targets";
import type { CustomCost } from "../types";
import { pixie } from "./shared";

/** "Banish X Pixie cards from your EX area": the player picks the cards; X is how many were banished. */
const banishXPixies: CustomCost = {
  canPay: (g, c) => g.cards(c, "ex").some((id) => pixie(g, id)),
  *pay(fx) {
    const pixies = fx.game.cards(fx.controller, "ex").filter((id) => pixie(fx.game, id));
    const chosen = yield* fx.chooseCards(pixies, 1, pixies.length);
    fx.memory.x = (yield* fx.banish(chosen)).length;
  },
};

export default defineCard({
  keywords: ["bane"],
  abilities: [
    fanfare({
      cost: banishXPixies,
      *resolve(fx) {
        const x = Number(fx.memory.x ?? 0);
        yield* fx.draw(x);
        yield* fx.discard(fx.controller, x, x);
      },
    }),
    activated(
      { engageSelf: true },
      {
        condition: (g, c) => g.cards(c, "cemetery").filter((id) => isClass("Forestcraft")(g, id)).length >= 20,
        *resolve(fx) {
          const opp = fx.game.opponent(fx.controller);
          yield* fx.dealDamageEach([fx.game.leader(opp), ...fx.game.followers(opp)], 6);
        },
      },
    ),
  ],
});
