// BP04-063 Prime Dragon Keeper — Dragoncraft follower, 3, 1/5. 竜使い.
// {[fanfare]} If Overflow is active for you, give this follower +1/+1 and Intimidate.
// Whenever another Dragoncraft follower that costs 3 play points or less is put onto your field,
// select an enemy follower on the field. Deal 2 damage to it and 1 damage to its leader.
// Once per follower, each copy (rulings); without an enemy follower to select nothing happens
// (ruling).
import { defineCard, fanfare, whenFollowerEntersYourField } from "../helpers";
import { enemyFollower, isClass } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        if (!fx.game.overflow(fx.controller)) return;
        yield* fx.giveStats(fx.self, 1, 1);
        yield* fx.giveKeyword(fx.self, "intimidate");
      },
    }),
    whenFollowerEntersYourField(
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          yield* fx.dealDamages([
            { target, amount: 2 },
            { target: fx.game.leader(fx.game.controller(target)), amount: 1 },
          ]);
        },
      },
      { another: true, filter: (g, id) => isClass("Dragoncraft")(g, id) && (g.info(id).cost ?? 99) <= 3 },
    ),
  ],
});
