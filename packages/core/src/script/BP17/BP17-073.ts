// BP17-073 Luna, Soul Keeper — Abysscraft follower, 1, 0/2. 死霊術師.
// {[fanfare]} Put a Luna's Doll token into your EX area.
// Activate {[engage]} this: Select an {[abysscraft]} follower in your cemetery not named Luna, Soul Keeper that costs 2 or
// less and add it to your hand. Activate only if there are at least 10 cards in your cemetery. (Original cost, 元のコスト.)
import { activated, defineCard, fanfare } from "../helpers";
import { and, costAtMost, inYourZone, isClass, isFollower, named } from "../targets";

const notLuna = named("Luna, Soul Keeper");

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Luna's Doll"]);
      },
    }),
    activated(
      { engageSelf: true },
      {
        condition: (g, c) => g.cards(c, "cemetery").length >= 10,
        targets: [inYourZone("cemetery", { filter: and(isFollower, isClass("Abysscraft"), (g, id) => !notLuna(g, id), costAtMost(2)) })],
        *resolve(fx) {
          yield* fx.returnToHand(fx.targets[0]!);
        },
      },
    ),
  ],
});
