// ECP01-004 Sounds of Earth — Forestcraft follower, 9, 3/2. ウマ娘.
// This card costs X less to play. X equals 2 times the number of Umamusume cards on your field.
// ----------
// {[feed]} {[cost01]}: Race this follower.
// {[fanfare]} Return an Umamusume card not named Sounds of Earth from your field to its owner's hand: Select an enemy follower
// on the field and deal it 5 damage. (Only your own field; not playable, so not payable, without an enemy follower to select —
// rulings.)
import { returnAnotherFromYourField } from "../costs";
import { defineCard, fanfare, serveAbility } from "../helpers";
import { enemyFollower, named } from "../targets";
import { umamusume, umamusumeOnYourField } from "./shared";

export default defineCard({
  playCost: (g, _self, c) => -2 * umamusumeOnYourField(g, c),
  abilities: [
    serveAbility(1, 1),
    fanfare({
      cost: returnAnotherFromYourField((g, id) => umamusume(g, id) && !named("Sounds of Earth")(g, id)),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
      },
    }),
  ],
});
