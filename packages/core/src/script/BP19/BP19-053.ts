// BP19-053 Ultramarine Witch — Runecraft follower, 5, 3/3. 魔法使い.
// Storm.
// {[fanfare]} Select an enemy follower on the field and deal it 4 damage.
// {[act]} {[cost01]}, discard this: Search your deck for a Witch's Cauldron, summon it, then shuffle. (Valid in the hand —
// ruling.)
import { discardThis } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower, named } from "../targets";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
    activated(
      { playPoints: 1, custom: discardThis },
      {
        validIn: ["hand"],
        *resolve(fx) {
          yield* fx.search((id) => named("Witch's Cauldron")(fx.game, id), { to: "field" });
        },
      },
    ),
  ],
});
