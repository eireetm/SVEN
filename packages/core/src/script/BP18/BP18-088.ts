// BP18-088 Full Moon of Centennial Demise — Abysscraft spell, 2. 透京・魔界.
// Deal 1 damage to each enemy leader and enemy follower on the field. If there are at least ten 2-cost cards in your
// cemetery, deal 2 damage instead. (元のコスト.)
import { defineCard, spell } from "../helpers";
import { twoCostInCemetery } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const opp = fx.game.opponent(fx.controller);
        yield* fx.dealDamageEach([fx.game.leader(opp), ...fx.game.followers(opp)], twoCostInCemetery(fx.game, fx.controller) >= 10 ? 2 : 1);
      },
    }),
  ],
});
