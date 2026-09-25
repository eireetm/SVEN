// BP09-026 Dario, Demon Count (Evolved) — Swordcraft follower, 5/5. 指揮官・貴族.
// Assail.
// During your turn, whenever an enemy follower is put from the field into the cemetery, give this
// follower {[attack]}+1/{[defense]}+1. (Tokens too; five at once trigger five times — rulings.)
import { defineCard, whenEnemyFollowerToCemetery } from "../helpers";

export default defineCard({
  keywords: ["assail"],
  abilities: [
    whenEnemyFollowerToCemetery(
      {
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 1);
        },
      },
      { onlyYourTurn: true },
    ),
  ],
});
