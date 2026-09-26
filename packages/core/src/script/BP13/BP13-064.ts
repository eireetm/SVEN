// BP13-064 Scalebound Plight — Dragoncraft spell, 1. 竜族.
// As an additional cost to play this card, engage a {[dragoncraft]} follower that costs 7 or more on your
// field. (Only a reserved one can be engaged, CR 5.4.)
// ----------
// Deal 2 damage to each enemy leader. Give your leader {[defense]}+2. Draw 2 cards.
import { defineCard, spell } from "../helpers";
import { and, costAtLeast, isClass } from "../targets";
import { engageFollowers } from "../BP11/shared";

export default defineCard({
  playOptionsRequired: true,
  playOptions: [
    {
      id: "engage",
      label: "Engage a Dragoncraft follower that costs 7 or more on your field",
      ...engageFollowers(and(isClass("Dragoncraft"), costAtLeast(7)), 1),
    },
  ],
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
        yield* fx.giveLeaderDefense(fx.controller, 2);
        yield* fx.draw(2);
      },
    }),
  ],
});
