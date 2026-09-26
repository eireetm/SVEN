// BP15-PR09 Annihilating Onslaught — Forestcraft spell token, 3. 絶傑・狩人.
// If there are at least 6 Hunter cards in your cemetery, deal 6 damage to each enemy leader.
import { defineCard, spell } from "../helpers";
import { countIn, hunter } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        if (countIn(fx.game, fx.controller, "cemetery", hunter) >= 6) yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 6);
      },
    }),
  ],
});
