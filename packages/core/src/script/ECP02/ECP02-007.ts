// ECP02-007 Riina Tada [Wannabe Legend] (Evolved) — 5/5.
// On Evolve - Return an iM@S CG card on your field to its owner's hand: Select an enemy follower on the field and put it on the
// bottom of its owner's deck. (Its player puts it there; a token leaves the game. This card may be the one returned.)
// Activate, Lesson (1): You may summon an iM@S CG follower that costs 1 or less or iM@S CG amulet that costs 1 or less from your
// hand.
import { lesson } from "../costs";
import { activated, defineCard, onEvolve } from "../helpers";
import { costAtMost, enemyFollower, isAmulet, isFollower } from "../targets";
import { imas, maySummonFromHand, returnImasCardOnYourField } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      cost: returnImasCardOnYourField(imas),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.putOnDeck(fx.targets[0]!, "bottom");
      },
    }),
    activated(
      { custom: lesson(1) },
      {
        *resolve(fx) {
          yield* maySummonFromHand(fx, (g, id) => (isFollower(g, id) || isAmulet(g, id)) && imas(g, id) && costAtMost(1)(g, id));
        },
      },
    ),
  ],
});
