// BP14-105 Magna Saber — Neutral follower, 5, 4/4. 宴楽・機械・超克・マグナ.
// {[evolve]} {[cost01]}: Evolve this. Activate only if there are at least 3 Festive cards on your field and/or in
// your EX area. (Both zones together — ruling.)
// Ward.
// {[fanfare]} Select an enemy follower on the field and deal it 4 damage.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { countIn, festive } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(1, { condition: (g, p) => countIn(g, p, "field", festive) + countIn(g, p, "ex", festive) >= 3 }),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
  ],
});
