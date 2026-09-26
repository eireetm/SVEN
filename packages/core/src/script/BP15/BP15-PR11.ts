// BP15-PR11 Ersatz Elimination — Runecraft spell token, 1. 絶傑・魔法使い.
// Select a follower in your cemetery with both the Omen and Mage traits that costs 3 or less and summon it.
// (元のコスト.)
import { defineCard, spell } from "../helpers";
import { and, costAtMost, inYourZone } from "../targets";
import { omenMageFollower } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [inYourZone("cemetery", { filter: and(omenMageFollower, costAtMost(3)) })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
  ],
});
