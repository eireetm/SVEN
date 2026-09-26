// Shared pieces of BP20 Swordcraft card scripts (not a card: the file name has no set prefix).
import type { ActivatedAbility } from "../types";
import { fuse, fusedCards } from "../costs";
import { activated } from "../helpers";
import { and, costAtLeast } from "../targets";
import { loot } from "./shared";

/**
 * "Activate, Fuse N Loot cards that cost at least 1: Put [counters] fusion counters on this." (CR 12.18; valid in the
 * hand — rulings; 元のコスト). `counters` gets the number of cards fused (BP20-020 "X equals the number fused").
 */
export function fuseLootForCounters(n: number, counters: (fused: number) => number, upTo = false): ActivatedAbility {
  return activated(
    { custom: fuse(and(loot, costAtLeast(1)), n, { upTo }) },
    {
      validIn: ["hand"],
      *resolve(fx) {
        const card = fx.memory.fusion;
        const count = counters(fusedCards(fx.memory).length);
        if (typeof card === "string" && count > 0) yield* fx.addCounters(card, "fusion", count);
      },
    },
  );
}
