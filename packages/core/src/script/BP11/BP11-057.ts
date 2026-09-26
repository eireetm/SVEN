// BP11-057 Balefire Wrenchsmith — Dragoncraft follower, 2, 2/1. 荒野・竜族.
// {[fanfare]} Summon a Dutiful Steed token.
// During your turn, whenever another Wasteland card is put onto your field, select an enemy follower on
// the field and deal it 1 damage. (Twice for two at once — ruling.)
import { defineCard, fanfare, whenCardEntersYourField } from "../helpers";
import { enemyFollower } from "../targets";
import { STEED, wasteland, yourTurn } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon([STEED]);
      },
    }),
    whenCardEntersYourField(
      {
        triggerIf: yourTurn,
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 1);
        },
      },
      { another: true, filter: wasteland },
    ),
  ],
});
