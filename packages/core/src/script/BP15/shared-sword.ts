// Shared pieces of BP15 Swordcraft card scripts (not a card: the file name has no set prefix).
import type { CustomCost } from "../types";

export const KAGEMITSU = "Kagemitsu, Lost Samurai";
export const SPIRIT = "fightingSpirit";

/** BP15-022 "Remove N fighting spirit counters from this". */
export const removeSpirit = (n: number): CustomCost => ({
  canPay: (g, _c, self) => g.counters(self, SPIRIT) >= n,
  *pay(fx) {
    yield* fx.removeCounters(fx.self, SPIRIT, n);
  },
});
