// BP01-028 Aurelia, Regal Saber — Swordcraft follower, 5, 4/6.
// Rush. Assail. Ward.
// {[fanfare]} Select an enemy leader. If there are at least 3 cards on their field, give this
// follower +2/+2 and Aura. (Counted when the fanfare is played; EX area not counted — rulings.)
import { defineCard, fanfare } from "../helpers";
import { enemyLeader } from "../targets";

export default defineCard({
  keywords: ["rush", "assail", "ward"],
  abilities: [
    fanfare({
      targets: [enemyLeader()],
      *resolve(fx) {
        const leader = fx.targets[0]![0]!;
        if (fx.game.cards(fx.game.controller(leader), "field").length < 3) return;
        yield* fx.giveStats(fx.self, 2, 2);
        yield* fx.giveKeyword(fx.self, "aura");
      },
    }),
  ],
});
