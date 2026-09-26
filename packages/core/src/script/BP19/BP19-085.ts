// BP19-085 Raging Commander — Abysscraft follower, 2, 2/1. 八獄・魔界.
// Your cards named Garodeth, Insurgent Convict cost 1 less to play. (Two of these: 2 less — ruling.)
// Four times on each of your turns, whenever your leader's defense decreases, select an enemy follower on the field and deal
// it 1 damage. (Per card: two of these, 4 each — ruling; CR 10.7.2.2.)
// {[fanfare]} Deal 1 damage to your leader. Draw a card.
import { defineCard, fanfare, whenYourLeaderLosesDefense } from "../helpers";
import { enemyFollower, named } from "../targets";
import { GARODETH } from "./shared";

export default defineCard({
  field: { playCostOf: (g, self, card, player) => (player === g.controller(self) && named(GARODETH)(g, card) ? -1 : 0) },
  abilities: [
    {
      ...whenYourLeaderLosesDefense({
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 1);
        },
      }),
      timesPerTurn: 4,
      triggerIf: (g, c) => g.activePlayer === c,
    },
    fanfare({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.controller), 1);
        yield* fx.draw(1);
      },
    }),
  ],
});
