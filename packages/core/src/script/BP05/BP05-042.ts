// BP05-042 Iron Staff Mechanic — Runecraft follower, 5, 4/4. 魔法使い・超克.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Search your deck for a card that costs 1 play point, put it into your EX area, then
// shuffle your deck. It costs 1 less to play this turn. (元のコスト: printed cost.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { searchCostOneToEx } from "./shared";

export default defineCard({
  abilities: [evolveAbility(1), fanfare({ resolve: searchCostOneToEx })],
});
