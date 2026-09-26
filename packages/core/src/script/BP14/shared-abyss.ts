// Shared pieces of BP14 Abysscraft card scripts (not a card: the file name has no set prefix).
import type { AutomaticAbility } from "../types";
import { whenDiscardedOrBanishedFromHand } from "../helpers";
import { hasRoom } from "./shared";

export const ANISAGE = "Anisage, Lost Forsaken";
export const PARACELISE = "Paracelise, Demon of Greed";

/**
 * BP14-074 "When this is discarded or banished from your hand, you may put it into your EX area." (Also a
 * discard to the hand limit — ruling.) A full EX area can't take it (CR 4.8.3.2).
 */
export const anisageToEx: AutomaticAbility = whenDiscardedOrBanishedFromHand({
  *resolve(fx) {
    const c = fx.game.card(fx.self);
    if (!c || (c.zone !== "cemetery" && c.zone !== "banished") || !hasRoom(fx.game, c.owner, "ex")) return;
    if (yield* fx.confirm()) yield* fx.putIntoEx([fx.self]);
  },
});
