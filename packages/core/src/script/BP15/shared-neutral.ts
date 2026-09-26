// Shared pieces of BP15 Neutral card scripts (not a card: the file name has no set prefix).
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { Keyword } from "../../model/keyword";
import type { AbilityDef } from "../types";
import { fanfare, onEvolve } from "../helpers";
import { yourFollower } from "../targets";

/** BP15-113 / 114 "While your leader's defense is 10 or less, this has Drain." */
export const gilneliseDrain = (g: GameReader, self: CardId): readonly Keyword[] =>
  g.state.players[g.controller(self)].leaderDefense <= 10 ? ["drain"] : [];

/** BP15-115 / 116 "Select a follower on your field and give {[attack]}+1/{[defense]}+1." */
export const araelBlessing = (timing: "fanfare" | "onEvolve"): AbilityDef =>
  (timing === "fanfare" ? fanfare : onEvolve)({
    targets: [yourFollower()],
    *resolve(fx) {
      yield* fx.giveStats(fx.targets[0]![0]!, 1, 1);
    },
  });
