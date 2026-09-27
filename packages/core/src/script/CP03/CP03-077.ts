// CP03-077 Gatling Claw Dragon — Dragoncraft follower, 2, 2/3. ヴァンガード・かげろう. Draw Trigger.
// Activate {[engage]}: Draw a card. Activate only if an enemy follower was put from the field into the cemetery this turn. (A
// token counts — ruling.)
// ----------
// (If this card is revealed by a drive check, draw a card.) (Resolved by the engine.)
import { activated, defineCard } from "../helpers";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true },
      {
        condition: (g, c) => g.followersToCemeteryThisTurn(g.opponent(c)) > 0,
        *resolve(fx) {
          yield* fx.draw(1);
        },
      },
    ),
  ],
});
