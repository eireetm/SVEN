// BP09-006 Greenglen Axeman — Forestcraft follower, 3, 4/3. エルフ族・狩人.
// Once on each of your turns, when you discard a {[forestcraft]} spell, draw a card.
// {[act]} {[engage]}, discard a card: Choose one of the following. (1) Select an enemy follower on the
// field and deal it 4 damage. (2) Deal 2 damage to each enemy leader.
import { discardCardsCost } from "../costs";
import { activated, defineCard, whenYouDiscard } from "../helpers";
import { enemyFollower } from "../targets";
import { forestSpell } from "./shared";

export default defineCard({
  abilities: [
    whenYouDiscard(
      {
        oncePerTurn: true,
        triggerIf: (g, c) => g.activePlayer === c,
        *resolve(fx) {
          yield* fx.draw(1);
        },
      },
      forestSpell,
    ),
    activated(
      { engageSelf: true, custom: discardCardsCost(1) },
      {
        modes: [
          {
            id: "follower",
            label: "(1) Deal 4 damage to an enemy follower",
            targets: [enemyFollower()],
            *resolve(fx) {
              yield* fx.dealDamage(fx.targets[0]![0]!, 4);
            },
          },
          {
            id: "leader",
            label: "(2) Deal 2 damage to each enemy leader",
            *resolve(fx) {
              yield* fx.dealDamageEach([fx.game.leader(fx.game.opponent(fx.controller))], 2);
            },
          },
        ],
      },
    ),
  ],
});
