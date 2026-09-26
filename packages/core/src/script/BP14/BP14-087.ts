// BP14-087 Full Moon Leap — Abysscraft spell, 1. 魔界・獣.
// Select an {[abysscraft]} follower on your field. Give it {[attack]}+1 and, if there are 0 cards in your hand,
// give it Storm. (This card doesn't count: it has been played — ruling.)
import { defineCard, spell } from "../helpers";
import { isClass, yourFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [yourFollower({ filter: isClass("Abysscraft") })],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.giveStats(target, 1, 0);
        if (fx.game.cards(fx.controller, "hand").length === 0) yield* fx.giveKeyword(target, "storm");
      },
    }),
  ],
});
