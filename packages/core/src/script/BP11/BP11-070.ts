// BP11-070 Iceschillendrig, Gilded Autocrat (Evolved) — Abysscraft follower, 6/6. 荒野・死者・魔界.
// On Evolve - Discard a card: Select 2 followers in your cemetery and add them to your hand. (The
// targets are selected before the cost is paid, so not the discarded card; with fewer than 2 it isn't
// played — rulings.)
// Whenever this card becomes engaged, each opponent discards a card.
// During your turn, whenever a player discards a card, select an enemy follower on the field and engage
// it. (Once per card — ruling.)
import { discardCardsCost } from "../costs";
import { defineCard, onEvolve, whenAnyPlayerDiscards, whenThisBecomesEngaged } from "../helpers";
import { enemyFollower, inYourZone, isFollower } from "../targets";
import { yourTurn } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [inYourZone("cemetery", { count: 2, filter: isFollower })],
      cost: discardCardsCost(1),
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
      },
    }),
    whenThisBecomesEngaged({
      *resolve(fx) {
        yield* fx.discard(fx.game.opponent(fx.controller), 1, 1);
      },
    }),
    whenAnyPlayerDiscards({
      triggerIf: yourTurn,
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.engage(fx.targets[0]!);
      },
    }),
  ],
});
