// BP08-057 Ouroboros — Dragoncraft follower, 7, 8/4. 竜族.
// {[fanfare]} Select an enemy follower; deal it 5 damage and give your leader +5 defense. With no
// target, none of the Fanfare is played (ruling, CR 10.6.2.3).
// {[lastwords]} Discard 2 cards: Put this card into its owner's EX area (CR 10.4.7.4, 12.5).
import { discardCardsCost } from "../costs";
import { defineCard, fanfare, lastWords } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
        yield* fx.giveLeaderDefense(fx.controller, 5);
      },
    }),
    lastWords({
      cost: discardCardsCost(2),
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "cemetery") yield* fx.putIntoEx([fx.self]);
      },
    }),
  ],
});
