// BP10-102 Wheel of Misfortune — Havencraft amulet, 2. アルカナ・信仰.
// {[fanfare]} If there's a X. Slaus, Wheel of Fortune on your field, place up to 2 calamity counters on
// this card.
// Activate {[engage]}: Place a calamity counter on this card.
// Activate {[engage]}, bury this card: Destroy each X-cost enemy follower on the field. X equals the
// number of calamity counters this card had. (元のコスト: an evolved follower's is its base card's —
// ruling.)
import type { CustomCost } from "../types";
import { activated, defineCard, fanfare } from "../helpers";
import { onYourField } from "./shared";

const UP_TO_2 = [0, 1, 2].map((n) => ({ id: String(n), label: `${n} calamity counter(s)` }));

/** Remembers the counters the card has before it is buried (the buried card is a new card, CR 4.1.4). */
const rememberCalamity: CustomCost = {
  canPay: () => true,
  *pay(fx) {
    fx.memory.calamity = fx.game.counters(fx.self, "calamity");
  },
};

export default defineCard({
  abilities: [
    fanfare({
      condition: (g, p) => onYourField(g, p, "X. Slaus, Wheel of Fortune"),
      *resolve(fx) {
        const [n] = yield* fx.choose(UP_TO_2);
        if (Number(n) > 0 && fx.game.card(fx.self)?.zone === "field") yield* fx.addCounters(fx.self, "calamity", Number(n));
      },
    }),
    activated(
      { engageSelf: true },
      {
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "field") yield* fx.addCounters(fx.self, "calamity", 1);
        },
      },
    ),
    activated(
      { engageSelf: true, custom: rememberCalamity, burySelf: true },
      {
        *resolve(fx) {
          const x = Number(fx.memory.calamity ?? 0);
          const opponent = fx.game.opponent(fx.controller);
          yield* fx.destroy(fx.game.followers(opponent).filter((id) => fx.game.info(id).cost === x));
        },
      },
    ),
  ],
});
