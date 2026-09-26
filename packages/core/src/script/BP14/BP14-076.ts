// BP14-076 Frigid Necromancer — Abysscraft follower, 6, 5/5. 死霊術師.
// Activate {[engage]} this: Select a follower in your cemetery that costs 8 or less. Summon it and change its
// attack and defense to 1. (元のコスト; evolved later it is 1 more than its printed values — ruling, CR 5.16.2.1.)
// {[lastwords]} Banish this.
import { activated, changeStatsTo, defineCard, lastWords } from "../helpers";
import { and, costAtMost, inYourZone, isFollower } from "../targets";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true },
      {
        targets: [inYourZone("cemetery", { filter: and(isFollower, costAtMost(8)) })],
        *resolve(fx) {
          for (const id of yield* fx.putOntoField(fx.targets[0]!)) yield* changeStatsTo(fx, id, { attack: 1, defense: 1 });
        },
      },
    ),
    lastWords({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "cemetery") yield* fx.banish([fx.self]);
      },
    }),
  ],
});
