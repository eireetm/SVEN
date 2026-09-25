// BP07-022 Leod, the Crescent Blade — Swordcraft follower, 2, 1/3. 暗殺者.
// {[evolve]} {[cost02]}: Evolve this follower.
// While this follower is reserved on your field, it has Intimidate and Aura. (Engaged while it
// attacks, so it can then be selected — ruling.)
// At the start of your end phase, select an enemy follower on the field and deal it 1 damage.
import { defineCard, evolveAbility } from "../helpers";
import { leodEndPhase, leodKeywords } from "./shared";

export default defineCard({
  field: { keywordsFor: leodKeywords },
  abilities: [evolveAbility(2), leodEndPhase],
});
