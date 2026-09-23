// BP01-014 Noble Fairy — Forestcraft follower, 3, 3/3.
// Ward. // {[fanfare]} Combo (3): Select an enemy follower on the field. Destroy it and summon a
// Fairy token on that follower's field. (CR 13.2.1.2: including this card.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      targets: [enemyFollower({ when: (g, c) => g.combo(c, 3) })],
      *resolve(fx) {
        const target = fx.targets[0]![0];
        if (target === undefined) return;
        const owner = fx.game.controller(target);
        yield* fx.destroy([target]);
        yield* fx.summon(["Fairy"], { player: owner }); // CR 9.1.2.1: that field's player
      },
    }),
  ],
});
