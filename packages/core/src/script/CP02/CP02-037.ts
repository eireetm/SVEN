// CP02-037 Shiki Ichinose (Evolved) — 4/7.
// On Evolve - Select up to 1 card in your EX area and deal damage equal to its cost to your leader. It costs 0 play points to
// play this turn. (元のコスト; selecting none deals no damage — ruling.)
// Activate {[engage]}, discard a card: Select an enemy follower on the field and deal it 5 damage.
import { discardCardsCost } from "../costs";
import { activated, defineCard, onEvolve } from "../helpers";
import { enemyFollower, inYourZone } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [inYourZone("ex", { upTo: true })],
      *resolve(fx) {
        const [card] = fx.targets[0] ?? [];
        if (card === undefined || fx.game.card(card)?.zone !== "ex") return;
        const cost = fx.game.info(card).cost ?? 0;
        if (cost > 0) yield* fx.dealDamage(fx.game.leader(fx.controller), cost);
        yield* fx.setPlayCost(card, 0, "endOfTurn");
      },
    }),
    activated(
      { engageSelf: true, custom: discardCardsCost(1) },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 5);
        },
      },
    ),
  ],
});
