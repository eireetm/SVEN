// BP08-040 Lovely Heart Monika — Runecraft follower, 3, 2/3. 魔法使い・魔法生物.
// {[fanfare]} Choose one of the following. (1) Search your deck for a Morra, Monika's Familiar, summon
// it, then shuffle your deck. (2) You may summon a Morra, Monika's Familiar from your hand.
// Activate {[engage]} and a Morra, Monika's Familiar on your field: Select an enemy follower on the
// field and deal it 3 damage. (Engaging the Morra is part of the cost, CR 10.4.6.)
import { engageYourCards } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { and, enemyFollower, inYourZone, isFollower, named } from "../targets";

const morra = and(isFollower, named("Morra, Monika's Familiar"));

export default defineCard({
  abilities: [
    fanfare({
      modes: [
        {
          id: "deck",
          label: "Summon a Morra from your deck",
          *resolve(fx) {
            yield* fx.search((id) => morra(fx.game, id), { to: "field" });
          },
        },
        {
          id: "hand",
          label: "You may summon a Morra from your hand",
          // A card in the hand is always selected "up to" (CR 4.1.2.2), so this is optional.
          targets: [inYourZone("hand", { filter: morra })],
          *resolve(fx) {
            yield* fx.putOntoField(fx.targets[0]!);
          },
        },
      ],
    }),
    activated(
      { engageSelf: true, custom: engageYourCards(morra) },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        },
      },
    ),
  ],
});
