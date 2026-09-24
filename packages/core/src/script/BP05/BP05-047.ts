// BP05-047 Disciple of Destruction — Runecraft follower, 3, 3/4. 絶傑・アイドル.
// Ward.
// {[fanfare]} If there are at least 3 Idolatry cards on your field, draw 2 cards.
import { defineCard, fanfare } from "../helpers";
import { idolatryOnField } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        if (idolatryOnField(fx.game, fx.controller) >= 3) yield* fx.draw(2);
      },
    }),
  ],
});
