// BP15-087 Crimson Virtue — Abysscraft spell, 2. 魔界.
// This costs 1 less to play if there's a follower on your field with "Yuzuki" in its name.
// When playing this, engage two 2-cost followers on your field: This costs 1 less to play. (Both: 2 less —
// ruling; 元のコスト, reserved ones, CR 10.4.6.)
// ----------
// Select an enemy follower on the field and deal it 4 damage.
import { engageYourCards } from "../costs";
import { defineCard, spell } from "../helpers";
import { and, enemyFollower, isFollower } from "../targets";
import { followerNamedOnField } from "./shared";
import { costs2 } from "./shared-abyss";

export default defineCard({
  playCost: (g, _self, p) => (followerNamedOnField(g, p, "Yuzuki") ? -1 : 0),
  playOptions: [{ id: "engage2", label: "Engage two 2-cost followers on your field: costs 1 less", ...engageYourCards(and(isFollower, costs2), 2), costDelta: -1 }],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
  ],
});
