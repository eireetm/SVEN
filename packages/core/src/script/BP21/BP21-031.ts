// BP21-031 Kitty Sergeant — Swordcraft follower, 4, 2/2. 指揮官・獣.
// {[evolve]} {[cost01]}: Evolve this.
// Whenever another follower is put onto your field, give your leader {[defense]}+1. (Each one; on the opponent's turn too —
// rulings.)
import { defineCard, evolveAbility } from "../helpers";
import { kittyLeader } from "./shared-sword";

export default defineCard({
  abilities: [evolveAbility(1), kittyLeader],
});
