// BP18-094 Prince Catacomb — Abysscraft follower, 4, 2/2. 死霊術師.
// {[fanfare]}/{[lastwords]} Select a follower in your cemetery that costs 1 or less and summon it. (元のコスト.)
import { defineCard, fanfare, lastWords, type TimingSpec } from "../helpers";
import { and, costAtMost, inYourZone, isFollower } from "../targets";

const raise: TimingSpec = {
  targets: [inYourZone("cemetery", { filter: and(isFollower, costAtMost(1)) })],
  *resolve(fx) {
    yield* fx.putOntoField(fx.targets[0]!);
  },
};

export default defineCard({
  abilities: [fanfare(raise), lastWords(raise)],
});
