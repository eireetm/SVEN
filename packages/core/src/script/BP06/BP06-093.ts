// BP06-093 Saintly Leader — Havencraft follower, 3, 2/4. 先導.
// Ward.
// Activate {[engage]}, banish 3 followers with Ward from your cemetery: Select an enemy follower on
// the field and banish it. (Printed Ward only: a Fanfare that gives Ward doesn't count — ruling.)
import { activated, defineCard } from "../helpers";
import { enemyFollower, isFollower } from "../targets";
import type { GameReader } from "../../engine/query";
import type { CardId } from "../../model/ids";

const wardInCemetery = (g: GameReader, id: CardId) => isFollower(g, id) && g.info(id).keywords.includes("ward");

export default defineCard({
  keywords: ["ward"],
  abilities: [
    activated(
      {
        engageSelf: true,
        custom: {
          canPay: (g, c) => g.cards(c, "cemetery").filter((id) => wardInCemetery(g, id)).length >= 3,
          *pay(fx) {
            const cards = fx.game.cards(fx.controller, "cemetery").filter((id) => wardInCemetery(fx.game, id));
            yield* fx.banish(yield* fx.chooseCards(cards, 3, 3));
          },
        },
      },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.banish(fx.targets[0] ?? []);
        },
      },
    ),
  ],
});
