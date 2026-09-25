// BP06-097 Holy Lancer — Havencraft follower, 5, 3/4. 先導.
// {[evolve]} {[cost01]}: Evolve this follower.
// Ward.
// {[fanfare]} If there's another follower with Ward on your field, select an enemy follower on the
// field and deal it 3 damage.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [
        enemyFollower({
          when: (g, c, self) => g.followers(c).some((id) => id !== self && g.info(id).keywords.includes("ward")),
        }),
      ],
      *resolve(fx) {
        const target = fx.targets[0]?.[0];
        if (target !== undefined) yield* fx.dealDamage(target, 3);
      },
    }),
  ],
});
