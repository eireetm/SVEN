// BP14-021 Mars, Belligerent Flame (Evolved) — Swordcraft follower, 3/4. 指揮官・星神.
// Bane.
// On Evolve - Select an enemy follower on the field and deal it 2 damage.
// {[lastwords]} Summon a Flame General's Regalia token.
import { defineCard, lastWords, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["bane"],
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.summon(["Flame General's Regalia"]);
      },
    }),
  ],
});
