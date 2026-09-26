// BP12-088 Charaton, Iceflame Priest — Havencraft follower, 5, 4/4. 信仰.
// {[fanfare]} Bury an amulet: Select an enemy follower on the field. Deal it 4 damage and recover 4 play
// points. (Not played without a target — ruling. An amulet on your field, CR 10.4.3.)
// Once on each of your turns, when an amulet you control leaves the field, deal 1 damage to each enemy
// leader.
import { defineCard, fanfare, whenYourCardLeaves } from "../helpers";
import { buryFromYourField } from "../costs";
import { enemyFollower, isAmulet } from "../targets";
import { yourTurn } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: buryFromYourField(isAmulet, 1),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        yield* fx.recoverPlayPoints(4);
      },
    }),
    whenYourCardLeaves(
      {
        triggerIf: yourTurn,
        oncePerTurn: true,
        *resolve(fx) {
          yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 1);
        },
      },
      { filter: (m) => m.before?.type === "amulet" },
    ),
  ],
});
