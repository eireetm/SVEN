// BP03-109 Angel of Chaos — Neutral follower, 7, 5/5. 天使・堕天使.
// Ward.
// Activate, banish 3 Fallen Angel cards in your cemetery: Select an enemy follower. Steal it and
// refresh it. Once per turn. (CR 5.22: not a new entry, keeps damage and evolution. With your
// field full it is not stolen, CR 4.4.4.2, but it is still refreshed on its field — ruling.)
import { activated, defineCard } from "../helpers";
import { enemyFollower, hasTrait } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    activated(
      {
        custom: {
          canPay: (g, c) => g.cards(c, "cemetery").filter((id) => hasTrait("堕天使")(g, id)).length >= 3,
          *pay(fx) {
            const cards = fx.game.cards(fx.controller, "cemetery").filter((id) => hasTrait("堕天使")(fx.game, id));
            yield* fx.banish(yield* fx.chooseCards(cards, 3, 3));
          },
        },
      },
      {
        oncePerTurn: true,
        targets: [enemyFollower()],
        *resolve(fx) {
          const id = fx.targets[0]?.[0];
          if (!id) return;
          const neu = yield* fx.steal(id);
          yield* fx.refresh([neu ?? id]);
        },
      },
    ),
  ],
});
