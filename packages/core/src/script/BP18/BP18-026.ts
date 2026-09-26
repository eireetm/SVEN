// BP18-026 Darksaber Melissa — Swordcraft follower, 4, 6/4. 指揮官・プリンセス.
// Rush. Assail.
// {[fanfare]} Select an enemy follower on the field. If there are at least 3 cards on its controller's field, destroy it and
// give this Aura and, for the rest of this turn, "This doesn't take damage." (All of it under the condition — Q10, as in
// English.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["rush", "assail"],
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        if (fx.game.cards(fx.game.controller(target), "field").length < 3) return;
        yield* fx.destroy([target]);
        if (fx.game.card(fx.self)?.zone !== "field") return;
        yield* fx.giveKeyword(fx.self, "aura");
        yield* fx.preventDamage(fx.self, "all", "endOfTurn");
      },
    }),
  ],
});
