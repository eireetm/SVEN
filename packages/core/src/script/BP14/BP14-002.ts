// BP14-002 Hozumi, Enchanting Hostess (Evolved) — Forestcraft follower, 3/3. 宴楽・獣.
// {[act]} {[cost02]}, banish another Festive card from your field: Search your deck for a follower that costs
// 7 or less, summon it, then shuffle. Activate only if you've played at least 3 cards this turn, and only
// once per turn. (元のコスト.)
import type { CustomCost } from "../types";
import { activated, defineCard } from "../helpers";
import { and, costAtMost, isFollower } from "../targets";
import { festive } from "./shared";

const banishAnotherFestive: CustomCost = {
  canPay: (g, c, self) => g.cards(c, "field").some((id) => id !== self && festive(g, id)),
  *pay(fx) {
    const cards = fx.game.cards(fx.controller, "field").filter((id) => id !== fx.self && festive(fx.game, id));
    yield* fx.banish(yield* fx.chooseCards(cards, 1, 1));
  },
};

export default defineCard({
  abilities: [
    activated(
      { playPoints: 2, custom: banishAnotherFestive },
      {
        oncePerTurn: true,
        condition: (g, p) => g.playedThisTurn(p) >= 3,
        *resolve(fx) {
          yield* fx.search((id) => and(isFollower, costAtMost(7))(fx.game, id), { to: "field" });
        },
      },
    ),
  ],
});
