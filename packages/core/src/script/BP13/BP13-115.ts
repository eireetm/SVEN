// BP13-115 Dogged Detective — Neutral follower, 3, 3/4. 探偵.
// {[fanfare]} Select a follower with {[evolve]} in your cemetery and add it to your hand.
// Whenever a follower on your field evolves, give this follower Rush.
import { defineCard, fanfare, whenYourFollowerEvolves } from "../helpers";
import { inYourZone, isFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [inYourZone("cemetery", { filter: (g, id) => isFollower(g, id) && g.hasEvolveAbility(g.card(id)!.def) })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
      },
    }),
    whenYourFollowerEvolves({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "rush");
      },
    }),
  ],
});
