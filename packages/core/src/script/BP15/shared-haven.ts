// Shared pieces of BP15 Havencraft card scripts (not a card: the file name has no set prefix).
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { AutomaticAbility } from "../types";
import { atStartOfOpponentsMainPhase } from "../helpers";
import { and, enemyFollower, isFollower, nameIncludes } from "../targets";

type Filter = (g: GameReader, id: CardId) => boolean;

/** "a follower with Ward" (CR 12.8). */
export const wardFollower: Filter = (g, id) => isFollower(g, id) && g.hasKeyword(id, "ward");

/** "the number of followers on your field with Ward" (BP15-096, 099, 104, 109). */
export const wardFollowersOnField = (g: GameReader, p: PlayerId): number => g.followers(p).filter((id) => g.hasKeyword(id, "ward")).length;

/** "a follower with "Marwynn" in its name" (BP15-101, 103). */
export const marwynnFollower: Filter = and(isFollower, nameIncludes("Marwynn"));

/** BP15-094 / 095 "At the start of each opponent's main phase, give your leader {[defense]}+2." */
export const marwynnHeal = (): AutomaticAbility =>
  atStartOfOpponentsMainPhase({
    *resolve(fx) {
      yield* fx.giveLeaderDefense(fx.controller, 2);
    },
  });

/**
 * BP15-102 / 103 "At the start of each opponent's main phase, select an enemy follower on the field. If this is
 * reserved, the selected follower can't attack enemies this turn."
 */
export const despairLock = (): AutomaticAbility =>
  atStartOfOpponentsMainPhase({
    targets: [enemyFollower()],
    *resolve(fx) {
      if (fx.game.card(fx.self)?.zone !== "field" || fx.game.card(fx.self)?.engaged !== false) return;
      yield* fx.cannotAttack(fx.targets[0]![0]!, "endOfTurn");
    },
  });
