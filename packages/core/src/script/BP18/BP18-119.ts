// BP18-119 Warped Progress — Neutral spell, 2. 透京.
// {[quick]}
// As an additional cost to play this, discard a Togh Keyoh card. (Not playable without it, nor without a target — rulings.)
// ----------
// Select an enemy follower on the field. Deal it 4 damage, give your leader {[defense]}+1, and draw a card.
import { discardA } from "../costs";
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { toghKeyoh } from "./shared";

export default defineCard({
  keywords: ["quick"],
  playOptionsRequired: true,
  playOptions: [{ id: "discardToghKeyoh", label: "Discard a Togh Keyoh card", ...discardA(toghKeyoh) }],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        yield* fx.giveLeaderDefense(fx.controller, 1);
        yield* fx.draw(1);
      },
    }),
  ],
});
