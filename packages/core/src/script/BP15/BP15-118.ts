// BP15-118 Resolve of the Fallen — Neutral spell, 1. 堕天使.
// Select an enemy follower on the field and deal it 2 damage. If there are at least 3 faceup evolved followers in
// your evolve deck, deal 4 damage instead. If there are at least 5, draw a card and recover 1 play point. (Not
// advanced followers, evolved amulets or point cards; not playable without a target — rulings. Both the draw and the
// recovery need 5 — Q10.)
import { defineCard, spell } from "../helpers";
import { enemyFollower, isEvolvedFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const faceUp = fx.game.faceUpEvolveDeck(fx.controller).filter((id) => isEvolvedFollower(fx.game, id)).length;
        yield* fx.dealDamage(fx.targets[0]![0]!, faceUp >= 3 ? 4 : 2);
        if (faceUp < 5) return;
        yield* fx.draw(1);
        yield* fx.recoverPlayPoints(1);
      },
    }),
  ],
});
