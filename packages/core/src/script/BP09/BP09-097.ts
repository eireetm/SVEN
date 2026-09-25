// BP09-097 Lycaon — Havencraft follower, 6, 5/5. 狂信・獣.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Discard an amulet: Select an enemy follower on the field. Deal it 5 damage and draw a card.
// (Without a target the Fanfare isn't played and nothing is discarded — ruling.)
import { discardA } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower, isAmulet } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare(
    {
      cost: discardA(isAmulet),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
        yield* fx.draw(1);
      },
    },
    ),
  ],
});
