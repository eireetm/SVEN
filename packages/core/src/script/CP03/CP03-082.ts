// CP03-082 Lizard Soldier, Conroe — Dragoncraft amulet, 2. ヴァンガード・かげろう.
// Starting Amulet. (All cards with Starting Amulet in your deck must share the same name.) (CR 14.4.4, the engine's.)
// Activate {[engage]}, bury this card: Select an enemy follower on the field and deal it 1 damage. Activate only if there's a
// Kagero follower on your field.
import { activated, defineCard } from "../helpers";
import { enemyFollower } from "../targets";
import { followerThat, kagero } from "./shared";

export default defineCard({
  keywords: ["startingAmulet"],
  abilities: [
    activated(
      { engageSelf: true, burySelf: true },
      {
        condition: (g, c) => g.followers(c).some((id) => followerThat(kagero)(g, id)),
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 1);
        },
      },
    ),
  ],
});
