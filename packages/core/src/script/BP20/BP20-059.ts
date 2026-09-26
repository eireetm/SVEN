// BP20-059 Dagon, Lord of the Seas — Dragoncraft follower, 10, 10/10. 海洋.
// This costs 3 less to play from the EX area.
// Rush. Assail.
// If this would take more than 3 damage, it takes 3 instead. (Each time — ruling; CR 5.14.2.)
// Strike - Refresh this. Activate only twice per turn. (CR 10.7.2.2.)
import { defineCard, strike } from "../helpers";

export default defineCard({
  keywords: ["rush", "assail"],
  playCost: (g, self) => (g.playZone(self) === "ex" ? -3 : 0),
  field: { damageTaken: (_g, _self, d) => (d.amount > 3 ? 3 - d.amount : 0) },
  abilities: [
    {
      ...strike({
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "field") yield* fx.refresh([fx.self]);
        },
      }),
      timesPerTurn: 2,
    },
  ],
});
