// Shared pieces of BP20 Neutral card scripts (not a card: the file name has no set prefix).
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { TimingSpec } from "../helpers";
import { anotherFollower } from "../targets";

/** "If you don't have a Super Evolution Point" (BP20-113, 114, 116): each player starts with 1 (ruling, CR 12.2.4). */
export const noSuperEvolutionPoint = (g: GameReader, p: PlayerId): boolean => g.state.players[p].superEvolutionPoints === 0;

/** "if there are 1 or less cards in your hand" (BP20-112, T11). */
export const oneOrLessInHand = (g: GameReader, p: PlayerId): boolean => g.cards(p, "hand").length <= 1;

/** BP20-118 / 119 "Select another follower on the field and give it {[attack]}+2/{[defense]}-2." */
export const apostleBoost: TimingSpec = {
  targets: [anotherFollower()],
  *resolve(fx) {
    yield* fx.giveStats(fx.targets[0]![0]!, 2, -2);
  },
};
