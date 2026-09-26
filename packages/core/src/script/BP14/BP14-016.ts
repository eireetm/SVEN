// BP14-016 Windswept Lancer — Forestcraft follower, 4, 4/4. エルフ族・狩人.
// Assail.
// Strike - Deal 3 damage to each enemy leader. Give this {[attack]}+1/{[defense]}+1.
import { defineCard, strike } from "../helpers";

export default defineCard({
  keywords: ["assail"],
  abilities: [
    strike({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 3);
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
  ],
});
