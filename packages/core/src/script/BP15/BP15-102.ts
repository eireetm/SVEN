// BP15-102 Adherent of Despair — Havencraft follower, 2, 1/1. 絶傑・狂信.
// {[evolve]} {[cost01]}: Evolve this.
// At the start of each opponent's main phase, select an enemy follower on the field. If this is reserved, the
// selected follower can't attack enemies this turn.
import { defineCard, evolveAbility } from "../helpers";
import { despairLock } from "./shared-haven";

export default defineCard({
  abilities: [evolveAbility(1), despairLock()],
});
