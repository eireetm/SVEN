// Shared pieces of BP21 Havencraft card scripts (not a card: the file name has no set prefix).
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { activated, whenThisGainsDefense } from "../helpers";
import { academicFollower } from "./shared";

/** "if there's another Academic follower on your field" (BP21-096, 098, 100, 103). */
export const anotherAcademicFollower = (g: GameReader, p: PlayerId, self: CardId): boolean =>
  g.followers(p).some((id) => id !== self && academicFollower(g, id));

/**
 * BP21-098 / 103 "Activate {[engage]} this: Give your leader {[defense]}+1. Activate only if there's another Academic follower
 * on your field."
 */
export const leaderPlusOne = activated(
  { engageSelf: true },
  {
    condition: (g, c, self) => anotherAcademicFollower(g, c, self),
    *resolve(fx) {
      yield* fx.giveLeaderDefense(fx.controller, 1);
    },
  },
);

/** BP21-100 / 101 "Whenever this gains {[defense]}, deal 1 damage to each enemy follower on the field." */
export const pureflame = whenThisGainsDefense({
  *resolve(fx) {
    yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 1);
  },
});
