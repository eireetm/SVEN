// BP17-065 Rock Whale — Dragoncraft follower, 4, 3/5. 海洋.
// Ward.
// {[fanfare]} Discard a Marine card: Draw 2 cards. If this was played from the EX area, recover 3 play points. (Played, not
// put onto the field by an ability, CR 5.5.3; CR 10.4.7.4.)
import { discardA } from "../costs";
import { defineCard, enteredByAbility, fanfare } from "../helpers";
import { marine } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      cost: discardA(marine),
      *resolve(fx) {
        yield* fx.draw(2);
        if (fx.game.enteredFrom(fx.self) === "ex" && !enteredByAbility(fx)) yield* fx.recoverPlayPoints(3);
      },
    }),
  ],
});
