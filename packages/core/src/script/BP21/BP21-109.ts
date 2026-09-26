// BP21-109 Sublime Talisman — Havencraft amulet, 2. 信仰.
// When your leader takes ability damage, bury this: Give your leader {[defense]}+4 and draw a card. (CR 10.4.7.4; ability
// damage is any but attack and combat damage; on the opponent's turn too — rulings.)
import { buryThis } from "../costs";
import { defineCard, whenYourLeaderTakesDamage } from "../helpers";

export default defineCard({
  abilities: [
    whenYourLeaderTakesDamage(
      {
        cost: buryThis,
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 4);
          yield* fx.draw(1);
        },
      },
      { ability: true },
    ),
  ],
});
