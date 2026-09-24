// BP02-041 Rimewind — Runecraft spell, 2. {[quick]}
// Select an unevolved enemy follower on the field and return it to its owner's hand.
// Spellchain (10): Put it on top of its owner's deck instead.
// (Only unevolved followers can be selected, even with Spellchain (10) — ruling; CR 13.3.1.2.)
import { defineCard, spell } from "../helpers";
import { enemyFollower, isUnevolved } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower({ filter: isUnevolved })],
      *resolve(fx) {
        const target = fx.targets[0]!;
        if (fx.game.spellchain(fx.controller, 10)) yield* fx.putOnDeck(target, "top");
        else yield* fx.returnToHand(target);
      },
    }),
  ],
});
