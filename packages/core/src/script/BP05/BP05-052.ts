// BP05-052 Galmieux, Omen of Disdain — Dragoncraft follower, 5, 5/5. 絶傑・竜族.
// {[evolve]} {[cost02]}: Evolve this follower.
// During your turn, whenever this follower takes ability damage, change its {[evolve]} cost to 0
// for the rest of the turn.
import { defineCard, evolveAbility } from "../helpers";
import { whenTakesAbilityDamageOnYourTurn } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(2),
    whenTakesAbilityDamageOnYourTurn(function* (fx) {
      yield* fx.setEvolveCost(fx.self, 0, "endOfTurn");
    }),
  ],
});
