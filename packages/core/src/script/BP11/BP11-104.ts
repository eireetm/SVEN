// BP11-104 Sylvia, Grand Arbiter (Evolved) — Neutral follower, 3/3. 超克.
// On Evolve - Select an enemy follower on the field and, if there are at least 5 faceup evolved followers
// in your evolve deck, deal it 5 damage. (This card itself, advanced followers and Drive Points don't
// count — rulings.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower, isEvolvedFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (fx.game.faceUpEvolveDeck(fx.controller).filter((id) => isEvolvedFollower(fx.game, id)).length >= 5) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 5);
        }
      },
    }),
  ],
});
