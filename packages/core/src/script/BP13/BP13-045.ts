// BP13-045 Grimoire Sorcerer (Evolved) — Runecraft follower, 3/3. 魔法使い・禁忌.
// On Evolve - You may put a Mage spell from your hand into your EX area. It costs 3 less to play this turn.
import { defineCard, onEvolve } from "../helpers";
import { and, isSpell } from "../targets";
import { mage } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const spells = fx.game.cards(fx.controller, "hand").filter((id) => and(isSpell, mage)(fx.game, id));
        for (const id of yield* fx.putIntoEx(yield* fx.chooseCards(spells, 0, 1))) yield* fx.changePlayCost(id, -3, "endOfTurn");
      },
    }),
  ],
});
