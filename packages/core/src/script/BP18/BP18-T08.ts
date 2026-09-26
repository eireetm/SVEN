// BP18-T08 Righteous Conviction — Havencraft spell token, 1. 透京・信仰.
// Deal damage to each enemy leader equal to the number of Togh Keyoh followers on your field. Give your leader
// {[defense]}+1.
import { defineCard, spell } from "../helpers";
import { toghKeyohFollowers } from "./shared-haven";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const n = toghKeyohFollowers(fx.game, fx.controller);
        if (n > 0) yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), n);
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
