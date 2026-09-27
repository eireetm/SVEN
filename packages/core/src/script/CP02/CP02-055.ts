// CP02-055 Fumika Sagisawa — Dragoncraft follower, 7, 4/4. デレマス・クール.
// {[fanfare]} Search your deck for a 3-cost follower and 1-cost follower, summon them, then shuffle your deck. (元のコスト; one of
// them may be left in the deck — ruling; CR 5.8.)
// Whenever another iM@S CG follower is put onto your field, select an enemy follower on the field and deal it 2 damage. (Once
// per follower; with the summoned followers' Fanfares, the player chooses the order — rulings.)
import { defineCard, fanfare, whenFollowerEntersYourField } from "../helpers";
import { enemyFollower, isFollower } from "../targets";
import { imas } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        const costing = (n: number) => (id: string) => isFollower(g, id) && g.info(id).cost === n;
        yield* fx.searchEach([costing(3), costing(1)], { to: "field" });
      },
    }),
    whenFollowerEntersYourField(
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        },
      },
      { another: true, filter: imas },
    ),
  ],
});
