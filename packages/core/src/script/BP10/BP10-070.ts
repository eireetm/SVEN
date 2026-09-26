// BP10-070 Gallant Dragonewt — Dragoncraft follower, 2, 2/2. ドラゴニュート・竜族・武装.
// {[fanfare]} Look at the top 2 cards of your deck. You may reveal an Armed card from among them and
// add it to your hand. Put the rest on the bottom of your deck in any order. If there are at least 3
// Armed cards in your cemetery, summon a Draconic Weapon token and recover 1 play point.
import { defineCard, fanfare, lookAtTopCards } from "../helpers";
import { armed, threeArmedInCemetery } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 2, { filter: armed, to: "hand" });
        if (!threeArmedInCemetery(fx.game, fx.controller)) return;
        yield* fx.summon(["Draconic Weapon"]);
        yield* fx.recoverPlayPoints(1);
      },
    }),
  ],
});
