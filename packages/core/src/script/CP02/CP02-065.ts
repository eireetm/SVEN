// CP02-065 Yukari Mizumoto — Dragoncraft follower, 4, 4/4. デレマス・キュート.
// {[fanfare]} Choose one of the following. (1) Select an enemy amulet on the field and destroy it. (2) Draw a card.
// (Without an enemy amulet (1) can't be chosen — ruling, CR 5.18.)
import { defineCard, fanfare } from "../helpers";
import { enemyCardOnField, isAmulet } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      modes: [
        {
          id: "1",
          label: "Destroy an enemy amulet",
          targets: [enemyCardOnField({ filter: isAmulet })],
          *resolve(fx) {
            yield* fx.destroy(fx.targets[0]!);
          },
        },
        {
          id: "2",
          label: "Draw a card",
          *resolve(fx) {
            yield* fx.draw(1);
          },
        },
      ],
    }),
  ],
});
