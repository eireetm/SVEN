// BP07-041 Delta Cannon — Runecraft spell, 1. 機械・ゴーレム.
// When a Tetra, Sapphire Rebel is put onto your field, {[cost01]}: Put this card from your cemetery
// into your EX area. (Valid in the cemetery — ruling, CR 10.3.5. It and Tetra's Fanfare are pending
// together, in any order — ruling.)
// {[quick]}
// Select an enemy follower on the field and deal it 2 damage.
import { playPointsCost } from "../costs";
import { defineCard, spell, whenCardEntersYourField } from "../helpers";
import { enemyFollower, named } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    {
      ...whenCardEntersYourField(
        {
          cost: playPointsCost(1),
          *resolve(fx) {
            if (fx.game.card(fx.self)?.zone === "cemetery") yield* fx.putIntoEx([fx.self]);
          },
        },
        { filter: named("Tetra, Sapphire Rebel") },
      ),
      validIn: ["cemetery"],
    },
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
