// Shared pieces of BP18 Havencraft card scripts (not a card: the file name has no set prefix).
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { whenYourLeaderGainsDefense } from "../helpers";
import { enemyFollower, isFollower, named } from "../targets";
import { SEISHIRO, toghKeyoh } from "./shared";

/**
 * BP18-097 / 098 / 099 "Whenever your leader gains {[defense]}, select an enemy follower on the field and deal it 2 damage."
 * (On the opponent's turn too — rulings; CR 5.27.)
 */
export const judgment = whenYourLeaderGainsDefense({
  targets: [enemyFollower()],
  *resolve(fx) {
    yield* fx.dealDamage(fx.targets[0]![0]!, 2);
  },
});

/** "a Seishiro, Admonishing Faith on your field" (BP18-105, 110). */
export const seishiroOnField = (g: GameReader, p: PlayerId): boolean => g.cards(p, "field").some((id) => named(SEISHIRO)(g, id));

/** "the number of Togh Keyoh followers on your field" (BP18-099, T08). */
export const toghKeyohFollowers = (g: GameReader, p: PlayerId): number => g.followers(p).filter((id) => toghKeyoh(g, id)).length;

/** "a Togh Keyoh follower" (BP18-098, 101, 109). */
export const toghKeyohFollower = (g: GameReader, id: CardId): boolean => isFollower(g, id) && toghKeyoh(g, id);
