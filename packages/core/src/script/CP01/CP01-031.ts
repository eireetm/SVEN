// CP01-031 Make! Some! NOISE! — Runecraft spell, 2. ウマ娘.
// {[quick]}
// Select an enemy follower on the field and deal it 3 damage. If there is an Umamusume card on your field, deal 4 damage
// instead.
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { umamusume } from "./shared";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const four = fx.game.cards(fx.controller, "field").some((id) => umamusume(fx.game, id));
        yield* fx.dealDamage(fx.targets[0]![0]!, four ? 4 : 3);
      },
    }),
  ],
});
