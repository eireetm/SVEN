// BP15-113 Gilnelise, Ravenous Craving — Neutral follower, 2, 2/2. 絶傑.
// {[evolve]} {[cost01]}: Evolve this.
// While your leader's defense is 10 or less, this has Drain. (Gained and lost as the defense changes — rulings.)
import { defineCard, evolveAbility } from "../helpers";
import { gilneliseDrain } from "./shared-neutral";

export default defineCard({
  selfKeywords: gilneliseDrain,
  abilities: [evolveAbility(1)],
});
