// BP10-027 Lightning Kicker — Swordcraft follower, 6, 3/3. 兵士・ヒーロー.
// {[evolve]} {[cost02]}: Evolve this follower.
// Rush.
// {[fanfare]} Discard 2 Heroic cards: Search your deck for up to 2 Heroic followers with different
// names that cost 3 or less, summon them, then shuffle. (元のコスト.)
import type { CustomCost } from "../types";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { and, costAtMost, hasTrait, isFollower } from "../targets";

const heroic = hasTrait("ヒーロー");

/** "Discard 2 Heroic cards" (手札のヒーロー・カード2枚を捨てる). */
const discardTwoHeroic: CustomCost = {
  canPay: (g, p) => g.cards(p, "hand").filter((id) => heroic(g, id)).length >= 2,
  *pay(fx) {
    const cards = fx.game.cards(fx.controller, "hand").filter((id) => heroic(fx.game, id));
    yield* fx.discardCards(yield* fx.chooseCards(cards, 2, 2));
  },
};

const cheapHeroicFollower = and(isFollower, heroic, costAtMost(3));

export default defineCard({
  keywords: ["rush"],
  abilities: [
    evolveAbility(2),
    fanfare({
      cost: discardTwoHeroic,
      *resolve(fx) {
        yield* fx.search((id) => cheapHeroicFollower(fx.game, id), { max: 2, to: "field", distinctNames: true });
      },
    }),
  ],
});
