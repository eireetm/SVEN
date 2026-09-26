// BP16-067 Marion, Ravishing Dragonewt — Dragoncraft follower, 2, 2/3. ドラゴニュート.
// {[fanfare]} Draw a card. Discard a card.
// Activate {[engage]} this: Select an enemy follower on the field and deal it 4 damage. Activate only if there are at
// least 4 {[dragoncraft]} cards in your cemetery that cost 7 or more.
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { bigDragonsInCemetery } from "./shared-dragon";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
    activated(
      { engageSelf: true },
      {
        condition: (g, p) => bigDragonsInCemetery(g, p) >= 4,
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        },
      },
    ),
  ],
});
