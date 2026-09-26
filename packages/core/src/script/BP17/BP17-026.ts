// BP17-026 Killer Instincts — Swordcraft amulet, 3. 兵士・暗殺者・メイド.
// {[fanfare]} Select an enemy follower on the field and destroy it.
// {[act]} {[cost02]}, engage this, bury this: Search your deck for an Erika, Loyal Swordsavant, summon it, then shuffle.
// (Not finding one is allowed — ruling.)
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower, named } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
      },
    }),
    activated(
      { playPoints: 2, engageSelf: true, burySelf: true },
      {
        *resolve(fx) {
          yield* fx.search((id) => named("Erika, Loyal Swordsavant")(fx.game, id), { to: "field" });
        },
      },
    ),
  ],
});
