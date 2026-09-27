// CP04-098 Yukari — Havencraft follower, 2, 2/3. プリコネ・メルクリウス財団.
// {[ub]}{[fanfare]} {[engage]} an amulet on your field: Select another follower on your field and give it {[defense]}+2. (Not paid,
// or without another follower, it isn't executed — ruling.)
// Ward.
// Activate {[engage]} this: Refresh each amulet on your field.
import { engageYourCards } from "../costs";
import { activated, defineCard, fanfare, ub } from "../helpers";
import { anotherYourFollower, isAmulet } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    ub(
      fanfare({
        cost: engageYourCards(isAmulet, 1),
        targets: [anotherYourFollower()],
        *resolve(fx) {
          yield* fx.giveStats(fx.targets[0]![0]!, 0, 2);
        },
      }),
    ),
    activated(
      { engageSelf: true },
      {
        *resolve(fx) {
          yield* fx.refresh(fx.game.cards(fx.controller, "field").filter((id) => isAmulet(fx.game, id)));
        },
      },
    ),
  ],
});
