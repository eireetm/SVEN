// BP14-031 Front Desk Frog (Evolved) — Swordcraft follower, 3/3. 宴楽・盗賊・獣.
// On Evolve - Select an enemy follower on the field. Deal it 2 damage and, if there are at least 3 Festive
// cards in your EX area, draw a card. (Not played without a target — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { countIn, festive } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        if (countIn(fx.game, fx.controller, "ex", festive) >= 3) yield* fx.draw(1);
      },
    }),
  ],
});
