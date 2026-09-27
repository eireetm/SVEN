// CP04-063 Inori — Dragoncraft follower, 2, 2/2. プリコネ・ドラゴンズネスト.
// {[ub]} Activate {[engage]} this: Deal 1 damage to each enemy leader and enemy follower on the field. Activate only if Overflow is
// active for you.
// {[evolve]} {[cost01]}: Evolve this.
import { activated, defineCard, evolveAbility, ub } from "../helpers";
import { damageEnemies } from "./shared";

export default defineCard({
  abilities: [
    ub(
      activated(
        { engageSelf: true },
        {
          condition: (g, c) => g.overflow(c),
          *resolve(fx) {
            yield* damageEnemies(fx, 1);
          },
        },
      ),
    ),
    evolveAbility(1),
  ],
});
