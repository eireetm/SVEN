// BP12-006 Irene, Harvest Defender — Forestcraft follower, 6, 6/6. エルフ族.
// Rush. Assail.
// During your turn, this follower doesn't take damage. (Only damage: -X/-X still applies — ruling.)
// Strike - Draw a card and refresh this follower. Perform only once per turn. (CR 10.7.2.2; not again
// after it attacks a second time — ruling.)
import { defineCard, strike } from "../helpers";

export default defineCard({
  keywords: ["rush", "assail"],
  field: {
    damageTaken: (g, self, damage) => (g.activePlayer === g.controller(self) ? -damage.amount : 0),
  },
  abilities: [
    strike({
      oncePerTurn: true,
      *resolve(fx) {
        yield* fx.draw(1);
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.refresh([fx.self]);
      },
    }),
  ],
});
