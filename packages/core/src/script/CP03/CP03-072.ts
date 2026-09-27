// CP03-072 Prowling Dragon, Striken — Dragoncraft follower, 2, 5/5. ヴァンガード・かげろう.
// This follower can't attack enemies.
// Whenever you drive check a Trigger, this card loses all abilities for the rest of the turn. (Only a resolved Trigger; twice for
// Twin Drive. A Stand Trigger's "can't attack enemy leaders" is an effect, not an ability, and stays — rulings.)
import { defineCard, whenYouDriveCheckTrigger } from "../helpers";

export default defineCard({
  cannotAttack: true,
  abilities: [
    whenYouDriveCheckTrigger({
      *resolve(fx) {
        yield* fx.loseAbilities(fx.self, "endOfTurn");
      },
    }),
  ],
});
