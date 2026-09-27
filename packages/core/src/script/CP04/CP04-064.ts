// CP04-064 Inori (Evolved) — Dragoncraft, 3/3. プリコネ・ドラゴンズネスト.
// {[ub]} Activate {[engage]} this: Deal 1 damage to each enemy leader and enemy follower on the field. Activate only if Overflow is
// active for you.
// On Evolve - Search your deck for a Dragon's Nest card not named Inori, reveal it, add it to your hand, then shuffle.
import { activated, defineCard, onEvolve, ub } from "../helpers";
import { named } from "../targets";
import { damageEnemies, dragonsNest } from "./shared";

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
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => dragonsNest(fx.game, id) && !named("Inori")(fx.game, id));
      },
    }),
  ],
});
