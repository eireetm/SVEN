// BP04-051 Dazzling Healer — Runecraft follower, 2, 2/2. 魔法使い.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} If there is a spell in your cemetery, give your leader +2 defense. (A passive that
// counts followers for Spellchain does not make them spells here — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        if (fx.game.spellsInCemetery(fx.controller) > 0) yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
