// BP01-045 Luminous Knight — Swordcraft follower, 2, 3/1.
// {[fanfare]} Select another follower on your field and give it +1 attack.
// {[lastwords]} Select a follower on your field and give it +1 attack.
import { defineCard, fanfare, lastWords } from "../helpers";
import { anotherYourFollower, yourFollower } from "../targets";
import type { EffectContext } from "../../engine/effects/context";

function* plusOne(fx: EffectContext) {
  yield* fx.giveStats(fx.targets[0]![0]!, 1, 0);
}

export default defineCard({
  abilities: [
    fanfare({ targets: [anotherYourFollower()], resolve: plusOne }),
    lastWords({ targets: [yourFollower()], resolve: plusOne }),
  ],
});
