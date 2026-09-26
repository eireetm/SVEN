// BP15-016 Horned Beastie — Forestcraft follower, 2, 3/2. 精霊・獣.
// Ward.
// {[lastwords]} Select a spell in your cemetery that costs 1 or less and add it to your hand. (元のコスト.)
import { defineCard, lastWords } from "../helpers";
import { and, costAtMost, inYourZone, isSpell } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    lastWords({
      targets: [inYourZone("cemetery", { filter: and(isSpell, costAtMost(1)) })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
      },
    }),
  ],
});
