// BP09-065 Dragonclad Blademaster — Dragoncraft follower, 2, 3/2. 武闘竜人・キラー.
// {[act]} {[engage]}: Select an enemy follower on the field and deal it 3 damage. Activate only if there
// are at least 3 Draconic Duelist cards on your field. (This card counts; amulets with the trait count
// — ruling.)
import { activated, defineCard } from "../helpers";
import { enemyFollower } from "../targets";
import { countIn, draconicDuelist } from "./shared";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true },
      {
        condition: (g, c) => countIn(g, c, "field", draconicDuelist) >= 3,
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        },
      },
    ),
  ],
});
