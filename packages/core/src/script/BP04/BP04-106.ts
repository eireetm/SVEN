// BP04-106 Star Priestess — Havencraft follower, 6, 3/3. 信仰・星神.
// {[evolve]} Banish an amulet on your field: Evolve this follower.
// {[fanfare]} {[engage]} 2 amulets on your field: Select an enemy follower on the field. Deal it 3
// damage and give your leader +3 defense. (Without an enemy follower to select, nothing happens —
// ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower, isAmulet } from "../targets";
import { engageTwoAmulets } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility({
      custom: {
        canPay: (g, c) => g.cards(c, "field").some((id) => isAmulet(g, id)),
        *pay(fx) {
          const amulets = fx.game.cards(fx.controller, "field").filter((id) => isAmulet(fx.game, id));
          yield* fx.banish(yield* fx.chooseCards(amulets, 1, 1));
        },
      },
    }),
    fanfare({
      cost: engageTwoAmulets,
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        yield* fx.giveLeaderDefense(fx.controller, 3);
      },
    }),
  ],
});
