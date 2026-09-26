// BP10-085 Unselfish Grace — Abysscraft amulet, 1. アルカナ・魔界・光輝.
// {[fanfare]} Place X grace counters on this card. X equals the number of cards in your hand.
// Activate {[engage]}, remove 2 grace counters from this card: Give your leader {[defense]}+1.
// {[act]} {[cost01]}, {[engage]}, bury this card: Search your deck for a 7-cost Arcana card, reveal it,
// add it to your hand, then shuffle. (元のコスト 7. It may find nothing — ruling.)
import type { CustomCost } from "../types";
import { activated, defineCard, fanfare } from "../helpers";
import { arcana } from "./shared";

/** "Remove 2 grace counters from this card" (CR 15.1). */
const removeTwoGrace: CustomCost = {
  canPay: (g, _p, self) => g.counters(self, "grace") >= 2,
  *pay(fx) {
    yield* fx.removeCounters(fx.self, "grace", 2);
  },
};

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const x = fx.game.cards(fx.controller, "hand").length;
        if (x > 0 && fx.game.card(fx.self)?.zone === "field") yield* fx.addCounters(fx.self, "grace", x);
      },
    }),
    activated(
      { engageSelf: true, custom: removeTwoGrace },
      {
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 1);
        },
      },
    ),
    activated(
      { playPoints: 1, engageSelf: true, burySelf: true },
      {
        *resolve(fx) {
          yield* fx.search((id) => arcana(fx.game, id) && fx.game.info(id).cost === 7);
        },
      },
    ),
  ],
});
