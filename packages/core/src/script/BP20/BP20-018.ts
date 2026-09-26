// BP20-018 Bestial Swipe — Forestcraft spell, 2. 獣.
// As an additional cost to play this, you may discard a Beast card.
// -------
// Select an enemy follower on the field and deal it 3 damage. If you paid the additional cost, deal 5 damage instead and
// draw a card. (The draw only if paid; not playable without a target — rulings; CR 10.4.7.3.)
import { discardA } from "../costs";
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { beast } from "./shared";

export default defineCard({
  playOptions: [{ id: "beast", label: "Discard a Beast card", ...discardA(beast) }],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const paid = fx.playOption === "beast";
        yield* fx.dealDamage(fx.targets[0]![0]!, paid ? 5 : 3);
        if (paid) yield* fx.draw(1);
      },
    }),
  ],
});
