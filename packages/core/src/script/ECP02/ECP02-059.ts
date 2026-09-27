// ECP02-059 Self-Proclaimed Fan Favorite — Abysscraft spell, 2. デレマス・キュート.
// Choose 1. If there are at least 5 Cute cards in your cemetery, choose up to 2 instead. (1) Select an enemy follower on the field
// and deal it 4 damage. (2) Search your deck for a follower with "Sachiko Koshimizu" in its name, summon it, then shuffle. Give it
// Drain. (3) Put a Magical Item token into your EX area. (Each option once; without an enemy follower (1) can't be chosen — rulings.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { cute, followerNamed, inYourCemetery, magicalItems } from "./shared";

export default defineCard({
  abilities: [
    spell({
      modeCount: (g, c) => (inYourCemetery(g, c, cute) >= 5 ? 2 : 1),
      modes: [
        {
          id: "damage",
          label: "Deal 4 damage to an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 4);
          },
        },
        {
          id: "sachiko",
          label: 'Summon a follower with "Sachiko Koshimizu" in its name from your deck; it gets Drain',
          *resolve(fx) {
            const found = yield* fx.search((id) => followerNamed("Sachiko Koshimizu")(fx.game, id), { to: "field" });
            for (const id of found) if (fx.game.card(id)?.zone === "field") yield* fx.giveKeyword(id, "drain");
          },
        },
        {
          id: "item",
          label: "Put a Magical Item token into your EX area",
          *resolve(fx) {
            yield* magicalItems(fx);
          },
        },
      ],
    }),
  ],
});
