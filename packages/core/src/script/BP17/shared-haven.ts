// Shared pieces of BP17 Havencraft card scripts (not a card: the file name has no set prefix).
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { isAmulet, isFollower, nameIncludes } from "../targets";
import { machina } from "./shared";

/** "the number of amulets on your field" (BP17-091, 092, 109). */
export const amuletsOnField = (g: GameReader, p: PlayerId): number => g.cards(p, "field").filter((id) => isAmulet(g, id)).length;

/** "the number of Machina followers on your field" (BP17-107). */
export const machinaFollowers = (g: GameReader, p: PlayerId): number => g.followers(p).filter((id) => machina(g, id)).length;

/** "a Machina follower that costs 2 or less" (元のコスト, BP17-098, 101). */
export const smallMachinaFollower = (g: GameReader, id: CardId): boolean =>
  isFollower(g, id) && machina(g, id) && (g.info(id).cost ?? Infinity) <= 2;

/** "a follower with 'Marlone' in its name" (BP17-102, 108). */
export const marloneFollower = (g: GameReader, id: CardId): boolean => isFollower(g, id) && nameIncludes("Marlone")(g, id);
