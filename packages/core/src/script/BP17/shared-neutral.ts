// Shared pieces of BP17 Neutral card scripts (not a card: the file name has no set prefix).
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";

/**
 * "the number of followers in your cemetery" (BP17-111, 118). Uses typeAndTraits, not info: it is also asked while
 * computing BP17-111's keywords.
 */
export const followersInCemetery = (g: GameReader, p: PlayerId): number =>
  g.cards(p, "cemetery").filter((id) => g.typeAndTraits(id).type === "follower").length;
