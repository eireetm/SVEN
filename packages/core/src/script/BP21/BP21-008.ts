// BP21-008 Dwarven Lumberjack — Forestcraft follower, 5, 4/4. 精霊・学院.
// Whenever another Academic or Beast follower is put onto your field, select an enemy follower on the field. Deal 5 damage to
// it and 1 damage to its leader. (Not played without a target; on the opponent's turn too — rulings.)
// {[fanfare]} You may summon an Academic or Beast follower that costs 4 or less from your hand. (元のコスト.)
import { defineCard, fanfare, whenFollowerEntersYourField } from "../helpers";
import { costAtMost, enemyFollower } from "../targets";
import { academicOrBeastFollower } from "./shared";

export default defineCard({
  abilities: [
    whenFollowerEntersYourField(
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          yield* fx.dealDamages([
            { target, amount: 5 },
            { target: fx.game.leader(fx.game.controller(target)), amount: 1 },
          ]);
        },
      },
      { another: true, filter: academicOrBeastFollower },
    ),
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        const cards = g.cards(fx.controller, "hand").filter((id) => academicOrBeastFollower(g, id) && costAtMost(4)(g, id));
        const chosen = yield* fx.chooseCards(cards, 0, 1);
        if (chosen.length > 0) yield* fx.putOntoField(chosen);
      },
    }),
  ],
});
