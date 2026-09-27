// CP01-034 Lamplit Training of a Witch-to-Be — Runecraft spell, 1. ウマ娘.
// {[quick]}
// Select an enemy follower on the field and deal it 2 damage. If there is a racing follower on your field, deal 3 damage
// instead. (「出走したフォロワー」: it raced and is linked to a Carrot, CR 14.2.3.1.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const racing = fx.game.followers(fx.controller).some((id) => fx.game.isRacing(id));
        yield* fx.dealDamage(fx.targets[0]![0]!, racing ? 3 : 2);
      },
    }),
  ],
});
