// BP19-018 Galepierce — Forestcraft spell, 4. エルフ族.
// Return a card on your field to its owner's hand: Select an enemy follower on the field and deal it 6 damage. Deal 2 damage
// to its leader. (Not playable without a target — ruling; the return is asked as it resolves, CR 10.4.7.5; your field,
// CR 10.4.3.)
import { returnAnotherCardOnYourField } from "../costs";
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (!(yield* fx.optionalCost(returnAnotherCardOnYourField))) return;
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.dealDamage(target, 6);
        yield* fx.dealDamage(leader, 2);
      },
    }),
  ],
});
