// ECP02-062 Kaede Takagaki [Cinderella Girl] — Havencraft follower, 3, 2/4. デレマス・クール.
// Ward.
// {[fanfare]} Select an enemy follower on the field and, if there are at least 10 iM@S CG cards in your cemetery, destroy it.
// {[act]} Lesson (1), {[engage]}, discard a card: Select an enemy follower on the field and destroy it.
import { allCosts, discardCardsCost, lesson } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { imas, inYourCemetery } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (inYourCemetery(fx.game, fx.controller, imas) >= 10) yield* fx.destroy(fx.targets[0]!);
      },
    }),
    activated(
      { engageSelf: true, custom: allCosts(lesson(1), discardCardsCost(1)) },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.destroy(fx.targets[0]!);
        },
      },
    ),
  ],
});
