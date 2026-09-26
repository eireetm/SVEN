// BP16-075 Cerberus, Hellfire Unleashed — Abysscraft follower, 4, 3/3. 魔界.
// {[fanfare]} Summon a Mimi, Right Paw Hellhound and Coco, Left Paw Hellhound token. Necrocharge (10) - Give them
// Storm. (Both of them; with room for one, the player picks — rulings. CR 13.5.1.3.2: counted as it begins.)
// Activate {[engage]} this, bury another follower: Select an enemy follower on the field and deal it 2 damage. (A
// follower on your field, CR 10.4.3.)
import { buryAnotherFromYourField } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower, isFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const nc = fx.game.necrocharge(fx.controller, 10);
        const hounds = yield* fx.summon(["Mimi, Right Paw Hellhound", "Coco, Left Paw Hellhound"]);
        if (!nc) return;
        for (const id of hounds) if (fx.game.card(id)?.zone === "field") yield* fx.giveKeyword(id, "storm");
      },
    }),
    activated(
      { engageSelf: true, custom: buryAnotherFromYourField(isFollower) },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        },
      },
    ),
  ],
});
