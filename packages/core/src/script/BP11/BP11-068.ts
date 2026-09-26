// BP11-068 Thunderous Roar — Dragoncraft spell, 2. 竜族.
// {[quick]}
// As an additional cost to play this card, you may discard a {[dragoncraft]} card that costs 7 or more.
// ----------
// Select an enemy follower on the field and deal it 3 damage. If you paid this card's additional cost,
// deal 4 damage instead and draw a card. (Unpaid, no draw — ruling. CR 10.4.7.3.)
import { discardA } from "../costs";
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { bigDragon } from "./shared-dragon";

export default defineCard({
  keywords: ["quick"],
  playOptions: [{ id: "discard", label: "Discard a Dragoncraft card that costs 7 or more", ...discardA(bigDragon) }],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const paid = fx.playOption === "discard";
        yield* fx.dealDamage(fx.targets[0]![0]!, paid ? 4 : 3);
        if (paid) yield* fx.draw(1);
      },
    }),
  ],
});
