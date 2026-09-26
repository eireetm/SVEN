// BP19-096 Warden of the Wings — Havencraft follower, 2, 2/2. 八獄・鳥族.
// {[evolve]} {[cost01]}: Evolve this.
// {[lastwords]} You may summon a 1-cost or less amulet from your hand.
import { defineCard, evolveAbility } from "../helpers";
import { wingsLastWords } from "./shared-haven";

export default defineCard({
  abilities: [evolveAbility(1), wingsLastWords],
});
