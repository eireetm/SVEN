// BP05-089 Apostle of Repose — Havencraft follower, 3, 2/4. 絶傑・狂信.
// {[evolve]} {[cost02]}: Evolve this follower.
// At the start of each opponent's main phase, recover 1 play point.
import { defineCard, evolveAbility } from "../helpers";
import { recoverOnOpponentsMainPhase } from "./shared";

export default defineCard({
  abilities: [evolveAbility(2), recoverOnOpponentsMainPhase(1)],
});
