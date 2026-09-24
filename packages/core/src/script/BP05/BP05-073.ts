// BP05-073 Apostle of Silence — Abysscraft follower, 4, 4/4. 絶傑・死霊術師.
// {[evolve]} {[cost01]}: Evolve this follower.
// At the start of your end phase, select an enemy leader. If there are 3 cards or less in its
// controller's hand, deal it 3 damage.
import { defineCard, evolveAbility } from "../helpers";
import { silenceAtEndPhase } from "./shared";

export default defineCard({
  abilities: [evolveAbility(1), silenceAtEndPhase],
});
