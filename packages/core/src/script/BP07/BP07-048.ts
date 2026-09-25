// BP07-048 Magiblade Witch — Runecraft follower, 2, 2/2. 魔法使い.
// {[evolve]} {[cost01]}: Evolve this follower.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  abilities: [evolveAbility(1)],
});
