// BP04-104 Globe of the Starways — Havencraft amulet, 2. 信仰・星神.
// (BP04-105 is the same card.)
// {[fanfare]} Search your deck for an amulet, reveal it, and add it to your hand.
// {[q]}Activate {[cost02]}, {[engage]}, put this card into its owner's cemetery: Give your leader +1
// defense. Draw a card.
import { activated, defineCard, fanfare } from "../helpers";
import { isAmulet } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => isAmulet(fx.game, id));
      },
    }),
    activated(
      { playPoints: 2, engageSelf: true, burySelf: true },
      {
        quick: true,
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 1);
          yield* fx.draw(1);
        },
      },
    ),
  ],
});
