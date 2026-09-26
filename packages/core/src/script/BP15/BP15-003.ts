// BP15-003 Amataz, Reverse Blader (Evolved) — Forestcraft follower, 3/3. エルフ族・精霊.
// Ward.
// On Evolve - Select an enemy follower on the field and, if there are at least 3 cards in your EX area, destroy
// it. If there are at least 3 Pixie cards, deal 2 damage to its leader. (Pixie cards in your EX area — the
// Japanese text.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { countIn, pixie } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        if (fx.game.cards(fx.controller, "ex").length >= 3) yield* fx.destroy([target]);
        if (countIn(fx.game, fx.controller, "ex", pixie) >= 3) yield* fx.dealDamage(leader, 2);
      },
    }),
  ],
});
