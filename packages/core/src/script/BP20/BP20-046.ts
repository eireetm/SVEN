// BP20-046 Congregant of Truth — Runecraft follower, 3, 3/3. 絶傑・魔法使い.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} If this wasn't put onto the field from hand, evolve this. (From the EX area too — ruling.)
import { defineCard, evolveAbility } from "../helpers";
import { evolveIfNotFromHand } from "./shared-rune";

export default defineCard({
  abilities: [evolveAbility(1), evolveIfNotFromHand],
});
