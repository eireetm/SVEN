// Shared pieces of BP18 Forestcraft card scripts (not a card: the file name has no set prefix).
import { whenYourFollowerEvolves } from "../helpers";
import { yourFollower } from "../targets";
import { toghKeyoh } from "./shared";

/**
 * BP18-009 / 010 "Whenever a follower on your field evolves, select a Togh Keyoh follower on your field and give it
 * {[attack]}+1/{[defense]}+1."
 */
export const pugilistBoost = whenYourFollowerEvolves({
  targets: [yourFollower({ filter: toghKeyoh })],
  *resolve(fx) {
    yield* fx.giveStats(fx.targets[0]![0]!, 1, 1);
  },
});
