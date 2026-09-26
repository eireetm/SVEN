// BP15-098 Shiro, Cursed Wings — Havencraft follower, 4, 3/3. 先導・狂信・鳥族.
// {[evolve]} {[cost01]}: Evolve this.
// Ward.
// {[fanfare]} Select a follower in your cemetery with Ward that costs 2 or less and summon it. (元のコスト.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { and, costAtMost, inYourZone } from "../targets";
import { wardFollower } from "./shared-haven";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [inYourZone("cemetery", { filter: and(wardFollower, costAtMost(2)) })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
  ],
});
